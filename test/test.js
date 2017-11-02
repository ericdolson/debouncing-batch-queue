const DBBQ = require('../index');
const assert = require('assert');

describe('DBBQ', () => {
  describe('#add() where timeout is 1000 and maxBatchSize is 2', () => {
    const dbbq = new DBBQ(1000, 2);
    const results = [
      [0, 1],
      [2, 3],
      [4]
    ];

    let i = 0;
    let resultIndex = 0;

    it('Should get the first 2 results immediately and a delay on the last', (done) => {
      dbbq.on('data', (data) => {
        ((index) => {
          assert.equal(JSON.stringify(data.reduce((a, e) => a.concat(e[0]), [])), JSON.stringify(results[index]));

          const now = Date.now();
          const difference = Math.abs(now - data[0][1]);

          if (index < 2) {
            // Should arrive immediately
            assert.ok(difference >= 0 && difference < 10);
          } else {
            // Should arrive after 1000ms
            assert.ok(difference >= 1000 && difference < 1010);
            done();
          }
        })(resultIndex++);
      });

      for (; i < 5; i++) {
        dbbq.add([i, Date.now()]);
      }
    });
  });

  describe('#add() where timeout is -1 and maxBatchSize is 4', () => {
    const dbbq = new DBBQ(-1, 4);
    const results = [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [8],
    ];

    let i = 0;
    let resultIndex = 0;
    let receivedAfterLast = false;
    let exposeAssert;

    it('Should get the first 2 results immediately and never get the last', (done) => {
      exposeAssert = () => {
        assert.ok(!receivedAfterLast);
        done();
      };

      dbbq.on('data', (data) => {
        ((index) => {
          assert.equal(JSON.stringify(data.reduce((a, e) => a.concat(e[0]), [])), JSON.stringify(results[index]));

          const now = Date.now();
          const difference = Math.abs(now - data[0][1]);

          if (index < 2) {
            // Should arrive immediately
            assert.ok(difference >= 0 && difference < 10);
          } else {
            receivedAfterLast = true;
          }
        })(resultIndex++);
      });

      for (; i < 9; i++) {
        if (i === 8) {
          setTimeout(() => {
            exposeAssert();
          }, 1500);
        }

        dbbq.add([i, Date.now()]);
      }
    });
  });
});

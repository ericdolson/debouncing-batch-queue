const EventEmitter = require('events').EventEmitter;

module.exports = class DebouncingBatchQueue extends EventEmitter {
  constructor(timeout, maxBatchSize) {
    super();

    this._timeout = typeof timeout === 'number' ? timeout : -1;
    this._maxBatchSize = typeof maxBatchSize === 'number' ? maxBatchSize : -1;
    this._queues = {};
  }

  add(data, namespace) {
    const q = this._queues[namespace] || { data: [] };
    this._queues[namespace] = q;

    clearTimeout(q.timeout);

    q.data.push(data);

    if ((this._maxBatchSize < 0 && this._timeout < 0) || (this._maxBatchSize >= 0 && q.data.length >= this._maxBatchSize)) {
      this._drainQueue(namespace);
    } else if (this._timeout >= 0) {
      q.timeout = setTimeout(() => {
        this._drainQueue(namespace);
      }, this._timeout);
    }
  }

  _drainQueue(namespace) {
    const q = this._queues[namespace] || { data: [] };
    delete this._queues[namespace];
    this.emit('data', q.data, namespace);
  }
};

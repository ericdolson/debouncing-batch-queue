# Debouncing batch queue

A queue which will emit and clear its contents when its size, timeout, or both are reached.

Namespaces can be used to
utilize multiple internal queues with each maintaining its own debounce timer and max batch size threshold. 

## Installation

`npm i -S debouncing-batch-queue`

## Usage

Simple:

```javascript
const DBBQ = require('debouncing-batch-queue');
const dbbq = new DBBQ(1000, 2);  // 1000ms debounce timeout and max batch size of 2
 
dbbq.on('data', (data) => {
  console.log('Data:', data);
});
 
dbbq.add('ribs 0');
dbbq.add('ribs 1');
dbbq.add('ribs 2');
 
// log...
// Data: [ 'ribs 0', 'ribs 1' ]  <-- reached max size and emitted immediately
// Data: [ 'ribs 2' ]            <-- was below max size and emitted after timeout
````

More complex with namespaces:

```javascript
const DBBQ = require('debouncing-batch-queue');
const dbbq = new DBBQ(1000, 2);  // 1000ms debounce timeout and max batch size of 2
 
dbbq.on('data', (data, namespace) => {
  console.log('Data:', data, 'Namespace:', namespace);
});
 
dbbq.add('ribs 0');
dbbq.add('ribs 1');
dbbq.add('ribs 2');
dbbq.add('ribs 3');
dbbq.add('ribs 4');
dbbq.add('more ribs', 'bbq1');
dbbq.add('more ribs', 'bbq1');
dbbq.add('brisket', 'best bbq namespace');
 
// log...
// Data: [ 'ribs 0', 'ribs 1' ] Namespace: undefined     <-- reached max size and emitted immediately
// Data: [ 'ribs 2', 'ribs 3' ] Namespace: undefined     <-- reached max size and emitted immediately
// Data: [ 'more ribs', 'more ribs' ] Namespace: bbq1    <-- reached max size and emitted immediately
// Data: [ 'ribs 4' ] Namespace: undefined               <-- was below max size and emitted after timeout
// Data: [ 'brisket' ] Namespace: another bbq namespace  <-- was below max size and emitted after timeout
```

## API

### #constructor(timeout, maxBatchSize)

#### timeout

*Default: -1*

This is the delay in milliseconds for debouncing before the queue will be emitted and cleared.
Any number less than 0 is viewed as infinite, i.g. there will never be a timer which will drain the queue.

#### maxBatchSize

*Default: -1*

This is the maximum qty of data that the queue will hold before the queue is emitted and cleared.
Any number less than 0 is viewed as infinite, i.g. the queue can grow to an unlimited size.

---

*Note:* If both parameters are given or resolve to < 0, then the queue will immediately emit and clear after every single data added.
This is to prevent the queue in this configuration to never emit and clear.

### #add(data, namespace)

#### data

*required*

This is what will be added to the queue.

#### namespace

*optional*

When calling `#add(data, namespace)`, each namespace (or the default of no namespace given) is
treated as a separate queue. Each namespace maintains its own debouncing timeout and maxBatchSize
for the data it contains.

### #instance.on('data', (data, namespace) => {})

onData is the event to listen for when the queue is being cleared. The queue clears itself when the debouncing timeout
fires or it has reach it maximum capacity.

#### data

Data is an array where each entry within it contains whatever was given from each `#add(data)` call before the event is fired.
The order of the `#add(data)` calls is maintained in the emitted data array.

#### namespace

This is the namespace of the emitted queue. If namespaces are being used, this will be handy to keep track
of what namespaced queue has just been emitted.

If the default queue (no namespace) is emitted, this value will be `undefined`. 


var sinq = (function() {

  // 0 consume
  // 1 signal stop consume
  var STATUS = 0;

  // 0 is un-locked
  // 1 is locked
  var LOCK = 0;
  var queue = [];

  // locks queue for synchronization
  function lock() {
    LOCK = 1;
  }

  function unlock() {
    LOCK = 0;
  }

  function tryGetTask() {
    if (LOCK === 0 && queue.length > 0) {
      return queue.shift();
    }
  }

  // task => {
  //    payload: asyncTask,
  //    callback: Func
  // }
  function execute(task) {
    payload.asyncTask()
      .then(function(data) {
        console.log('done with data: ', data);
        task.callback(data);
      })
      .catch(function(data) {
        console.error('ERROR in execute');
      })
      .finally(function() {
        console.log('execution done');
        unlock();
      }.bind(this));
  }

  function startConsumingQueue() {
    STATUS = 0;
    consumer();
  }

  function stopConsumingQueue() {
    STATUS = 1;
  }

  function consumer() {
    if (STATUS === 1) {
      return; // stop
    }

    var task = tryGetTask();
    if (task) {
      lock();
      execute(task);
    }

    setTimeout(consumer, 0);
  }

  return {
    addTask: function(task) {
      queue.push(task);
    },
    start: function() {
      startConsumingQueue();
    },
    stop: function() {
      stopConsumingQueue();
    }
  };
})();

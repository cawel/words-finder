var BenchmarkTimer = function() {
  var startedAt = null;
  var stoppedAt = null;

  var start = function() {
    this.stoppedAt = null;
    this.startedAt = new Date();
  };

  var stop = function() {
    this.stoppedAt = new Date();
  };

  var getTime = function() {
    if (!this.stoppedAt) { this.stop(); }
    return this.stoppedAt.getTime() - this.startedAt.getTime();
  };

  // exporting the module interface
  return {
    start: start, 
    stop: stop, 
    getTime: getTime
  };
};

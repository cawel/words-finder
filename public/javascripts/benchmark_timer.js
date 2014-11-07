'use strict'

var BenchmarkTimer = function() {

  var startedAt;
  var stoppedAt; 

  var start = function() {
    stoppedAt = null;
    startedAt = new Date();
  };

  var stop = function() {
    stoppedAt = new Date();
  };

  var getTime = function() {
    if (!stoppedAt) { stop(); }
    return stoppedAt.getTime() - startedAt.getTime();
  };

  // exporting public interface
  return {
    start: start, 
    stop: stop, 
    getTime: getTime
  };
};

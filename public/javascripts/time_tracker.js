'use strict';

var TimeTracker = function() {

  var startedAt;
  var stoppedAt;

  var start = function() {
    stoppedAt = null;
    startedAt = Date.now();
  };

  var stop = function() {
    stoppedAt = Date.now();
  };

  var getTime = function() {
    if (!stoppedAt) { stop(); }
    return stoppedAt - startedAt;
  };

  var trackTime = function(callback){
    start();
    callback();
    stop();
    return getTime();
  };

  // exporting public interface
  return {
    start: start,
    stop: stop,
    getTime: getTime,
    trackTime: trackTime
  };
};

'use strict';

var TimeTracker = function() {

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

  var trackTime = function(callback){
    start();
    callback.call();
    stop();
    return getTime();
  };

  // exporting public interface
  return {
    trackTime: trackTime
  };
};

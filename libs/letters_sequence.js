'use strict';

var LettersSequence = function(pos){
  var positions = pos.slice(0);

  var getPositions = function(){
    return positions;
  };

  var addPosition = function(position){
    positions.push(position);
  };

  var getLastPosition = function(){
    return positions[positions.length - 1];
  };

  var getLetters = function(lettersMatrix){
    return positions.reduce(function(letters, position){
      return letters + lettersMatrix[ position[0] ][ position[1] ];
    }, "");
  };

  var positionExists = function(position){
    return positions.some(function(e){
      return (e[0] == position[0] && e[1] == position[1]);
    });
  };

  var longEnough = function(){
    return positions.length > 2;
  };

  var toJSON = function(){
    return JSON.stringify(positions);
  };

  // export public interface
  return {
    toJSON:           toJSON,
    getPositions:     getPositions,
    addPosition:      addPosition,
    getLastPosition:  getLastPosition,
    getLetters:       getLetters,
    positionExists:   positionExists,
    longEnough:       longEnough
  };
}

module.exports = LettersSequence;

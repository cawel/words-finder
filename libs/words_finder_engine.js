var fs = require('fs');
var LettersSequence = require('./letters_sequence');
var _ = require('lodash');

var lettersMatrix;
var dimension;
var referenceWordsList;
var serializedSequences;
var sequences;

var directions = {
  'up':         [ 0, -1],
  'up-right':   [ 1, -1],
  'right':      [ 1,  0],
  'right-down': [ 1,  1],
  'down':       [ 0,  1],
  'down-left':  [-1,  1],
  'left':       [-1,  0],
  'left-up':    [-1, -1]
};

function getReferenceWordsList(){
  var data = fs.readFileSync('data/dict_en.txt');
  return data.toString().split(/\W+/);
}

function getSerializedSequences(callback) {
  fs.readFile('data/3-4-5-6-7-letter-sequences.json', function (err, data) {
    if (err) {
      callback(err);
      return;
    }
    callback(null, JSON.parse(data, function (key, value) {
      if (value instanceof Array) {
        return value;
      } else {
        return LettersSequence(JSON.parse(value));
      }
    }));
  });
}

function findAllLettersSequences(){
  var sequences = [];
  for(var i = 0; i < getDimension(); i++){
    for(var j = 0; j < getDimension(); j++){
      sequences = sequences.concat( radiatedSequences( [[i, j]] ));
    }
  }

  // max of 6-letter words for now (otherwise too slow)
  var threeLetterWords = sequences.reduce(function(memo, c){
    return memo.concat( radiatedSequences(c.getPositions()) );
  }, []);

  var fourLetterWords = threeLetterWords.reduce(function(memo, c){
    return memo.concat( radiatedSequences(c.getPositions()) );
  }, []);

  console.log('about to generate 5-letter sequences');
  var fiveLetterWords = fourLetterWords.reduce(function(memo, c){
    return memo.concat( radiatedSequences(c.getPositions()) );
  }, []);
  console.log('about to generate 6-letter sequences');

  var sixLetterWords = fiveLetterWords.reduce(function(memo, c){
    return memo.concat( radiatedSequences(c.getPositions()) );
  }, []);
  console.log('about to generate 7-letter sequences');

  var sevenLetterWords = sixLetterWords.reduce(function(memo, c){
    return memo.concat( radiatedSequences(c.getPositions()) );
  }, []);

  return sequences.concat(threeLetterWords, fourLetterWords, fiveLetterWords, sixLetterWords, sevenLetterWords);
}

function getLettersMatrix(){
  return lettersMatrix;
}

function getDimension(){
  return dimension;
}

function removeLongSequences(sequences){
  return sequences.filter(function(w){
    return w.longEnough();
  });
}

function removeDuplicateSequences(sequences) {
  return _.uniq(sequences, function (sequence) {
    return sequence.getLetters(getLettersMatrix());
  });
}

function binarySearch(array, key) {
  var lo = 0,
  hi = array.length - 1,
  mid, element;

  while (lo <= hi) {
    mid = ((lo + hi) >> 1);
    element = array[mid];
    if (element < key) {
      lo = mid + 1;
    } else if (element > key) {
      hi = mid - 1;
    } else {
      return mid;
    }
  }
  return -1;
}

function keepExistingSequences(sequences){
  return sequences.filter(function(sequence) {
    return binarySearch(referenceWordsList, sequence.getLetters(getLettersMatrix()) ) != -1;
  });
}

function sortSequences(sequences){
  return sequences.sort(function(comb1, comb2){
    if ( comb1.getLetters(getLettersMatrix()) > comb2.getLetters(getLettersMatrix()) ){
      return 1;
    }else{
      return -1;
    }
  });
}

function insideMatrix(position){
  return (position[0] > -1 && position[1] > -1 && position[0] < getDimension() && position[1] < getDimension() );
}

function addLetter(sequence, direction){
  var current_position = sequence.getLastPosition();
  var new_position = [current_position[0] + direction[0], current_position[1] + direction[1]];
  if( insideMatrix(new_position) && !sequence.positionExists(new_position)){
    sequence.addPosition(new_position);
    return sequence;
  }
}

function radiatedSequences(positions){
  var sequences = [];

  for(var d in directions){
    var candidate = addLetter( LettersSequence(positions), directions[d] );
    if(candidate){
      sequences.push(candidate);
    }
  }
  return sequences;
}


// exports public interface

exports.initialize = function initialize(){
  referenceWordsList = getReferenceWordsList();
  getSerializedSequences(function (err, data) {
    if (err) { throw err; }
    serializedSequences = data;
    console.log('serializedSequences ready!');
  });
};

exports.findWords = function(lettersMat){
  dimension = lettersMat.length;
  lettersMatrix = lettersMat;

  //sequences = serializedSequences.slice(); -- no need, keepExistingSequences will make a copy
  sequences = keepExistingSequences(serializedSequences);
  sequences = removeDuplicateSequences(sequences);
  sequences = sortSequences(sequences);

  return sequences.map(function(s){
    return [s.getLetters(getLettersMatrix()), s.getPositions()];
  });
};

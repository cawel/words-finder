'use strict';

function LettersGrid(){
  var lettersMatrix;
  var alphabet = 'abcdefghijklmnopqrstuvwxyz';
  var dimension = 5;
  var referenceWordsList;

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

  function randomLetter(){
    var random = Math.ceil( (Math.random() * (alphabet.length - 1)) );
    return alphabet[random];
  }

  function getDimension(){
    return dimension;
  }

  function setReferenceWordsList(wordsList){
    referenceWordsList = wordsList.sort();
  }

  function findWords(){
    lettersMatrix = null;
    var sequences = findAllLettersSequences();
    sequences = removeLongSequences(sequences);
    sequences = keepExistingWords(sequences);
    sequences = removeDupes(sequences);
    sequences = sortSequencesList(sequences);

    return sequences;
  }

  function findAllLettersSequences(){
    var sequences = [];
    for(var i = 0; i < dimension; i++){
      for(var j = 0; j < dimension; j++){
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

    var fiveLetterWords = fourLetterWords.reduce(function(memo, c){
      return memo.concat( radiatedSequences(c.getPositions()) );
    }, []);

    var sixLetterWords = fiveLetterWords.reduce(function(memo, c){
      return memo.concat( radiatedSequences(c.getPositions()) );
    }, []);

    return sequences.concat(threeLetterWords, fourLetterWords, fiveLetterWords, sixLetterWords);
  }

  function getLettersMatrix(){
    if(!lettersMatrix){
      lettersMatrix = buildLettersMatrix();
    }
    return lettersMatrix;
  }

  function buildLettersMatrix(){
    var letters = jQuery.makeArray($('input')).map(function(el){
      return $(el).val();
    });
    var lettersMatrix = [];
    for(var i=0; i < dimension; i++){
      lettersMatrix[i] = new Array(dimension);
      for(var j=0; j < dimension; j++){
        lettersMatrix[i][j] = letters[j*dimension + i];
      }
    }
    return lettersMatrix;
  }

  function removeLongSequences(sequences){
    return sequences.filter(function(w){
      return w.longEnough();
    });
  }

  function removeDupes(sequences){
    var set = [];
    var word;
    return sequences.filter(function(sequence) {
      word = sequence.getLetters( getLettersMatrix() );
      if( set.indexOf(word) == -1 ) {
        set.push(word);
        return true;
      }else{
        return false;
      }
    });
  }

  function binarySearch(array, key) {
    var lo = 0,
    hi = array.length - 1,
    mid,
      element;
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

  function keepExistingWords(sequences){
    return sequences.filter(function(sequence) {
      return binarySearch(referenceWordsList, sequence.getLetters(getLettersMatrix()) ) != -1;
    });
  }

  function sortSequencesList(sequences){
    return sequences.sort(function(comb1, comb2){
      if ( comb1.getLetters(getLettersMatrix()) > comb2.getLetters(getLettersMatrix()) ){
        return 1;
      }else{
        return -1;
      }
    });
  }
   
  function insideMatrix(position){
    return (position[0] > -1 && position[1] > -1 && position[0] < dimension && position[1] < dimension );
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

  // export public interface
  return {
    setReferenceWordsList:  setReferenceWordsList,
    getLettersMatrix:       getLettersMatrix,
    findWords:              findWords,
    randomLetter:           randomLetter,
    getDimension:           getDimension
  };
}

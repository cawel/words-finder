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
    var combinations = findAllLettersCombinations();
    combinations = removeLongCombinations(combinations);
    combinations = keepExistingWords(combinations);
    combinations = removeDupes(combinations);
    combinations = sortCombinationsList(combinations);

    return combinations;
  }

  function findAllLettersCombinations(){
    var combinations = [];
    for(var i = 0; i < dimension; i++){
      for(var j = 0; j < dimension; j++){
        combinations = combinations.concat( spread( LettersCombination([[i, j]]) ));
      }
    }

    // max of 5-letter words for now (otherwise too slow)
    for(i = 0; i < 3; i++){
      combinations = combinations.reduce(function(memo, c){
        return memo.concat(spread(c));
      }, combinations);
    }
    return combinations;
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

  function removeLongCombinations(combinations){
    return combinations.filter(function(w){
      return w.longEnough();
    });
  }

  function removeDupes(combinations){
    var set = [];
    var word;
    return combinations.filter(function(combination) {
      word = combination.getLetters( getLettersMatrix() );
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

  function keepExistingWords(combinations){
    return combinations.filter(function(combination) {
      return binarySearch(referenceWordsList, combination.getLetters(getLettersMatrix()) ) != -1;
    });
  }

  function sortCombinationsList(combinations){
    return combinations.sort(function(comb1, comb2){
      if ( comb1.getLetters(getLettersMatrix()) > comb2.getLetters(getLettersMatrix()) ){
        return 1;
      }else{
        return -1;
      }
    });
  }

  function move(word, direction){
    var current_position = word.getLastPosition();
    var new_position = [current_position[0] + direction[0], current_position[1] + direction[1]];
    if( insideMatrix(new_position) && !word.positionExists(new_position)){
      word.addPosition(new_position);
      return word;
    }
  }
   
  function insideMatrix(position){
    return (position[0] > -1 && position[1] > -1 && position[0] < dimension && position[1] < dimension );
  }

  function spread(combination){
    var spreadedCombinations = [];
    for(var d in directions){
      var candidate = move( LettersCombination(combination.getPositions()), directions[d] );
      if(candidate){
        spreadedCombinations.push( candidate );
      }
    }
    return spreadedCombinations;
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



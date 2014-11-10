"use strict";

$( document ).ready(function(){

  var app = WordsFinderApp();
  app.initialize();

});


var WordsFinderApp = function(){
  var letterGrid;

  var initialize = function(){
    $("input").attr("maxlength", 1);
    letterGrid = LetterGrid();
    fetchEnglishReferenceWordsList();
    registerEventListeners();
  };

  var registerEventListeners = function(){

    $("#randomizer").click(function(event){
      $('.results').hide();
      $.makeArray($('input')).forEach(function(el){
        $(el).val( letterGrid.randomLetter() );
      });
    });

    $("#finder").click(function(event){
      $('#randomizer').attr('disabled', 'disabled');
      $('#finder').attr('disabled', 'disabled');
      $('.results').hide();
      $('.loading').show();

      setTimeout(function(){
        var timer = BenchmarkTimer();
        timer.start();
        var words = letterGrid.findWords();
        timer.stop();
        showWordsFound(words);
        $('.loading').hide();
        $('.benchmark span').html( timer.getTime() );
        $('#finder').removeAttr('disabled');
        $('#randomizer').removeAttr('disabled');
      }, 10);

      return false;
    });

    $('.words').on('mouseenter', 'span', function(event){
      var el = $(event.target);
      el.addClass('highlight-word');
      toggleLettersHighlight( el.data('positions'), true);
    });

    $('.words').on('mouseleave', 'span', function(event){
      var el = $(event.target);
      el.removeClass('highlight-word');
      toggleLettersHighlight( el.data('positions'), false);
    });
  };

  function toggleLettersHighlight(positions, highlight){
    positions = positions.toString();
    fetchLetterElements( positions ).map(function(el){
      el.toggleClass('highlight-letter', highlight);
    });
  }

  function fetchLetterElements(positions){
    var inputs = $('input');
    var length = positions.length;
    var letterElements = [];
    for(var i = 0; i < length; i += 2){
      letterElements.push( $(inputs[parseInt(positions[i], 10) + letterGrid.getDimension() * parseInt(positions[i+1], 10)]) );
    }
    return letterElements;
  }


  function showWordsFound(words){
    $('.results').show();
    $('.results h2 span').html(words.length);
    $('.words').empty();
    var list = $('.words');
    var count = words.length;
    words.forEach(function(word){
      var word_el = $('<span />').data('positions', word.getPositions().toString().replace(/,/g, '') ).html( word.getLetters(letterGrid.getLetterMatrix()) );
      list.append(word_el);
      words.indexOf(word) == (count - 1) ? list.append('.') : list.append(', ');
    });
  }

  function fetchEnglishReferenceWordsList(){
    $.get('/dict_en', function(response){
      letterGrid.setReferenceWordsList(response);
      $('#finder').removeAttr('disabled');
    });
  }

  // export public interface
  return {
    initialize: initialize
  };
};


function LetterGrid(){
  var letterMatrix;
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
    referenceWordsList = wordsList;
  }

  function findWords(){
    var words = findAllLetterCombinations();
    words = removeLongWords(words);
    words = removeDupes(words);
    words = keepExistingWords(words);
    words = sortWordsList(words);

    return words;
  }

  function findAllLetterCombinations(){
    var words = [];
    for(var i = 0; i < dimension; i++){
      for(var j = 0; j < dimension; j++){
        spread( words, Word([[i, j]]) );
      }
    }

    // max of 4-letter words for now (otherwise too slow)
    for(i = 0; i < 2; i++){
      words.forEach(function(e){
        spread( words, e );
      });
    }
    return words;
  }

  function getLetterMatrix(){
    if(!letterMatrix){
      buildLetterMatrix();
    }
    return letterMatrix;
  }

  function buildLetterMatrix(){
    var letters = jQuery.makeArray($('input')).map(function(el){
      return $(el).val();
    });
    // dimension = Math.sqrt( letters.length );
    letterMatrix = new Array(dimension);
    for(var i=0; i < dimension; i++){
      letterMatrix[i] = new Array(dimension);
      for(var j=0; j < dimension; j++){
        letterMatrix[i][j] = letters[j*dimension + i];
      }
    }
  }

  function removeLongWords(words){
    return words.filter(function(w){
      return w.longEnough();
    });
  }

  function removeDupes(words){
    var set = [];
    var word;
    return words.filter(function(item) {
      word = item.getLetters(getLetterMatrix());
      if( set.indexOf(word) == -1 ) {
        set.push( word );
        return true;
      }else{
        return false;
      }
    });
  }

  function keepExistingWords(words){
    return words.filter(function(item) {
      return referenceWordsList.indexOf(item.getLetters(getLetterMatrix())) != -1;
    });
  }

  function sortWordsList(words){
    return words.sort(function(item1, item2){
      if ( item1.getLetters(getLetterMatrix()) > item2.getLetters(getLetterMatrix()) ){
        return 1;
      }else{
        return -1;
      }
    });
  }

  function move(word, direction){
    var current_position = word.getLastPosition();
    var new_position = [current_position[0] + direction[0], current_position[1] + direction[1]];
    if( insideMatrix(new_position) && !word.beenThere(new_position)){
      word.addPosition(new_position);
      return word;
    }
  }
   
  function insideMatrix(position){
    return (position[0] > -1 && position[1] > -1 && position[0] < dimension && position[1] < dimension );
  }

  function spread(words, word){
    for(var d in directions){
      var candidate = move( Word(word.getPositions()), directions[d] );
      if( candidate != undefined ){
        words.push( candidate );
      }
    }
  }

  // export public interface
  return {
    setReferenceWordsList:  setReferenceWordsList,
    getLetterMatrix:        getLetterMatrix,
    findWords:              findWords,
    randomLetter:           randomLetter,
    getDimension:           getDimension
  };
}


function Word(pos){
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

  var getLetters = function(matrix){
    var chars = positions.map(function(e){
      return matrix[e[0]][e[1]];
    });
    return chars.join('');
  };

  var beenThere = function(position){
    var found = false;
    positions.forEach(function(e){
      if(e[0] == position[0] && e[1] == position[1]){
        found = true;
      }
    });
    return found;
  };

  var longEnough = function(){
    return positions.length > 2;
  };

  // export public interface
  return {
    getPositions:     getPositions,
    addPosition:      addPosition,
    getLastPosition:  getLastPosition,
    getLetters:       getLetters,
    beenThere:        beenThere,
    longEnough:       longEnough
  };
}

$( document ).ready(function(){

  var app = WordsFinder();
  app.initialize();

});


var WordsFinder = function(){

  var matrix;
  var alphabet = 'abcdefghijklmnopqrstuvwxyz';
  var dimension;
  var dict_en = {};

  var initialize = function(){
    $("input").attr("maxlength", 1);
    fetchEnglishDictionary();
    registerEventListeners();
  };

  var registerEventListeners = function(){

    $("#randomizer").click(function(event){
      $('.results').hide();
      $.makeArray($('input')).forEach(function(el){
        var random = Math.ceil( (Math.random() * (alphabet.length - 1)) );
        $(el).val( alphabet[random] );
      });
    });

    $("#finder").click(function(event){
      // can't make it work properly :(
      // $('.loading').show();

      var timer = BenchmarkTimer();
      timer.start();
      var words = findWords();
      timer.stop();
      showWordsFound(words);
      $('.benchmark').html('Results found in: ' + timer.getTime() + ' ms');

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

  function findWords(){
    buildLetterMatrix();

    var words = findAllLetterCombinations();
    words = removeLongWords(words);
    words = removeDupes(words);
    words = keepExistingWords(words);
    words = sortWordsList(words);

    return words;
  }

  function findAllLetterCombinations(){
    var words = [];
    for(i = 0; i < dimension; i++){
      for(j = 0; j < dimension; j++){
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

  function buildLetterMatrix(){
    var letters = jQuery.makeArray($('input')).map(function(el){
      return $(el).val();
    });
    dimension = Math.sqrt( letters.length );
    matrix = new Array(dimension);
    for(var i=0; i < dimension; i++){
      matrix[i] = new Array(dimension);
      for(var j=0; j < dimension; j++){
        matrix[i][j] = letters[j*dimension + i];
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
      word = item.getLetters(matrix);
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
      return dict_en.indexOf(item.getLetters(matrix)) != -1;
    });
  }

  function sortWordsList(words){
    return words.sort(function(item1, item2){
      if ( item1.getLetters(matrix) > item2.getLetters(matrix) ){
        return 1;
      }else{
        return -1;
      }
    });
  }

  function showWordsFound(words){
    $('.results').show();
    $('.results h2').html('Words found: ' + words.length);
    $('.words').empty();
    var list = $('.words');
    var count = words.length;
    words.forEach(function(word){
      list.append("<span data-positions='"+ word.getPositions().toString().replace(/,/g, '') +"'>" + word.getLetters(matrix) + '</span>');
      words.indexOf(word) == (count - 1) ? list.append('.') : list.append(', ');
    });
  }

  function fetchLetterElements( positions ){
    var inputs = $('input');
    var length = positions.length;
    var letters = [];
    for(var i = 0; i < length; i += 2){
      letters.push( $(inputs[parseInt(positions[i], 10) + dimension * parseInt(positions[i+1], 10)]) );
    }
    return letters;
  }

  function toggleLettersHighlight( positions, highlight ){
    positions = positions.toString();
    fetchLetterElements( positions ).map(function(l){
      if (highlight){
        l.addClass('highlight-letter');
      }else{
        l.removeClass('highlight-letter');
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
    for(d in directions){
      var candidate = move( Word(word.getPositions()), directions[d] );
      if( candidate != undefined ){
        words.push( candidate );
      }
    }
  }

  function fetchEnglishDictionary(){
    $.get('/dict_en', null, function(response){
      dict_en = response;
      $('#finder').removeAttr('disabled');
    });
  }

  // export public interface
  return {
    initialize: initialize
  };
};


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
  var fillWithLetters = function(matrix){
    var chars = positions.map(function(e){
      return matrix[e[0]][e[1]];
    });
    return chars.join('');
  };
  var getLetters = function(matrix){
    if(!this.letters){
      this.letters = this.fillWithLetters(matrix);
    }
    return this.letters;
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
    fillWithLetters:  fillWithLetters,
    getLetters:       getLetters,
    beenThere:        beenThere,
    longEnough:       longEnough
  };
}

$( document ).ready(function(){

  var app = WordsFinder();
  app.start();

});


var WordsFinder = function(){

  var matrix = undefined;
  var alphabet = 'abcdefghijklmnopqrstuvwxyz';
  var dimension = undefined;
  var dict_en = {};
  var timer = BenchmarkTimer();

  var start = function(){
    $("input").attr("maxlength", 1);
    fetchEnglishDictionary();
    registerEventListeners();
  };

  var registerEventListeners = function(){

    $("#ramdomizer").click(function(event){
      $('.results').hide();
      $.makeArray($('input')).forEach(function(el){
        var random = Math.ceil( (Math.random() * (alphabet.length - 1)) );
        $(el).val( alphabet[random] );
      });
    });

    $("#finder").click(function(event){
      // can't make it work properly :(
      // $('.loading').show();

      timer.start();

      var words = findWords();

      timer.stop();

      showWordsFound(words);
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
        spread( words, new Word([[i, j]]) );
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
      list.append("<span data-positions='"+ word.positions.toString().replace(/,/g, '') +"'>" + word.getLetters(matrix) + '</span>');
      words.indexOf(word) == (count - 1) ? list.append('.') : list.append(', ');
    });
    $('.benchmark').html('Results found in: ' + timer.getTime() + ' ms');
  }

  function fetchLetterElements( positions ){
    var inputs = $('input');
    var length = positions.length;
    var letters = [];
    for(var i = 0; i < length; i += 2){
      letters.push( $(inputs[parseInt(positions[i], 10) + 5 * parseInt(positions[i+1], 10)]) );
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

  function move(word, move){
    var current_position = word.positions[word.positions.length - 1];
    if (move === 'up'){
      new_position = [current_position[0], current_position[1] - 1];
      if(new_position[1] > -1 && !word.beenThere(new_position)){
        word.positions.push(new_position);
        return word;
      }
    }
    if (move === 'up-right'){
      new_position = [current_position[0] + 1, current_position[1] - 1];
      if(new_position[1] > -1 && new_position[0] < dimension && !word.beenThere(new_position)){
        word.positions.push(new_position);
        return word;
      }
    }
    if ( move === 'right' ){
      new_position = [current_position[0] + 1, current_position[1]];
      if(new_position[0] < dimension && !word.beenThere(new_position)){
        word.positions.push(new_position);
        return word;
      }
    }
    if ( move === 'right-down' ){
      new_position = [current_position[0] + 1, current_position[1] + 1];
      if(new_position[0] < dimension && new_position[1] < dimension && !word.beenThere(new_position)){
        word.positions.push(new_position);
        return word;
      }
    }
    if (move === 'down'){
      new_position = [current_position[0], current_position[1] + 1];
      if(new_position[1] < dimension && !word.beenThere(new_position)){ 
        word.positions.push(new_position);
        return word;
      }
    }
    if (move === 'down-left'){
      new_position = [current_position[0] - 1, current_position[1] + 1];
      if(new_position[1] < dimension && new_position[0] > -1 && !word.beenThere(new_position)){ 
        word.positions.push(new_position);
        return word;
      }
    }
    if ( move === 'left' ){
      new_position = [current_position[0] - 1, current_position[1]];
      if(new_position[0] > -1 && !word.beenThere(new_position)){
        word.positions.push(new_position);
        return word;
      }
    }
    if ( move === 'left-up' ){
      new_position = [current_position[0] - 1, current_position[1] - 1];
      if(new_position[0] > -1 && new_position[1] > -1 && !word.beenThere(new_position)){
        word.positions.push(new_position);
        return word;
      }
    }
    return undefined;
  }

  function spread(words, word){
    var directions = ['up', 'up-right', 'right', 'right-down', 'down', 'down-left', 'left', 'left-up'];
    directions.forEach(function(d){
      var candidate = move( new Word(word.positions), d );
      if( candidate != undefined ){
        words.push( candidate );
      }
    });
  }

  function fetchEnglishDictionary(){
    $.get('/dict_en', null, function(response){
      dict_en = response;
      $('#finder').removeAttr('disabled');
    });
  }

  // export public interface
  return {
    start: start
  };
};


function Word(positions){
  this.positions = positions.slice(0);
  this.letters = undefined;
  this.addPosition = function(position){
    this.positions.push(position);
  };
  this.fillWithLetters = function(matrix){
    var chars = this.positions.map(function(e){
      return matrix[e[0]][e[1]];
    });
    return chars.join('');
  };
  this.getLetters = function(matrix){
    if(!this.letters){
      this.letters = this.fillWithLetters(matrix);
    }
    return this.letters;
  };
  this.beenThere = function(position){
    var found = false;
    this.positions.forEach(function(e){
      if(e[0] == position[0] && e[1] == position[1]){
        found = true;
      }
    });
    return found;
  };
  this.longEnough = function(){
    return this.positions.length > 2;
  };
  return this;
}

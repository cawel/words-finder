$( document ).ready(function(){

  $("input").attr("maxlength", 1);

  var matrix = undefined;
  var dimension = undefined;
  var letters = [];
  var words = [];
  var alphabet = 'abcdefghijklmnopqrstuvwxyz';
  var dict_en = {};

  // fetch English dictionary
  $.get('/dict_en', null, function(data){
    dict_en = data;
  });

  $("#generator").click(function(event){
    $.makeArray($('input')).forEach(function(el){
      var random = Math.ceil( (Math.random() * 25) );
      $(el).val( alphabet[random] );
      $('.results').hide();
    });

  });


  $("#finder").click(function(event){
    timer.start();

    letters = jQuery.makeArray($('input')).map(function(el){
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

    // fetch all possible combinations
    words = [];
    for(i = 0; i < dimension; i++){
      for(j = 0; j < dimension; j++){
        spread( new Word([[i, j]]) );
      }
    }

    for(i=0; i<2; i++){
      words.forEach(function(e){
        spread(e);
      });
    }

    // cleaning results
    words = words.filter(function(w){
      return w.longEnough();
    });

    // removes dupes
    var lot = [];
    words = words.filter(function(item) {
      item.letterize();
      if (lot.indexOf(item.letters) == -1){
        lot.push(item.letters);
        return true;
      }else{
        return false;
      }
    });

    // filter existing words
    words = words.filter(function(item) {
      return dict_en.indexOf(item.letters) != -1;
    });

    $('.results').show();
    $('.results h2').html( 'Words found: ' + words.length );
    $('.words').empty();
    var list = $('.words');
    var count = words.length;
    words.forEach(function(word){
      list.append("<span data-positions='"+ word.positions.toString().replace(/,/g, '') +"'>" + word.letters + '</span>');
      words.indexOf(word) == (count - 1) ? list.append('.') : list.append(', ');
    });
    timer.stop();
    $('.benchmark').html('Results found in: ' + timer.getTime() + ' ms');
  });

  $('.words').on('mouseenter', 'span', function(event){
    var el = $(event.target);
    el.addClass('highlight-word');
    var positions = el.data('positions').toString();
    var inputs = $('input');
    var length = positions.length;
    for(var i=0; i<length; i+=2){
      $(inputs[parseInt(positions[i], 10) + 5 * parseInt(positions[i+1], 10)]).addClass('highlight-letter');
    }
  });
  $('.words').on('mouseleave', 'span', function(event){
    var el = $(event.target);
    el.removeClass('highlight-word');
    var positions = el.data('positions').toString();
    var inputs = $('input');
    var length = positions.length;
    for(var i=0; i<length; i+=2){
      $(inputs[parseInt(positions[i], 10) + 5 * parseInt(positions[i+1], 10)]).removeClass('highlight-letter');
    }
  });

  function spread(word){
    var directions = ['up', 'up-right', 'right', 'right-down', 'down', 'down-left', 'left', 'left-up'];
    directions.forEach(function(d){
      var candidate = move( new Word(word.positions), d );
      if( candidate != undefined ){
        words.push( candidate );
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

  function Word(positions){
    this.positions = positions.slice(0);
    this.letters = '';
    this.addPosition = function(position){
      this.positions.push(position);
    };
    this.letterize = function(){
      var chars = this.positions.map(function(e){
        return matrix[e[0]][e[1]];
      });
      this.letters = chars.join('');
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

  var timer = {
    startedAt: null,
    stoppedAt: null,
    start: function () {
      this.stoppedAt = null;
      this.startedAt = new Date();
    },
    stop: function () {
      this.stoppedAt = new Date();
    },
    getTime: function () {
      if (!this.stoppedAt) { this.stop(); }
      return this.stoppedAt.getTime() - this.startedAt.getTime();
    }
  };

});

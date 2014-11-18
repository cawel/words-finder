'use strict'; 

var WordsFinderApp = function(){
  var lettersGrid;

  var initialize = function(){
    getLettersElements().forEach(function(el){
      $(el).attr("maxlength", 1);
    });
    lettersGrid = LettersGrid(5);
    registerEventListeners();
  };

  var registerEventListeners = function(){
    $("#randomizer").click(function(event){
      $('.results').hide();
      getLettersElements().forEach(function(el){
        $(el).val( lettersGrid.randomLetter() );
      });
      return false;
    });

    $("#finder").click(function(event){
      uiWaitingState(true);

      var elapsedTime = TimeTracker();
      elapsedTime.start();
      lettersGrid.findWords(getLettersMatrix(), function(words){
        elapsedTime.stop();
        uiWaitingState(false);
        showWordsFound(words);
        $('.benchmark span').html( elapsedTime.getTime() );
      });

      return false;
    });

    $('.words').on('mouseenter', 'span', function(event){
      var el = $(event.target);
      el.addClass('highlight-word');
      toggleLettersHighlight( el.data('positions'), true);
      return false;
    });

    $('.words').on('mouseleave', 'span', function(event){
      var el = $(event.target);
      el.removeClass('highlight-word');
      toggleLettersHighlight( el.data('positions'), false);
      return false;
    });
  };

  function getLettersMatrix(){
    var lettersMatrix = []; 
    var elements = getLettersElements();
    var dimension = lettersGrid.getDimension();
    for(var i = 0; i < dimension; i++){
      lettersMatrix[i] = [];
      for(var j = 0; j < dimension; j++){
        lettersMatrix[i][j] = $(elements[j*dimension + i]).val().toLowerCase();
      }
    }
    return lettersMatrix;
  }

  function getLettersElements(){
    return $.makeArray($('input.letter'));
  }

  function uiWaitingState(waiting){
    if(waiting){
      $('#randomizer').attr('disabled', 'disabled');
      $('#finder').attr('disabled', 'disabled');
      $('.results').hide();
      $('.loading').show();
    }else{
      $('.loading').hide();
      $('#finder').removeAttr('disabled');
      $('#randomizer').removeAttr('disabled');
    }
  }

  function toggleLettersHighlight(positions, highlight){
    positions = JSON.parse(positions);
    getGridElements(positions).map(function(el){
      el.toggleClass('highlight-letter', highlight);
    });
  }

  function getGridElements(positions){
    var inputs = getLettersElements();
    return positions.map(function(position){
      return $(inputs[position[0] + lettersGrid.getDimension() * position[1]]);
    });
  }

  function showWordsFound(words){
    $('.results h2 span').html(words.length);
    $('.results').show();
    $('.words').empty();
    var list = $('.words');
    var count = words.length;
    words.forEach(function(word){
      var word_el = $('<span />').data('positions', JSON.stringify(word[1]) ).html( word[0] );
      list.append(word_el);
      words.indexOf(word) == (count - 1) ? list.append('.') : list.append(', ');
    });
  }

  // export public interface
  return {
    initialize: initialize
  };
};

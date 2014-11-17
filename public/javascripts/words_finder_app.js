'use strict'; 

var WordsFinderApp = function(){
  var lettersGrid;

  var initialize = function(){
    $("input").attr("maxlength", 1);
    lettersGrid = LettersGrid(5);
    registerEventListeners();
  };

  var registerEventListeners = function(){
    $("#randomizer").click(function(event){
      $('.results').hide();
      $.makeArray($('input')).forEach(function(el){
        $(el).val( lettersGrid.randomLetter() );
      });
      return false;
    });

    $("#finder").click(function(event){
      uiWaitingState(true);

      var letters = jQuery.makeArray($('input')).map(function(el){
        return $(el).val();
      });
      var elapsedTime = TimeTracker();
      elapsedTime.start();
      lettersGrid.findWords(letters, function(words){
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
    positions = positions.toString();
    getGridElements( positions ).map(function(el){
      el.toggleClass('highlight-letter', highlight);
    });
  }

  function getGridElements(positions){
    var inputs = $('input');
    var length = positions.length;
    var gridElements = [];
    for(var i = 0; i < length; i += 2){
      gridElements.push( $(inputs[parseInt(positions[i], 10) + lettersGrid.getDimension() * parseInt(positions[i+1], 10)]) );
    }
    return gridElements;
  }

  function showWordsFound(words){
    $('.results h2 span').html(words.length);
    $('.results').show();
    $('.words').empty();
    var list = $('.words');
    var count = words.length;
    words.forEach(function(word){
      var word_el = $('<span />').data('positions', word[1].toString().replace(/,/g, '') ).html( word[0] );
      list.append(word_el);
      words.indexOf(word) == (count - 1) ? list.append('.') : list.append(', ');
    });
  }

  // export public interface
  return {
    initialize: initialize
  };
};

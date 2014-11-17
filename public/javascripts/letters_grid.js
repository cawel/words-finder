'use strict';

function LettersGrid(gridDimension){
  var alphabet = 'abcdefghijklmnopqrstuvwxyz';
  var dimension = gridDimension;

  function randomLetter(){
    var random = Math.floor( (Math.random() * (alphabet.length)) );
    return alphabet[random];
  }

  function getDimension(){
    return dimension;
  }

  function findWords(letters, callback){
    $.ajax({
      url: '/find-words',
      type: 'POST',
      data: JSON.stringify(letters),
      success: function(data){
        callback(data);
      },
      dataType: 'json',
      contentType: 'application/json; charset=utf-8'
    });
  }


  // export public interface
  return {
    findWords:              findWords,
    randomLetter:           randomLetter,
    getDimension:           getDimension
  };
}

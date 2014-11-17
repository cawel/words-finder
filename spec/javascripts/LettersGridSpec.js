describe("LettersGrid", function(){

  it("initializes itself a dimension", function(){
    var dimension = 3;
    var grid = LettersGrid(dimension);
    expect( grid.getDimension() ).toEqual( dimension );
  });

  it("retrieves a random letter", function(){
    var grid = LettersGrid(4);
    expect( grid.randomLetter() ).toMatch(/[abcdefghijklmnopqrstuvwxyz]/i);
  });

});

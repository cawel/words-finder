describe("LettersSequence", function(){

  var positions;
  var sequence;

  beforeEach(function() {
    positions = [[0,0], [1,0], [2,0]];
    sequence = LettersSequence(positions);
  });

  it("initializes itself with an array of positions", function(){
    expect( JSON.stringify(sequence.getPositions()) ).toEqual( JSON.stringify(positions) );
  });

  it("knows when a position already exists", function(){
    expect( sequence.positionExists([2, 0]) ).toBeTruthy();
  });

  it("knows when a position does not already exist", function(){
    expect( sequence.positionExists([2, 2]) ).toBeFalsy();
  });

  it("does not allow access to the 'positions' private variable", function(){
    expect( sequence.positions ).toBe(undefined);
  });

  it("approves a sequence of 3 positions", function(){
    expect( LettersSequence([[0, 0], [1,2], [2,2]]).longEnough() ).toBe(true);
  });

  it("disapproves a sequence of 2 positions", function(){
    expect( LettersSequence([[0, 0], [1,2]]).longEnough() ).toBe(false);
  });

});

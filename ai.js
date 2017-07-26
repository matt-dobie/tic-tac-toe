/// UI ///
var ui = {};

ui.initialControlsVisible = true;

ui.insertAt = function(index, symbol) {

  

};


/// GAME ///
// Represents a game state
var state = function(oldState) {
  this.turn = "";
  this.aiMovesCount = 0;
  this.result = "running";
  this.board = [];

  if (typeof oldState !== "undefined") {
    var length = oldState.board.length;
    this.board = new Array(length);
    for (var i = 0; i < length; i++) {
      this.board[i] = oldState.board[i];
    }
    this.aiMovesCount = oldState.aiMovesCount;
    this.result = oldState.result;
    this.turn = oldState.turn;
  }

  this.advanceTurn = function() {
    this.turn = this.turn === "X" ? "O" : "X";
  }

  this.emptyCells = function() {
    var arr = [];
    for (var i = 0; i < 9; i++) {
      if (this.board[i] === "E") {
        arr.push(i);
      }
    }
    return arr;
  }

  this.isTerminal = function() {
    var board = this.board;
    // check rows
    for (var i = 0; i <= 6; i = i + 3) {
      if (board[i] !== "E" && board[i] === board[i+1] && board[i+1] === board[i+2]) {
        this.result = board[i] + "-won";
        return true;
      }
    }
    // check columns
    for (var i = 0; i <= 2; i++) {
      if (board[i] !== "E" && board[i] === board[i+3] && board[i+3] === board[i+6]) {
        this.result = board[i] + "-won";
        return true;
      }
    }
    // check diagonals
    if (board[0] !== "E" && board[0] === board[4] && board[4] === board[8]) {
      this.result = board[i] + "-won";
      return true;
    }
    if (board[2] !== "E" && board[2] === board[4] && board[4] === board[6]) {
      this.result = board[i] + "-won";
      return true;
    }

    if (board.indexOf("E") === -1) {
      this.result = "draw";
      return true;
    }
    return false;
  }



};


/// CONTROL ///

var globals = {};



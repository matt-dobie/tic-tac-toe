/*
  Author: Matthew Dobie
  Author URL: mattdobie.com
  Description: Script for simple Tic-Tac-Toe Game
  Inspired By: https://mostafa-samir.github.io/Tic-Tac-Toe-AI/
*/


//// GLOBAL VARS ////
var globals = {};
globals.playerIcon;
globals.aiIcon;
globals.difficulty;
globals.gameType;



//// UI ////
var ui = {};

// UI Vars
ui.currentView = ".player-choice";
ui.finalMessage = "";

// Hide All Views
ui.hideAllViews = function() {
  $(".difficulty-choice").hide();
  $(".mark-choice").hide();
  $(".game").hide();
};

// Switch Between Views
ui.switchViewTo = function(view) {
  $(ui.currentView).fadeOut({
    duration: "fast",
    done: function() {
      ui.currentView = view;
      $(ui.currentView).fadeIn("slow");
    }
  });
};

// Insert X or O in appropriate cell
ui.insertAt = function(index, symbol) {
    var targetCell = $("#cell" + index);
    if(!targetCell.hasClass("used")) {
        targetCell.html(symbol);
        targetCell.addClass("used");
    }
};

// Clear board
ui.clearBoard = function() {
  $(".cell").off();
  $(".cell").removeClass("used");
  $(".cell").html("");
  $("#final-message").hide();
  $(".player-message").show();
};

// Update message for choosing symbol
ui.markMessage = function(message) {
  $(".mark-choice").children("p").html(message);
};

// Show win/lose/draw message
ui.showFinalMessage = function() {
  $(".player-message").hide();
  $("#final-message").html(ui.finalMessage);
  $("#final-message").show();
};

// Toggle the 'Your Turn' Message
ui.updateTurn = function() {
  if (globals.gameType === "multiplayer") {
    if (globals.game2.currentState.turn === globals.playerIcon) {
      $(".player-message").html("Your Turn: Player 1");
    }
    else {
      $(".player-message").html("Your Turn: Player 2");
    }
  }
  else if (globals.gameType === "single") {
    if (globals.game.currentState.turn === globals.playerIcon) {
      $(".player-message").html("Your turn");
    }
    else {
      $(".player-message").html("Please wait...");
    }
  }
  
};


//// AI ////
// Constructs action AI could make
var AIAction = function(pos) {

  // Vars
  this.movePosition = pos;
  this.minimaxVal = 0;

  // Applies action to a state to get the next state
  this.applyTo = function(state) {
    var next = new State(state);
    next.board[this.movePosition] = state.turn;
    if (state.turn === globals.aiIcon) {
      next.aiMovesCount++;
    }
    next.advanceTurn();
    return next;
  };

};

// Sorts AIActions ascending
AIAction.ASCENDING = function(firstAction, secondAction) {
  if (firstAction.minimaxVal < secondAction.minimaxVal) {
    return -1;
  }
  else if (firstAction.minimaxVal > secondAction.minimaxVal) {
    return 1;
  }
  else {
    return 0;
  }
};

// Sorts AIActions descending
AIAction.DESCENDING = function(firstAction, secondAction) {
  if (firstAction.minimaxVal > secondAction.minimaxVal) {
    return -1;
  }
  else if (firstAction.minimaxVal < secondAction.minimaxVal) {
    return 1;
  }
  else {
    return 0;
  }
};

// AI Player Constructor
var AI = function(difficulty) {

  // Vars
  var level = difficulty;
  var game = {};

  // Calculate Minimax Value recursively
  function minimaxValue(state) {
    if (state.isTerminal()) {
      return Game.score(state);
    }
    else {
      var stateScore;
      if (state.turn === "X") {
        stateScore = -1000;
      } else {
        stateScore = 1000;
      }
      var availablePositions = state.emptyCells();
      var availableNextStates = availablePositions.map(function(pos) {
        var action = new AIAction(pos);
        var nextState = action.applyTo(state);
        return nextState;
      });
      availableNextStates.forEach(function(nextState) {
        var nextScore = minimaxValue(nextState);
        if (state.turn === "X") {
          if (nextScore > stateScore) {
            stateScore = nextScore;
          }
        }
        else {
          if (nextScore < stateScore) {
            stateScore = nextScore;
          }
        }
      });
      return stateScore;
    }
  }

  // AI move function for easy mode (100% random)
  function takeABlindMove(turn) {
    var available = game.currentState.emptyCells();
    var randomCell = available[Math.floor(Math.random() * available.length)];
    var action = new AIAction(randomCell);
    var next = action.applyTo(game.currentState);
    ui.insertAt(randomCell, turn);
    game.advanceTo(next);
    ui.updateTurn();
  }

  // AI move function for normal mode (only 40% optimal)
  function takeANormalMove(turn) {
    var available = game.currentState.emptyCells();
    var availableActions = available.map(function(pos) {
      var action = new AIAction(pos);
      var nextState = action.applyTo(game.currentState);
      action.minimaxVal = minimaxValue(nextState);
      return action;
    });
    if (turn === "X") {
      availableActions.sort(AIAction.DESCENDING);
    } else {
      availableActions.sort(AIAction.ASCENDING);
    }
    var chosenAction;
    if (Math.random()*100 <= 40) {
      chosenAction = availableActions[0];
    }
    else {
      if (availableActions.length >= 2) {
        chosenAction = availableActions[1];
      }
      else {
        chosenAction = availableActions[0];
      }
    }
    var next = chosenAction.applyTo(game.currentState);
    ui.insertAt(chosenAction.movePosition, turn);
    game.advanceTo(next);
    ui.updateTurn();
  }

  // AI move function for hard mode (unbeatable)
  function takeAPerfectMove(turn) {
    var available = game.currentState.emptyCells();
    var availableActions = available.map(function(pos) {
      var action = new AIAction(pos);
      var next = action.applyTo(game.currentState);
      action.minimaxVal = minimaxValue(next);
      return action;
    });
    if (turn === "X") {
      availableActions.sort(AIAction.DESCENDING);
    }
    else {
      availableActions.sort(AIAction.ASCENDING);
    }
    var chosenAction = availableActions[0];
    var next = chosenAction.applyTo(game.currentState);
    ui.insertAt(chosenAction.movePosition, turn);
    game.advanceTo(next);
    ui.updateTurn();
  }

  // Sets the game for the AI to play
  this.plays = function(_game) {
    game = _game;
  };

  // Notifies the AI to take a move (level dependent)
  this.notify = function(turn) {
    setTimeout(function() {
      switch(level) {
        case "easy":
          takeABlindMove(turn);
          break;
        case "normal":
          takeANormalMove(turn);
          break;
        case "hard":
          takeAPerfectMove(turn);
          break;
      }
    }, 1200);
  };
};



//// GAME ////
// Represents a game state
var State = function(oldState) {

  // Vars
  this.turn = "";
  this.aiMovesCount = 0;
  this.result = "running";
  this.board = [];

  // Use vars from previous state if one exists
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

  // Toggle turn variable ("X" or "O")
  this.advanceTurn = function() {
    this.turn = this.turn === "X" ? "O" : "X";
  }

  // Returns array of indexes for available cells
  this.emptyCells = function() {
    var arr = [];
    for (var i = 0; i < 9; i++) {
      if (this.board[i] === "E") {
        arr.push(i);
      }
    }
    return arr;
  }

  // Check if board is in terminal state (ie. win/lose/draw)
  this.isTerminal = function() {
    var board = this.board;
    for (var i = 0; i <= 6; i = i + 3) {
      if (board[i] !== "E" && board[i] === board[i+1] && board[i+1] === board[i+2]) {
        this.result = board[i] + "-won";
        return true;
      }
    }
    for (var i = 0; i <= 2; i++) {
      if (board[i] !== "E" && board[i] === board[i+3] && board[i+3] === board[i+6]) {
        this.result = board[i] + "-won";
        return true;
      }
    }
    if (board[0] !== "E" && board[0] === board[4] && board[4] === board[8]) {
      this.result = board[0] + "-won";
      return true;
    }
    if (board[2] !== "E" && board[2] === board[4] && board[4] === board[6]) {
      this.result = board[2] + "-won";
      return true;
    }
    if (board.indexOf("E") === -1) {
      this.result = "draw";
      return true;
    }
    return false;
  }
};

// Game object
var Game = function(autoPlayer) {

  // Vars
  this.ai = autoPlayer;
  this.currentState = new State();
  this.currentState.board = ["E", "E", "E", 
                            "E", "E", "E", 
                            "E", "E", "E"];
  this.currentState.turn = "X";
  this.status = "beginning";

  // Advance the game to new state (_state)
  this.advanceTo = function(_state) {
    this.currentState = _state;
    if (_state.isTerminal()) {
      this.status = "ended";
      if (globals.gameType === "single") { //singleplayer
        if (_state.result === "X-won") {
          if (globals.playerIcon === "X") {
            ui.finalMessage = "You Won!";
          }
          else {
            ui.finalMessage = "You Lost...";
          }
        }
        else if (_state.result === "O-won") {
          if (globals.playerIcon === "O") {
            ui.finalMessage = "You Won!";
          }
          else {
            ui.finalMessage = "You Lost...";
            }
        }
        else {
          ui.finalMessage = "It's a Draw...";
        }
      }
      else {  // multiplayer
        if (_state.result === "X-won") {
          if (globals.playerIcon === "X") {
            ui.finalMessage = "Player 1 Wins!";
          }
          else {
            ui.finalMessage = "Player 2 Wins!";
          }
        }
        else if (_state.result === "O-won") {
          if (globals.playerIcon === "O") {
            ui.finalMessage = "Player 1 Wins!";
          }
          else {
            ui.finalMessage = "Player 2 Wins!";
            }
        }
        else {
          ui.finalMessage = "It's a Draw...";
        }
      }
      ui.showFinalMessage();
    }
    else {
      if (this.currentState.turn === globals.playerIcon) {
        // IF IT'S A PLAYERS TURN DO NOTHING
      }
      else if (globals.gameType === "single") {
        // COMPUTERS TURN
        ui.updateTurn();
        this.ai.notify(globals.aiIcon);
      }
    }
  };

  // Start the game and advance to initial state
  this.start = function() {
    if (this.status = "beginning") {
      this.advanceTo(this.currentState);
      this.status = "running";
    }
  }
}

// Calculate Game Score
Game.score = function(_state) {
  if (_state.result !== "running") {
    if (_state.result === "X-won") {
      return 10 - _state.aiMovesCount;
    }
    else if (_state.result === "O-won") {
      return -10 + _state.aiMovesCount;
    }
    else {
      return 0;
    }
  }
}



//// CONTROL ////
$(document).ready(function() {
  
  ui.hideAllViews();

  // Select Single Player
  $("#one-player").on("click", function() {
    globals.gameType = "single";
    ui.markMessage("And which would you prefer?");
    ui.switchViewTo(".difficulty-choice");
  });

  // Select Two Player
  $("#two-player").on("click", function() {
    globals.gameType = "multiplayer";
    ui.markMessage("Player 1, which would you prefer?");
    ui.switchViewTo(".mark-choice");
  });

  // Select Difficulty
  $(".diff").on("click", function() {
    globals.difficulty = $(this).attr("id");
    ui.switchViewTo(".mark-choice");
  });

  // Select X or O
  $(".mark").on("click", function() {
    if ($(this).html() === "X") {
      globals.playerIcon = "X";
      globals.aiIcon = "O";
    }
    else {
      globals.playerIcon = "O";
      globals.aiIcon = "X";
    }
    if (globals.gameType === "single") {
      startSinglePlayer();
    }
    else {
      startMultiPlayer();
    }
  });

  // Back button
  $(".back").on("click", function() {
    ui.clearBoard();
    ui.switchViewTo(".player-choice");
  });

  // Refresh button
  $(".refresh").on("click", function() {
    ui.clearBoard();
    if (globals.gameType === "single") {
      startSinglePlayer();
    }
    else {
      startMultiPlayer();
    }
  });
});



//// START FUNCTIONS ////
// Start single player game
function startSinglePlayer() {
  var aiPlayer = new AI(globals.difficulty);
  globals.game = new Game(aiPlayer);
  aiPlayer.plays(globals.game);
  globals.game.start();
  ui.switchViewTo(".game");
  ui.updateTurn();

  // Select cell
  $(".cell").on("click", function() {
    if (globals.game.status === "running" && globals.game.currentState.turn === globals.playerIcon && !$(this).hasClass("used")) {
      var index = parseInt($(this).attr("value"));
      var next = new State(globals.game.currentState);
      next.board[index] = globals.playerIcon;
      ui.insertAt(index, globals.playerIcon);
      next.advanceTurn();
      globals.game.advanceTo(next);
    }
  });
}

// Start multiplayer game
function startMultiPlayer() {
  globals.game2 = new Game();
  globals.game2.start();
  ui.switchViewTo(".game");
  ui.updateTurn();

  // Select cell
  $(".cell").on("click", function() {
    if (globals.game2.status === "running" && !$(this).hasClass("used")) {
      var index = parseInt($(this).attr("value"));
      var next = new State(globals.game2.currentState);
      next.board[index] = globals.game2.currentState.turn;
      ui.insertAt(index, globals.game2.currentState.turn);
      next.advanceTurn();
      globals.game2.advanceTo(next);
      ui.updateTurn();
    }
  });
}

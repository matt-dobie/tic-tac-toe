/* Global Variables */
var playerIcons = [];
var turn = 0;
var turnIndex;
var gameStarted = false;
var markMessage;
var finalMessage;
var board = ['E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E'];
var difficulty;

var globals = {};

//// UI ////
var ui = {};

ui.currentView = ".player-choice";

// Hide All Views
ui.hideAllViews = function() {
  $(".difficulty-choice").hide();
  $(".mark-choice").hide();
  $(".game").hide();
}

// Switch Between Views
ui.switchViewTo = function(view) {
  $(ui.currentView).fadeOut({
    duration: "fast",
    done: function() {
      ui.currentView = view;
      $(ui.currentView).fadeIn("fast");
    }
  });
};

ui.insertAt = function(index, symbol) {
    var targetCell = $('#cell' + index);
    if(!targetCell.hasClass('used')) {
        targetCell.html(symbol);
        targetCell.addClass('used');
    }
}



//// AI ////

// Constructs action AI could make
var AIAction = function(pos) {

  this.movePosition = pos;

  this.minimaxVal = 0;

  this.applyTo = function(state) {
    var next = new State(state);
    next.board[this.movePosition] = state.turn;
    if (state.turn === "O") {
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
}

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
}

// AI Player Constructor
var AI = function(difficulty) {

  var level = difficulty;

  var game = {};

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

  function takeABlindMove(turn) {
    var available = game.currentState.emptyCells();
    var randomCell = available[Math.floor(Math.random() * available.length)];
    var action = new AIAction(randomCell);
    var next = action.applyTo(game.currentState);
    ui.insertAt(randomCell, turn);
    game.advanceTo(next);
  }

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
  }

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
  }

  this.plays = function(_game) {
    game = _game;
  };

  this.notify = function(turn) {
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
  };

};



//// GAME ////
// Represents a game state
var State = function(oldState) {
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

// Game Object
var Game = function(autoPlayer) {
  
  this.ai = autoPlayer;
  
  this.currentState = new State();

  this.currentState.board = ["E", "E", "E", 
                            "E", "E", "E", 
                            "E", "E", "E"];

  this.currentState.turn = "X";

  this.status = "beginning";

  this.advanceTo = function(_state) {
    this.currentState = _state;
    if (_state.isTerminal()) {
      this.status = "ended";
      if (_state.result === "X-won") {
        //X Won
        
      }
      else if (_state.result === "O-Won") {
        // O Won
      }
      else {
        // Draw
      }
      $(".player-message").hide();
      $("#final-message").html(_state.result);
    }
    else {
      if (this.currentState.turn === "X") {
        // IF ITS PLAYERS TURN
      }
      else {
        // COMPUTERS TURN
        this.ai.notify("O");
      }
    }
  };

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




$(document).ready(function() {
  
  ui.hideAllViews();

  // Select Single Player
  $("#one-player").on('click', function() {
    markMessage = "And which would you prefer?";
    $(".mark-choice").children("p").html(markMessage);
    ui.switchViewTo(".difficulty-choice");
  });

  // Select difficulty
  $(".diff").on('click', function() {
    difficulty = $(this).attr("id");
    var aiPlayer = new AI(difficulty);
    globals.game = new Game(aiPlayer);
    aiPlayer.plays(globals.game);
    globals.game.start();
    ui.switchViewTo(".game");
  });

  $(".cell").each(function() {
     var $this = $(this);
     $this.click(function() {
         if(globals.game.status === "running" && globals.game.currentState.turn === "X" && !$this.hasClass('used')) {
             var index = parseInt($this.attr("value"));

             var next = new State(globals.game.currentState);
             next.board[index] = "X";

             ui.insertAt(index, "X");

             next.advanceTurn();

             globals.game.advanceTo(next);

             console.log(globals.game.currentState.board);

         }
     })
 });


  // Select Two Player
  $("#two-player").on('click', function() {
    markMessage = "Player 1, which would you prefer?";
    $(".mark-choice").children("p").html(markMessage);
    ui.switchViewTo(".mark-choice");
  });

  // Select X or O
  $(".mark").on('click', function() {
    if ($(this).html() === "X") {
      playerIcons[0] = "X";
      playerIcons[1] = "O";
      turn = 0;
    } else {
      playerIcons[0] = "O";
      playerIcons[1] = "X";
      turn = 1;
    }
    $("#player").html(turn+1);
    ui.switchViewTo(".game");
    start();
    gameStarted = true;
    
  });

  // Back button
  $(".back").on('click', function() {
    ui.switchViewTo(".player-choice");
    resetVars();
    resetBoard();
  });

  

});

// Start main game logic
function start() {

  $(".cell").on('click', function() {
    if (!$(this).hasClass("used") && gameStarted) {
      $(this).html(playerIcons[turn]);
      $(this).addClass("used");
      turnIndex = $(this).attr("value");
      board[turnIndex] = playerIcons[turn];
      console.log(board);
      if (checkWin()) {
        console.log("Finished!");
        $(".player-message").hide();
        $("#final-message").html(finalMessage);
        gameStarted = false;
        return;
      } else {
        changeTurn();
      }
    }

  });

  $(".refresh").on('click', function() {
    refresh();
  });

}



// Reset Variables
function resetVars() {
  playerIcons = [];
  turn = 0;
  gameStarted = false;
  ui.currentView = ".player-choice";
  board = ['E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E'];
}

// Reset board
function resetBoard() {
  board = ['E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E'];
  $(".cell").html('');
  $(".cell").removeClass("used");
  $("#final-message").html('');
  $(".player-message").show();
}

// Refresh game
function refresh() {
  resetBoard();
  if (playerIcons[0] === "X") {
    turn = 0;
  } else {
    turn = 1;
  }
  $("#player").html(turn+1);
  gameStarted = true;
}

// Check for a win
function checkWin() {
  // rows
  for (var i = 0; i <= 6; i = i + 3) {
    if (board[i] !== "E" && board[i] === board[i+1] && board[i+1] === board[i+2]) {
      finalMessage = "Player " + (turn+1) + " Wins!";
      return true;
    }
  }
  // columns
  for (var i = 0; i <= 2; i++) {
    if (board[i] !== "E" && board[i] === board[i+3] && board[i+3] === board[i+6]) {
      finalMessage = "Player " + (turn+1) + " Wins!";
      return true;
    }
  }
  // diagonals
  if (board[0] !== "E" && board[0] === board[4] && board[4] === board[8]) {
    finalMessage = "Player " + (turn+1) + " Wins!";
    return true;
  }
  if (board[2] !== "E" && board[2] === board[4] && board[4] === board[6]) {
    finalMessage = "Player " + (turn+1) + " Wins!";
    return true;
  }

  if (board.indexOf("E") === -1) {
    finalMessage = "It's a Draw...";
    return true;
  }
  return false;
}

// Toggle turn variable
function changeTurn() {
  if (turn == 0) {
    turn = 1;
  } else {
    turn = 0;
  }
  $("#player").html(turn+1);
}


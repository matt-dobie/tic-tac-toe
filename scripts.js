/* Global Variables */
var playerIcons = [];
var turn = 0;
var turnIndex;
var gameStarted = false;
var markMessage;
var finalMessage;
var board = ['E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E'];

/* Main Function */
$(document).ready(function() {
  
  hideAll();

  // Select Two Player
  $("#two-player").on('click', function() {
    $(".player-choice").hide();
    markMessage = "Player 1, which would you prefer?";
    $(".mark-choice").children("p").html(markMessage);
    $(".mark-choice").show();
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
    $(this).parent().hide();
    $("#player").html(turn+1);
    $(".display").show();
    $(".grid").show();
    $(".refresh-display").show();
    start();
    gameStarted = true;
    
  });

  // Back button
  $(".back").on('click', function() {
    hideAll();
    resetVars();
    resetBoard();
    $(".player-choice").show();
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



// Hide All on Start
function hideAll() {
  $(".mark-choice").hide();
  $(".display").hide();
  $(".grid").hide();
  $(".refresh-display").hide();
}

// Reset Variables
function resetVars() {
  playerIcons = [];
  turn = 0;
  gameStarted = false;
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
// Set Global Variables - Do not change these
var canvas;
var canvasContext;
var winMusicHasPlayed = false;
var loseMusicHasPlayed = false;
var player1Score = 0;
var player2Score = 0;
var showingWinScreen = false;

// Color Variables
/*
  see http://www.color-hex.com/ for more options
*/
var baseColor= 'white';
var canvasColor = '#5e871f';
var ballColor = 'white';
var paddle1Color = '#C9F227';
var paddle2Color = '#00F8FB';
var netColor = 'white';

// Sound Variables
/*
  Options:
  - sounds/blue.mp3
  - sounds/bounce.mp3
  - sounds/computer-score.mp3
  - sounds/fail.mp3
  - sounds/guitar.wav
  - sounds/lose.mp3
  - sounds/music.mp3
  - sounds/score.mp3
  - sounds/win.mp3
*/
const paddleSound = new Audio('sounds/bounce.mp3');
const bgMusic = new Audio('sounds/music.mp3');
const playerScoreSound = new Audio('sounds/score.mp3');
const computerScoreSound = new Audio('sounds/computer-score.mp3');
const winMusic = new Audio('sounds/win.mp3');
const loseMusic = new Audio('sounds/fail.mp3');

// Gameplay Variables
const WINNING_SCORE = 3;
const FPS = 30;
var aiDifficulty = 8;
var winMessage = 'GG, bruh';
var loseMessage = 'that was kind of lame...';
var playButtonText = 'play again';

// Net Variables
const NET_WIDTH = 5;
const NET_LINE_HEIGHT = 30;
const NET_LINE_SPACING = 60;

// Ball Variables
var ballX = 50; // Ball's starting X position
var ballY = 50; // Ball's starting Y position
var ballSpeedX = 10; // Ball's speed along the X axis
var ballSpeedY = 4; // Ball's speed along the Y axis
var ballSize = 10; // Ball's diameter in pixels

// Paddle Variables
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const PADDLE_SPACE_FROM_SIDE = 15;
var paddle1Y = 200; // Paddle's starting Y position
var paddle2Y = 200; // Paddle's starting Y position


// Functions

// Restart everything when you click the Play Again button
function handleMouseClick(evt) {
  if(showingWinScreen) {
    player1Score=0;
    player2Score=0;
    showingWinScreen = false;
    winMusicHasPlayed = false;
    loseMusicHasPlayed = false;

    bgMusic.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
    }, false);
    bgMusic.play();
  }
}

// Run functions after the window has loaded
window.onload = function() {

  // Get the canvas element
  canvas = document.getElementById('gameCanvas');
  canvasContext = canvas.getContext('2d');
  
  // Set the FPS, initialize movement and drawing
  setInterval(function() {
    moveEverything();
    drawEverything();
  }, 1000/FPS);


  // Start music
  bgMusic.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
  }, false);
  bgMusic.play();

  // Restart the game when you click
  canvas.addEventListener('mousedown', handleMouseClick);

  // Make the player paddle follow the mouse
  canvas.addEventListener('mousemove', function(evt){
    var mousePos = calculateMousePos(evt);
    paddle1Y = mousePos.y - (PADDLE_HEIGHT/2);

  });
}

// Handle computer AI
function computerMovement() {
  var paddle2YCenter = paddle2Y + (PADDLE_HEIGHT/2);

  if (paddle2YCenter < ballY-35) {
    paddle2Y += aiDifficulty;
  }
  else if (paddle2YCenter > ballY+35) {
    paddle2Y -= aiDifficulty;
  }
}

// Animation and movement
function moveEverything() {
  if(showingWinScreen) {
    return;
  }

  computerMovement();

  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Bounce or reset for the player side of the screen 
  if(ballX < PADDLE_SPACE_FROM_SIDE + PADDLE_WIDTH + ballSize) {
    if(ballY > paddle1Y && ballY < paddle1Y+PADDLE_HEIGHT) {
      paddleSound.play();
      
      ballSpeedX++;
      ballSpeedX = -ballSpeedX;
      
      var deltaY = ballY-(paddle1Y+PADDLE_HEIGHT/2);
      ballSpeedY++;
      ballSpeedY = deltaY * 0.35;
    }
    else if(ballX < 0){
      computerScoreSound.play();
      player2Score++;
      ballReset();
    }
  }

  // Bounce or reset for the computer side of the screen
  if(ballX > canvas.width - PADDLE_SPACE_FROM_SIDE - PADDLE_WIDTH - ballSize) {
    if(ballY > paddle2Y && ballY < paddle2Y+PADDLE_HEIGHT) {
      paddleSound.play();

      ballSpeedX++;
      ballSpeedX = -ballSpeedX;

      var deltaY = ballY-(paddle2Y+PADDLE_HEIGHT/2);
      ballSpeedY++;
      ballSpeedY = deltaY * 0.35;
    }
    else if(ballX > canvas.width) {
      playerScoreSound.play();
      player1Score++;
      ballReset();
    }
    
  }

  // Bounce off top and bottom of screen
  if(ballY > canvas.height - ballSize || ballY < ballSize) {
    ballSpeedY = -ballSpeedY;
  }
}

// Reset the ball after a score
function ballReset() {
  if (player1Score >= WINNING_SCORE || player2Score >= WINNING_SCORE) {
    showingWinScreen = true;
  }

  ballSpeedX = -ballSpeedX;
  ballX = canvas.width/2;
  ballY = canvas.height/2;
}

// Draw the net
function drawNet() {
  for (var i=0; i<canvas.height; i+=NET_LINE_SPACING) {
    drawRect(canvas.width/2-1, i, NET_WIDTH, NET_LINE_HEIGHT, netColor);
  }
}

// Draw everything
function drawEverything() {

  // Draw the playing field
  drawRect(0, 0, canvas.width, canvas.height, canvasColor);

  canvasContext.fillStyle = baseColor;

  if(showingWinScreen) {
    if (player1Score >= WINNING_SCORE) {
      bgMusic.pause();

      if(!winMusicHasPlayed) {
        winMusic.play();
        winMusicHasPlayed = true;
      }
      canvasContext.fillText("Player Won!",200,200);
      canvasContext.fillText(winMessage,200,300);
    }
    else if(player2Score >= WINNING_SCORE) {
      bgMusic.pause();

      if(!loseMusicHasPlayed) {
        loseMusic.play();
        loseMusicHasPlayed = true;
      }
      canvasContext.fillText("Computer Won...",200,200);
      canvasContext.fillText(loseMessage,200,300);
    }

    
    canvasContext.fillText(playButtonText,300,500);
    return;
  }

  drawNet();

  // Draw user paddle
  drawRect(PADDLE_SPACE_FROM_SIDE, paddle1Y, PADDLE_WIDTH, PADDLE_HEIGHT, paddle1Color);

  // Draw computer paddle 
  drawRect((canvas.width - PADDLE_WIDTH)-PADDLE_SPACE_FROM_SIDE, paddle2Y, PADDLE_WIDTH, PADDLE_HEIGHT, paddle2Color)
  // Draw ball
  drawBall(ballX, ballY, ballSize, ballColor);

  canvasContext.font = "50px Arial";
  canvasContext.fillText(player1Score,200,100);
  canvasContext.fillText(player2Score,canvas.width-200,100);
}

// Function for drawing rectangles
function drawRect(leftX, topY, width, height, drawColor) {
  canvasContext.fillStyle = drawColor;
  canvasContext.fillRect(leftX,topY,width,height);
}

// Function for drawing balls
function drawBall(leftX, topY, size, drawColor) {
  canvasContext.fillStyle = drawColor;
  canvasContext.beginPath();
  canvasContext.arc(leftX, topY, size, 0, Math.PI*2, true);
  canvasContext.fill();
}

// Calculate where the mouse is
function calculateMousePos(evt) {
  var rect = canvas.getBoundingClientRect();
  var root = document.documentElement;
  var mouseX = evt.clientX - rect.left - root.scrollLeft;
  var mouseY = evt.clientY - rect.top - root.scrollTop;

  return {
    x:mouseX,
    y:mouseY
  };
}
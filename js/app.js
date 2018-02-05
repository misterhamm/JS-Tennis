//set global vars
var canvas;
var canvasContext;

var canvasColor = '#5e871f';
var ballColor = 'white';
var paddle1Color = '#dc6c20';
var paddle2Color = 'yellow';

var paddleSound = new Audio('sounds/bounce.mp3');
var bgMusic = new Audio('sounds/music.mp3');
var playerScoreSound = new Audio('sounds/score.mp3');
var computerScoreSound = new Audio('sounds/computer-score.mp3');
var winMusic = new Audio('sounds/win.mp3');
var loseMusic = new Audio('sounds/fail.mp3');
var winMusicHasPlayed = false;
var loseMusicHasPlayed = false;

var player1Score = 0;
var player2Score = 0;
const WINNING_SCORE = 3;

var showingWinScreen = false;

var ballX = 50;
var ballY = 50;
var ballSpeedX = 10;
var ballSpeedY = 4;
var ballSize = 10;

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const PADDLE_SPACE_FROM_SIDE = 15;
var paddle1Y = 200;
var paddle2Y = 200;

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

//run on window load
window.onload = function() {
  canvas = document.getElementById('gameCanvas');
  canvasContext = canvas.getContext('2d');
  
  //set fps and init drawing
  var fps = 30;
  setInterval(function() {
    moveEverything();
    drawEverything();
  }, 1000/fps);



  bgMusic.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
  }, false);
  bgMusic.play();

  canvas.addEventListener('mousedown', handleMouseClick);

  canvas.addEventListener('mousemove', function(evt){
    var mousePos = calculateMousePos(evt);
    paddle1Y = mousePos.y - (PADDLE_HEIGHT/2);

  });
}

function computerMovement() {
  var paddle2YCenter = paddle2Y + (PADDLE_HEIGHT/2);

  if (paddle2YCenter < ballY-35) {
    paddle2Y += 8;
  }
  else if (paddle2YCenter > ballY+35) {
    paddle2Y -= 8;
  }
}

//animation
function moveEverything() {
  if(showingWinScreen) {
    return;
  }

  computerMovement();

  ballX += ballSpeedX;
  ballY += ballSpeedY;

  //left side bounce or reset 
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
  //right side bounce or reset
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
  //bounce on y axis
  if(ballY > canvas.height - ballSize || ballY < ballSize) {
    ballSpeedY = -ballSpeedY;
  }
}

// reset ball
function ballReset() {
  if (player1Score >= WINNING_SCORE || player2Score >= WINNING_SCORE) {
    showingWinScreen = true;
  }

  ballSpeedX = -ballSpeedX;
  ballX = canvas.width/2;
  ballY = canvas.height/2;
}

//draw
function drawNet() {
  for (var i=0; i<canvas.height; i+=40) {
    drawRect(canvas.width/2-1, i, 2, 20, 'white');
  }
}

function drawEverything() {

  //draw canvas
  drawRect(0, 0, canvas.width, canvas.height, canvasColor);

  canvasContext.fillStyle = 'white';

  if(showingWinScreen) {
    if (player1Score >= WINNING_SCORE) {
      bgMusic.pause();

      if(!winMusicHasPlayed) {
        winMusic.play();
        winMusicHasPlayed = true;
      }
      canvasContext.fillText('You Won!!!',300,200);
    }
    else if(player2Score >= WINNING_SCORE) {
      bgMusic.pause();

      if(!loseMusicHasPlayed) {
        loseMusic.play();
        loseMusicHasPlayed = true;
      }
      canvasContext.fillText("Computer Won...",200,200);
      canvasContext.fillText("you're kind of lame",200,250);
    }

    
    canvasContext.fillText('play again',300,500);
    return;
  }

  drawNet();

  //draw user paddle
  drawRect(PADDLE_SPACE_FROM_SIDE, paddle1Y, PADDLE_WIDTH, PADDLE_HEIGHT, paddle1Color);
  //draw computer paddle 
  drawRect((canvas.width - PADDLE_WIDTH)-PADDLE_SPACE_FROM_SIDE, paddle2Y, PADDLE_WIDTH, PADDLE_HEIGHT, paddle2Color)
  //draw ball
  drawBall(ballX, ballY, ballSize, ballColor);

  canvasContext.font = "50px Arial";
  canvasContext.fillText(player1Score,200,100);
  canvasContext.fillText(player2Score,canvas.width-200,100);
}

// draw rectangles
function drawRect(leftX, topY, width, height, drawColor) {
  canvasContext.fillStyle = drawColor;
  canvasContext.fillRect(leftX,topY,width,height);
}

// draw ball
function drawBall(leftX, topY, size, drawColor) {
  canvasContext.fillStyle = drawColor;
  canvasContext.beginPath();
  canvasContext.arc(leftX, topY, size, 0, Math.PI*2, true);
  canvasContext.fill();
}

// player controls
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
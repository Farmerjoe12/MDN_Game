var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var score = 0;

var lives = 3;

var ballX = canvas.width/2;
var ballY = canvas.height-30;    
var ball_dx = 2;
var ball_dy = -2;

var ballRadius = 10;

var color = "#0095DD";

var paddleHeight = 10;
var paddleWidth = 75;
var paddleX = (canvas.width-paddleWidth) /2;
var paddle_dx = 5;

var brickRowCount = 3;
var brickColumnCount = 5;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 30;
var brickWidth = (canvas.width - (brickPadding * (brickColumnCount-1)) - (brickOffsetLeft * 2))/brickColumnCount;
var brickHeight = 20;
var bricksAlive = brickRowCount * brickColumnCount;

var bricks = [];
for (var c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (var r = 0; r < brickRowCount; r++) {
        bricks[c][r] = {x : 0, y : 0, status: 1 };
    }
}

var leftPressed = false;
var rightPressed = false;

/** Generate a random color in HEX format **/
function randomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/** Draw the ball on the canvas **/
function drawBall() { 
    ctx.beginPath();
    ctx.arc(ballX, ballY,ballRadius,0, Math.PI*2, false);
    ctx.fillStyle=color;
    ctx.fill();
    ctx.closePath();   
}

/** Draw the paddle on the canvas **/
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth,paddleHeight);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

/** Draw a 2D array of bricks on the canvas **/
function drawBricks() {
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                var brickX = (c*(brickWidth + brickPadding)) + brickOffsetLeft;
                var brickY = (r*(brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX,brickY,brickWidth,brickHeight);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = color;
    ctx.fillText("Score: " + score, 8, 20);
}

function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = color;
    ctx.fillText("Lives: " + lives, canvas.width-65, 20);
}

/** Update the canvas **/
function draw() {     
    // clear the canvas from previous frame
    ctx.clearRect(0,0,canvas.width,canvas.height);   

    // draw the 'actors'
    drawBall();
    drawPaddle();
    drawBricks();

    // draw the score
    drawScore();
    
    // draw player lives
    drawLives();

    // move the ball            
    ballX += ball_dx;
    ballY += ball_dy;  
    
    // collision detection on top of screen
    if (ballY + ball_dy < ballRadius) {
        ball_dy *= -1;
    } 
    // handling collisions with paddle or end
    else if (ballY + ball_dy > canvas.height - paddleHeight) {

        // ball collides with paddle
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            ball_dy += 0.1;
            if (ball_dx < 0) {
                ball_dx -= 0.1;
            } else {
                ball_dx += 0.1;
            }
            ball_dy *= -1;

        // ball misses paddle
        } else {
            lives--;
            if (!lives) {
                alert("GAME OVER - YOU LOSE!\n" +
                    "Your score: " + score);
                document.location.reload();
            } else {
                ballX = canvas.width/2;
                ballY = canvas.height-30;
                ball_dx = 2;
                ball_dy = -2;
                paddleX = (canvas.width-paddleWidth/2);
            }
        }
    }
    
    // collision detection on x-axis
    if (ballX + ball_dx < ballRadius || ballX + ball_dx > canvas.width-ballRadius) {
        ball_dx *= -1;
    }

    // ball - brick collision detection
    collisionDetection();

    // left paddle movement and bounds checking
    if (leftPressed && paddleX > 0) {
        paddleX -= paddle_dx;
    }

    // right paddle movement and bounds checking
    if (rightPressed && paddleX < canvas.width-paddleWidth) {
        paddleX += paddle_dx;
    }

    // end condition
    if (bricksAlive == 0) {
        alert("GAME OVER - YOU WIN!\n" +
                "Your score: " + score);
        document.location.reload();
    }

    requestAnimationFrame(draw);
}

/** Detects collision between ball and bricks **/
function collisionDetection() {
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            var b = bricks[c][r];
            if (b.status == 1) {
                if (ballX > b.x && ballX < b.x+brickWidth && 
                    ballY > b.y && ballY < b.y+brickHeight) {

                    ball_dy *= -1;
                    b.status = 0;
                    bricksAlive--;
                    score += 10;
                    //color = randomColor(); 
                }
            }
        }
    }
}

/** Event listener for key press **/
document.addEventListener("keydown", function (e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
}, false);

/** Event listener for key release **/
document.addEventListener("keyup", function (e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}, false);

/** Event listener for mouse movement **/
canvas.addEventListener("mousemove", function (e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth/2;
    }
}, false);

/** Event listener to prevent scrolling during touch movement **/
document.body.addEventListener("touchmove", function (e) {
    if (e.target == canvas || e.target == document) {
        e.preventDefault();
    }
}, false);

/** Event listener for touch movement **/
canvas.addEventListener("touchmove", function (e) {
    mousePos = getTouchPos(canvas, e);
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
        canvas.dispatchEvent(mouseEvent);
        
}, false);

/** Helper function for handling touch events **/
function getTouchPos(canvasDom, touchEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
        x: touchEvent.touches[0].clientX - rect.left,
        y: touchEvent.touches[0].clientY - rect.top
    };
}

// draw the canvas and everything else
draw();

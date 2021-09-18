
/**
 * Author:     Felipe Santana
 * Created:    11.09.2021
 * (c) Copyright
 * Pong game made with JavaScript
 */


const canvas  = document.getElementById('pong');
const context = canvas.getContext('2d');

//GLOBAL CONSTANTS

const SCREEN_WIDTH  = 480;
const SCREEN_HEIGHT = 640;
const KEY_LEFT      = 37;
const KEY_RIGHT     = 39;
const BAR_WIDTH     = 64;
const BAR_HEIGHT    = 24;
const BALL_SIZE     = 16;
const WALL_WIDTH    = 16;
const LINE_WIDTH    = 16;

const STATE_MACHINE_VISION_RADIUS = 192;

const PLAYER_X_START = Math.round(SCREEN_WIDTH / 2 - BAR_WIDTH / 2);
const PLAYER_Y_START = BAR_HEIGHT;

const STATE_MACHINE_X_START = Math.round(SCREEN_WIDTH / 2 - BALL_SIZE / 2);
const STATE_MACHINE_Y_START = SCREEN_HEIGHT - BAR_HEIGHT * 2 - 4;

const PLAYER_BALL_X_START = Math.round(SCREEN_WIDTH / 2 - BALL_SIZE / 2); 
const PLAYER_BALL_Y_START = BAR_HEIGHT * 2 + 4;

const STATE_MACHINE_BALL_X_START =  Math.round(SCREEN_WIDTH / 2 - BALL_SIZE / 2);
const STATE_MACHINE_BALL_Y_START = SCREEN_HEIGHT - BAR_HEIGHT * 2 - 4 - BALL_SIZE;

//Variables of control

let stepID;

let [ x, y ] = [ PLAYER_X_START, PLAYER_Y_START ]; // Position
let hspeed   = 16; // Horizontal speed
let score    = [ 0, 0 ]; //i = 0 -> player's score | i = 1 -> state machine's score

//STATE MACHINE

let [ machineX, machineY ] = [ STATE_MACHINE_X_START, STATE_MACHINE_Y_START ]; // Position
let machineHSpeed          = 2.5; // Horizontal speed
let stateFlag              = 1; // 1 = Idle | 2 = On alert
let machineHDir            = (Math.random() > .5) ? 1 : -1; // Horizontal direction

//Ball

let [ ballX, ballY ] = [ PLAYER_BALL_X_START, PLAYER_BALL_Y_START ]; // Position
let ballSpeed        = 2; // Speed
let hDir             = (Math.random() > .5) ? 1 : -1; // Horizontal direction
let vDir             = 1; // Vertical direction
let difficultyLevel  = 0;

//Listeners

document.addEventListener('keydown', handleKeyDown);

/**
 *  Key down handler
 * @param {Event} e 
 */
function handleKeyDown(e) {
    const { keyCode } = e;

    // Player's controller

    switch (keyCode) {
        case KEY_LEFT:
            x = Math.max(WALL_WIDTH, x - hspeed);
            break;
        case KEY_RIGHT:
            x = Math.min(SCREEN_WIDTH - BAR_WIDTH - WALL_WIDTH, x + hspeed);
    }
}


/**
 * Returns the distance between two points
 * @param {Number} x1 - A numeric expression
 * @param {Number} y1 - A numeric expression
 * @param {Number} x2 - A numeric expression
 * @param {Number} y2 - A numeric expression
 * @returns distance
 */
function distanceTo(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}


function start() {
    /// Call game step function

    stepID = window.requestAnimationFrame(step);
}

/**
 * Game step function
 */
function step() {
    context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    //Draw game field
    
    context.fillStyle = 'white';

    context.fillRect(0, 0, WALL_WIDTH, SCREEN_HEIGHT);
    context.fillRect(SCREEN_WIDTH - WALL_WIDTH, 0, WALL_WIDTH, SCREEN_HEIGHT);

    //Draw line

    context.strokeStyle = 'white';

    context.beginPath();
    context.setLineDash([16, 20]);
    context.lineWidth = LINE_WIDTH;
    context.moveTo(WALL_WIDTH + BALL_SIZE, Math.round(SCREEN_HEIGHT / 2 - LINE_WIDTH / 2));
    context.lineTo(SCREEN_WIDTH - WALL_WIDTH - BALL_SIZE, Math.round(SCREEN_HEIGHT / 2 - LINE_WIDTH / 2));
    context.stroke();

    //HUD

    context.font = '32pt "HUD Regular"';
    context.fillText(score[0], WALL_WIDTH + 32, SCREEN_HEIGHT / 2 - 64);  // Player's score

    context.fillText(score[1], WALL_WIDTH + 32, SCREEN_HEIGHT / 2 + 84); // State machine's score

    //Bar

    context.fillStyle = 'white'; 
    context.fillRect(x, y, BAR_WIDTH, BAR_HEIGHT); // Draw player's bar

    //Ball

    ballX += (ballSpeed + difficultyLevel) * hDir; // Moves the ball horizontally
    ballY += (ballSpeed + difficultyLevel) * vDir; // Moves the ball vertically

    if (ballX <= WALL_WIDTH || ballX >= (SCREEN_WIDTH - BALL_SIZE - WALL_WIDTH)) { // Horizontal
        hDir *= -1;
    }

    //COLLISION SYSTEM - PLAYER

    if ((ballX + BALL_SIZE >= x && ballX <= x + BAR_WIDTH - BALL_SIZE)
            && ballY <= y + BALL_SIZE + 4 && ballY >= y + BALL_SIZE) { // Vertical 
        vDir            = 1;
        difficultyLevel = Math.min(ballSpeed, difficultyLevel + ballSpeed * .01); // Increase game difficulty
    }

    if (ballY < y + BAR_HEIGHT && ballY >= y) { // Horizontal
        if (ballX + BALL_SIZE >= x && ballX + BALL_SIZE <= x + ballSpeed) { // Left collision
            hDir = -1;
        } else if (ballX <= x + BAR_WIDTH && ballX >= x + BAR_WIDTH - ballSpeed) { // Right collision
            hDir = 1;
        }
    }

    //COLLISION SYSTEM - STATE MACHINE

    if ((ballX + BALL_SIZE >= machineX && ballX <= machineX + BAR_WIDTH - BALL_SIZE)
            && ballY >= machineY - BALL_SIZE - 4 && ballY <= machineY - BALL_SIZE) { // Vertical
        vDir            = -1;
        difficultyLevel = Math.min(ballSpeed, difficultyLevel + ballSpeed * .01); // Increase game difficulty
        console.log('difficulty', difficultyLevel);
    }

    if (ballY + BALL_SIZE > machineY && ballY + BALL_SIZE <= machineY + BAR_HEIGHT) { // Horizontal
        if (ballX + BALL_SIZE >= machineX && ballX + BALL_SIZE <= machineX + ballSpeed) { // Left collision
            hDir = -1;
        } else if (ballX <= machineX + BAR_WIDTH && ballX >= machineX + BAR_WIDTH - ballSpeed) { // Right collision
            hDir = 1;
        }
    }

    context.fillStyle = 'white';
    context.fillRect(ballX, ballY, BALL_SIZE, BALL_SIZE); // Draws the ball

    //STATE MACHINE BEHAVIOUR

    let distanceBetweenBallAndMachine = distanceTo(machineX, machineY, ballX, ballY);
    stateFlag                         = (distanceBetweenBallAndMachine <= STATE_MACHINE_VISION_RADIUS) ? 2 : 1;

    if (stateFlag === 1) {
        if (machineHDir === 0) {
            machineHDir = Math.random() > .5 ? 1 : -1;
        }

        if (machineX <= WALL_WIDTH || machineX >= (SCREEN_WIDTH - BAR_WIDTH - WALL_WIDTH)) {
            machineHDir *= -1;
        }
    } else {
        machineHDir = Math.sign(ballX - machineX);
    }

    machineX = Math.max(WALL_WIDTH, machineX + (machineHSpeed + difficultyLevel)  * machineHDir); // Moves the machine's bar
    machineX = Math.min(SCREEN_WIDTH - BAR_WIDTH - WALL_WIDTH, machineX); // Moves the machine's bar

    context.fillStyle = 'white';
    context.fillRect(machineX, machineY, BAR_WIDTH, BAR_HEIGHT); // Draws the machine state's bar

    //Score

    if (ballY - BALL_SIZE <= 0) { // Verify if the ball left the field on the player's side
        score[1]++;
        newMatch(1);
    } else if (ballY >= SCREEN_HEIGHT) { // Verify if the ball left the field on the machine's side
        score[0]++;
        newMatch(0);
    }

    stepID = window.requestAnimationFrame(step);
}

/**
 * Starts a new match
 * @param {Number} turn - 0 for player | 1 for state machine
 */
function newMatch(turn = 0) {

    // Reset ball's positon

    if (turn === 0) { //Player's turn
        ballX = PLAYER_BALL_X_START;
        ballY = PLAYER_BALL_Y_START;
        vDir  = 1;
    } else {
        ballX = STATE_MACHINE_BALL_X_START;
        ballY = STATE_MACHINE_BALL_Y_START;
        vDir  =  -1;
    }

    hDir            = (Math.random() > .5) ? 1 : -1;
    machineHDir     = (Math.random() > .5) ? 1 : -1;
    difficultyLevel = 0;

    // Reset player's bar position

    x = PLAYER_X_START;
    y = PLAYER_Y_START;

    // Reset state machine's bar position
    
    machineX = STATE_MACHINE_X_START;
    machineY = STATE_MACHINE_Y_START;
}

start();
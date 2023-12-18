const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");

const ROW = 20;
const COL = COLUMN = 10;
const SQ = squareSize = 20;
const VACANT = "#eee"; // color of an empty square

// next Tetromino
let nextPieceCanvas = document.getElementById("next-piece-canvas");
let nextPieceCtx = nextPieceCanvas.getContext("2d");

// draw a square
function drawSquare(x,y,color){
    ctx.fillStyle = color;
    ctx.fillRect(x*SQ,y*SQ,SQ,SQ);

    ctx.strokeStyle = "BLACK";
    ctx.strokeRect(x*SQ,y*SQ,SQ,SQ);
}

// create the board

let board = [];
for( r = 0; r <ROW; r++)
{
    board[r] = [];
    for(c = 0; c < COL; c++)
	{
        board[r][c] = VACANT;
    }
}

// draw the board
function drawBoard()
{
    for( r = 0; r <ROW; r++)
	{
        for(c = 0; c < COL; c++)
		{
            drawSquare(c,r,board[r][c]);
        }
    }
}

drawBoard();

// the pieces and their colors

const PIECES = [
    [Z,"#FF0000"],
    [S,"#08A045"],
    [T,"#FFD300"],
    [O,"#0000FF"],
    [L,"#9146FF"],
    [I,"#00FFFF"],
    [J,"#FF5F00"]
];

// generate random pieces

// Add this function to draw the next Tetromino preview
function drawNextPiece(piece) {
    nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);

    for (let r = 0; r < piece.activeTetromino.length; r++) {
        for (let c = 0; c < piece.activeTetromino[r].length; c++) {
            if (piece.activeTetromino[r][c]) {
                drawSquarePreview(c, r, piece.color);
            }
        }
    }
}

// Add this function to draw a square on the preview canvas
function drawSquarePreview(x, y, color) {
    nextPieceCtx.fillStyle = color;
    nextPieceCtx.fillRect(x * SQ, y * SQ, SQ, SQ);

    nextPieceCtx.strokeStyle = "BLACK";
    nextPieceCtx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

// Call the drawNextPiece function when creating a new piece
function randomPiece() {
    let r = Math.floor(Math.random() * PIECES.length);
    let newPiece = new Piece(PIECES[r][0], PIECES[r][1]);
    drawNextPiece(newPiece); // Draw the next Tetromino preview
    return newPiece;
}

// Initialize the next piece after the page loads
let p = randomPiece();

// Call the drawNextPiece function after each piece is locked
Piece.prototype.lock = function () {
    // ... (existing code)

    // Initialize the next piece after the current piece is locked
    p = randomPiece();
    drawNextPiece(p); // Draw the next Tetromino preview
};

// Call the drawNextPiece function after the page loads
document.addEventListener("DOMContentLoaded", function () {
    drawNextPiece(p);
    p.draw(); // Draw the initial piece on the game board
});

// ... (rest of your existing code)


// The Object Piece

function Piece(tetromino,color)
{
    this.tetromino = tetromino;
    this.color = color;
    
    this.tetrominoN = 0; // we start from the first pattern
    this.activeTetromino = this.tetromino[this.tetrominoN];
    
    // we need to control the pieces
    this.x = 3;
    this.y = -2;
}

// fill function

Piece.prototype.fill = function(color)
{
    for( r = 0; r < this.activeTetromino.length; r++)
	{
        for(c = 0; c < this.activeTetromino.length; c++)
		{
            // we draw only occupied squares
            if( this.activeTetromino[r][c])
			{
                drawSquare(this.x + c,this.y + r, color);
            }
        }
    }
}

// draw a piece to the board

Piece.prototype.draw = function(){
    this.fill(this.color);
}

// undraw a piece


Piece.prototype.unDraw = function(){
    this.fill(VACANT);
}

// move Down the piece

Piece.prototype.moveDown = function() {
	
    if(!this.collision(0,1,this.activeTetromino))
	{
        this.unDraw();
        this.y++;
        this.draw();
    }else
	{
        // we lock the piece and generate a new one
        this.lock();
        p = randomPiece();
    }
    
}

// move Right the piece
Piece.prototype.moveRight = function(){
    if(!this.collision(1,0,this.activeTetromino)){
        this.unDraw();
        this.x++;
        this.draw();
    }
}

// move Left the piece
Piece.prototype.moveLeft = function(){
    if(!this.collision(-1,0,this.activeTetromino)){
        this.unDraw();
        this.x--;
        this.draw();
    }
}

// rotate the piece
Piece.prototype.rotate = function(){
    let nextPattern = this.tetromino[(this.tetrominoN + 1)%this.tetromino.length];
    let kick = 0;
    
    if(this.collision(0,0,nextPattern)){
        if(this.x > COL/2){
            // it's the right wall
            kick = -1; // we need to move the piece to the left
        }else{
            // it's the left wall
            kick = 1; // we need to move the piece to the right
        }
    }
    
    if(!this.collision(kick,0,nextPattern)){
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1)%this.tetromino.length; // (0+1)%4 => 1
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

let score = 0;

Piece.prototype.lock = function(){
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // we skip the vacant squares
            if( !this.activeTetromino[r][c]){
                continue;
            }
            // pieces to lock on top = game over
            if(this.y + r < 0){
                // stop request animation frame
                // add sound effect
                gameOver = true;
                document.getElementById("game-over-message").style.display = "block";
                const audio = new Audio("./audio/gameOver.mp3");
                audio.play();
                break;
            }
            // we lock the piece
            board[this.y+r][this.x+c] = this.color;
        }
    }
    // remove full rows
    for(r = 0; r < ROW; r++){
        let isRowFull = true;
        for( c = 0; c < COL; c++){
            isRowFull = isRowFull && (board[r][c] != VACANT);
        }
        if(isRowFull){
            // if the row is full
            // we move down all the rows above it
            for( y = r; y > 1; y--){
                for( c = 0; c < COL; c++){
                    board[y][c] = board[y-1][c];
                }
            }
            // the top row board[0][..] has no row above it
            for( c = 0; c < COL; c++){
                board[0][c] = VACANT;
            }
            // increment the score
            score += 10;
        }
    }
    // update the board
    drawBoard();
    
    // update the score
    scoreElement.innerHTML = score;

    p = randomPiece();
    drawNextPiece(p); // Draw the next Tetromino preview
}

// collision fucntion

Piece.prototype.collision = function(x,y,piece){
    for( r = 0; r < piece.length; r++){
        for(c = 0; c < piece.length; c++){
            // if the square is empty, we skip it
            if(!piece[r][c]){
                continue;
            }
            // coordinates of the piece after movement
            let newX = this.x + c + x;
            let newY = this.y + r + y;
            
            // conditions
            if(newX < 0 || newX >= COL || newY >= ROW){
                return true;
            }
            // skip newY < 0; board[-1] will crush our game
            if(newY < 0){
                continue;
            }
            // check if there is a locked piece alrady in place
            if( board[newY][newX] != VACANT){
                return true;
            }
        }
    }
    return false;
}

// CONTROL the piece

document.addEventListener("keydown",CONTROL);

function CONTROL(event){

    if(gameOver == false)
    {
        // 37 : Arrow Left | 81 : Q Key
        if(event.keyCode == 37 || event.keyCode == 81)
        {
            p.moveLeft();
            dropStart = Date.now();
    
            // 38 : Arrow UP | 82 : R Key
        }else if(event.keyCode == 38 || event.keyCode == 82)
        {
            p.rotate();
            p.moveDown();
            dropStart = Date.now();
    
            // 39 : Arrow Right | 68 : D Key
        }else if(event.keyCode == 39 || event.keyCode == 68)
        {
            p.moveRight();
            dropStart = Date.now();
    
            // 40 : Arrow Down | 83 : S Key
        }else if(event.keyCode == 40 || event.keyCode == 83)
        {
            p.moveDown();
        }
    }
    if(event.keyCode == 32)
    {
        // 32 : space for restart
        if(gameOver)
            location.reload();
    }
}

// drop the piece every 1sec

let dropStart = Date.now();
let gameOver = false;
function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > 1000)
    {
        p.moveDown();
        dropStart = Date.now();
    }
    if( !gameOver){
        requestAnimationFrame(drop);
    }
}

drop();

/** Sound Player **/

const player = document.getElementById("playSound");
var f = false;
function playSound () {

    if(f == false)
    {
        player.play(); 
        player.volume = 0.25;
        f = true;
    }else
    {
        player.pause();
        f = false;
    }
}

// The Buttons 
// Assuming there's only one element with each class name
let buttonLeft = document.getElementsByClassName("left")[0];
let buttonRight = document.getElementsByClassName("right")[0];
let buttonDown = document.getElementsByClassName("down")[0];
let buttonUP = document.getElementsByClassName("rotate")[0];

buttonLeft.addEventListener("click", () => { 
	if(!gameOver)
		p.moveLeft()
});
buttonRight.addEventListener('click', () => { 
	if(!gameOver)
		p.moveRight() 
});
buttonDown.addEventListener('click', () => { 
	if(!gameOver)
		p.moveDown() 
});
buttonUP.addEventListener('click', () => { 
	if(!gameOver)
		p.rotate() 
});

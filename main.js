// gb defines
var LEFT_MOST = 10;
var TOP_MOST = 10;

// define the hexagon
var ROOT_3 = 1.7320508075688772935274463415058723669428052538103806280558;
var LINE_LENGTH;

// for drawing
var LINE_WIDTH;
var SCORE_LINE_WIDTH;
var FONT_PT;

// these are all derived from the line length
var HEX_HEIGHT;
var HEX_WIDTH;
var HEX_SIDE_RUN;
var HEX_SIZE_RISE;

SetScale(1);

// a sample game board
var rowColToLoad;

var gGameBoard;
var gMouseX = 0;
var gMouseY = 0;
var gNeedsRedrawn = true;
var INTERVAL_TIME = 20;

var gLastClickedPieceIndex = -10;

var gUnplayedPieces = new Array();

var gSeed = 0;

var DIRECTION =
{
	"VERTICAL": 0,
	"DIAG_DOWN": 1,
	"DIAG_UP": 2,
	"NUM_DIRECTIONS": 3
}

function SetScale(scale)
{
	LINE_LENGTH = scale*50;

	// for drawing
	LINE_WIDTH = LINE_LENGTH / 10;
	SCORE_LINE_WIDTH = LINE_WIDTH * 3;
	FONT_PT = LINE_LENGTH / 3.75;

	// these are all derived from the line length
	HEX_HEIGHT = ROOT_3 * LINE_LENGTH;
	HEX_WIDTH = 2 * HEX_HEIGHT / ROOT_3;
	HEX_SIDE_RUN = HEX_HEIGHT / (2 * ROOT_3);
	HEX_SIZE_RISE = HEX_HEIGHT / 2;
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function SetSeed(seed)
{
	gSeed = seed;
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function SeededRandom()
{
	var value = 0x7fffffff & (gSeed);
	var next = gSeed ^ 0x1d872b41;
	var temp = next ^ (next >> 5);
	gSeed = temp ^ (next ^ (temp << 27));
	return value;
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function getUrlVars()
{
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for (var i = 0; i < hashes.length; i++)
	{
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function Init()
{
	// get url vals
	var urlVars = getUrlVars();
	
	// seed
	SetSeed(urlVars["seed"] ? urlVars["seed"] : Math.random() * 0x7fffffff);
	
	// board type
	if (urlVars["board"] && gBoards[urlVars["board"]])
		rowColToLoad = gBoards[urlVars["board"]]
	else
		rowColToLoad = gBoards[0];
	
	// get the canvas
	var drawingCanvas = document.getElementById('myDrawing');

	// create the game board
	gGameBoard = new GameBoard();
	if (urlVars["editMode"])
	{
		SetScale(0.5);
		
		// tell the board we're editing
		gGameBoard.mIsEditMode = true;
		
		// clear any previous row/col info
		rowColToLoad = [];
		
		// have to stagger the every other row, give them a bunch to play with
		var offset = 0;
		for (var row = 0; row < 24; ++row)
		{
			offset = row % 2;
			for (var col = 0; col < 12; ++col)
			{
				rowColToLoad.push([row, offset+col*2]);
			}
		}
	}

	gGameBoard.InitEmptyGrid(rowColToLoad);
	
	gGameBoard.InitGamePieces();
	Draw();
	setInterval(Draw, INTERVAL_TIME);
	
	// capture mouse events
	drawingCanvas.addEventListener('mousedown', ev_mousedown, false);
}

//-----------------------------------------------------------------------------
// draw everything if state has changed
//-----------------------------------------------------------------------------
function Draw()
{
	// don't do anything if state hasn't changed
	if (gNeedsRedrawn == false)
		return;

	// get the drawing canvas and draw
	var drawingCanvas = document.getElementById('myDrawing');
	if (drawingCanvas.getContext)
	{
		// we need to redraw only once per state change
		gNeedsRedrawn = false;
		
		// get the context
		var context = drawingCanvas.getContext('2d');
		
		// draw game objects
		gGameBoard.Draw(context);
	}
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function NeedToRedraw()
{
	gNeedsRedrawn = true;
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function GetColorFromScore(score)
{
	switch (score)
	{
		case 1:
			return '#aaa'; // black
		case 2:
			return '#cfc'; // lightest blue
		case 3:
			return '#fcc'; // pink
		case 4:
			return '#55f'; // blue
		case 5:
			return '#ccf'; // light blue
		case 6:
			return '#f00';  // red
		case 7:
			return '#fc0';  // light green
		case 8:
			return '#dc0'; // orange
		case 9:
			return '#cc0'; // yellow
		default:
			return '#111';
	}
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function ev_mousedown(ev)
{
	var x, y;

	// Get the mouse position relative to the canvas element.
	if (ev.layerX || ev.layerX == 0)
	{ // Firefox
		x = ev.layerX;
		y = ev.layerY;
	} 
	else if (ev.offsetX || ev.offsetX == 0)
	{ // Opera
		x = ev.offsetX;
		y = ev.offsetY;
	}

	// try to place the piece in the clicked spot
	if (gGameBoard.HandleMouseDown(x, y))
	{
	}
}



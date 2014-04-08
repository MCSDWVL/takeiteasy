//-----------------------------------------------------------------------------
// holds the pieces
//-----------------------------------------------------------------------------
function GameBoard()
{
	// the array of game pieces
	this.mGamePieces = new Array();

	// the current gamepiece to place
	this.mActiveGamePiece;

	// are we making a board?!
	this.mIsEditMode = false;
	this.mEditModeHighlighted = new Array();

	// have we calculated the score yet and what is it
	this.mCalculatedScore = false;
	this.mScore = 0;

	// tweakers for how we score
	this.mCountContinuousOnly = true; // do pieces score separately or together across gaps?
	this.mCountSingletons = true; // do piece in a set by themselves score?

	// arrays of indices that indicate which items are in "sets" together, by direction type
	this.mSets = new Array();
	
	// how many sets are there in each direction
	this.mSetsCounter = [0, 0, 0];

	// useful to track the highest row/column for when it comes time to create the sets
	this.mHighestRow = -1;
	this.mHighestColumn = -1;

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.InitEmptyGrid = function(rowColPairs)
	{
		// create the grid
		for (var i = 0; i < rowColPairs.length; ++i)
		{
			var gp = new GridPiece();
			gp.mRow = rowColPairs[i][0];
			gp.mCol = rowColPairs[i][1];
			gp.EstablishPoints();
			this.mGamePieces[i] = gp;

			// update our highest row/column
			if (gp.GetRow() > this.mHighestRow)
				this.mHighestRow = gp.GetRow();

			if (gp.GetColumn() > this.mHighestColumn)
				this.mHighestColumn = gp.GetColumn();
		}

		// setup the sets!
		this.CreateSetLists();
	}
	
	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.InitGamePieces = function()
	{
		// init the random array of available pieces
		//  vert can be			1, 5, 9
		//  diag up can be		2, 6, 7
		//	diag down can be	3, 4, 8
		var verticalScores = [1, 5, 9];
		var diagUpScores = [2, 6, 7];
		var diagDownScores = [3, 4, 8];
		for (var vertScore in verticalScores)
		{
			for (var dUpScore in diagUpScores)
			{
				for (var dDownScore in diagDownScores)
				{
					var gp = new GridPiece();
					gp.mPoints[DIRECTION.VERTICAL] = verticalScores[vertScore];
					gp.mPoints[DIRECTION.DIAG_UP] = diagUpScores[dUpScore];
					gp.mPoints[DIRECTION.DIAG_DOWN] = diagDownScores[dDownScore];
					gp.EstablishPoints();
					gUnplayedPieces.push(gp);
				}
			}
		}

		// shuffle the array
		for (var i = 0; i < gUnplayedPieces.length; ++i)
		{
			// get a random index from the array
			var randNum = SeededRandom();
			var randIdx = randNum % gUnplayedPieces.length;
			if (randIdx >= gUnplayedPieces.length)
				continue;

			// swap the pieces
			var tmp = gUnplayedPieces[i];
			gUnplayedPieces[i] = gUnplayedPieces[randIdx];
			gUnplayedPieces[randIdx] = tmp;
		}

		// set the unplayed piece as the first random piece
		this.mActiveGamePiece = gUnplayedPieces.pop();
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.GetPieceIndexByRowAndCol = function(row, col)
	{
		for (var i = 0; i < this.mGamePieces.length; ++i)
		{
			if (this.mGamePieces[i].GetRow() == row && this.mGamePieces[i].GetColumn() == col)
				return i;
		}
		return -1;
	}
	
	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.CreateSetLists = function()
	{
		// keep track of which items have been added already
		var isInGroup = new Array();

		// iterate each direction each piece
		for (var dir = DIRECTION.VERTICAL; dir < DIRECTION.NUM_DIRECTIONS; ++dir)
		{
			isInGroup[dir] = new Array();
			this.mSets[dir] = new Array();
			for (var i = 0; i < this.mGamePieces.length; ++i)
			{
				// if we're already in a group move on to the next piece
				if (isInGroup[dir] != undefined && isInGroup[dir][i] != undefined && isInGroup[dir][i])
				{
					continue;
				}

				// we're not already in a group!  We should start one
				var groupNum = this.mSetsCounter[dir]++;
				this.mSets[dir][groupNum] = new Array();

				// go continually in our "direction" until we violate one of our constraints
				var nextCol = this.mGamePieces[i].GetColumn();
				var nextRow = this.mGamePieces[i].GetRow();

				while (nextCol <= this.mHighestColumn && nextRow <= this.mHighestRow && nextCol >= 0 && nextRow >= 0)
				{
					var npIdx = this.GetPieceIndexByRowAndCol(nextRow, nextCol);
					if (npIdx >= 0)
					{
						isInGroup[dir][npIdx] = true;
						this.mSets[dir][groupNum].push(npIdx);
						//alert("Adding GP" + npIdx + " to group [" + dir + ", " + groupNum + "]: " + this.mGamePieces[npIdx].toString());
					}
					else if (this.mCountContinuousOnly)
					{
						// if we're counting continuous only and we hit a dead spot then break out
						break;
					}

					// next piece in the direction we want
					if (dir == DIRECTION.VERTICAL)
					{
						// down 2 rows since pieces are staggered
						nextRow += 2;
					}
					else if (dir == DIRECTION.DIAG_DOWN)
					{
						//down one right one
						nextRow++;
						nextCol++;
					}
					else if (dir == DIRECTION.DIAG_UP)
					{
						// down one left one
						nextRow++;
						nextCol--;
					}
				}
			}
		}
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.HandleMouseDown = function(x, y)
	{
		var gp, closest;
		var closestIdx;
		var minDist = 10000;
		for (var i = 0; i < this.mGamePieces.length; ++i)
		{
			gp = this.mGamePieces[i];
			var gpDist = gp.GetDistanceToPointFromCenter(x, y);
			if (gpDist < minDist)
			{
				closest = gp;
				closestIdx = i;
				minDist = gpDist;
			}
		}

		if (closest && minDist < LINE_LENGTH && closest.isEmpty())
		{
			if (this.mIsEditMode)
			{
				this.mEditModeHighlighted[closestIdx] = !this.mEditModeHighlighted[closestIdx];

				var outputForCPP = "{"
				var boardoutput = "[";
				for (var i = 0; i < this.mGamePieces.length; ++i)
				{
					if (this.mEditModeHighlighted[i])
					{
						boardoutput += "[" + this.mGamePieces[i].GetRow() + "," + this.mGamePieces[i].GetColumn() + "], ";
						outputForCPP += "RowColPair(" + this.mGamePieces[i].GetRow() + "," + this.mGamePieces[i].GetColumn() + "), ";
					}
				}
				boardoutput += "]";
				outputForCPP += "}";
				document.all.editoroutput.innerHTML = boardoutput + "<br/>" + outputForCPP;
			}
			else
			{
				// clicked an empty square!  place our piece! (just copy relevant info)
				closest.mPoints = this.mActiveGamePiece.mPoints;

				// get the next piece into active
				this.mActiveGamePiece = gUnplayedPieces.pop();
			}

			// track what we clicked last
			gLastClickedPieceIndex = closestIdx;

			// need to redraw
			NeedToRedraw();
			return true;
		}
		return false;
	}

	//-----------------------------------------------------------------------------
	// Draw - just pass on to all the game pieces?
	//-----------------------------------------------------------------------------
	this.Draw = function(context)
	{
		var isDone = true;
		for (var i = 0; i < this.mGamePieces.length; ++i)
		{
			var color = false;
			if (this.mIsEditMode && this.mEditModeHighlighted[i])
				color = true;

			this.mGamePieces[i].Draw(context, color);
			if (this.mGamePieces[i].isEmpty())
				isDone = false;
		}

		if (this.mIsEditMode == false)
		{
			if (isDone == false)
				this.mActiveGamePiece.Draw(context, false);
			else if (this.mCalculatedScore == false)
				this.CalculateScore();
			else
			{
				context.globalAlpha = 1.0;
				context.font = 100 + "pt arial";
				context.fillStyle = '#000';
				context.fillText(this.mScore, this.mActiveGamePiece.GetX(), this.mActiveGamePiece.GetY());
			}
		}
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.GetSet = function(dir, idx)
	{
		var tmp = new Array();
		var ctr = 0;
		for (i in this.mSets[dir][idx])
		{
			var pieceIdx = this.mSets[dir][idx][i];
			tmp[ctr++] = this.mGamePieces[pieceIdx];
		}

		return tmp;
	}
	
	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.CalculateScore = function()
	{
		var totalScore = 0;

		for (var dir = 0; dir < DIRECTION.NUM_DIRECTIONS; ++dir)
		{
			for (var i = 0; i < this.mSetsCounter[dir]; ++i)
			{
				var setOfPieces = this.GetSet(dir, i);
				if (setOfPieces.length < 2 && this.mCountSingletons == false)
					continue;
					
				var lastScore = -1;
				var scoreThis = true;
				for (pieceIdx in setOfPieces)
				{
					if (lastScore == -1)
					{
						lastScore = setOfPieces[pieceIdx].mPoints[dir];
						continue;
					}
					else if (lastScore != setOfPieces[pieceIdx].mPoints[dir])
					{
						scoreThis = false;
						break;
					}
				}
				if (scoreThis)
				{
					totalScore += setOfPieces.length * lastScore;
				}
				else
				{
					for (pieceIdx in setOfPieces)
						setOfPieces[pieceIdx].mPieceScores[dir] = false;
				}
			}
		}

		// total!
		this.mScore = totalScore;
		this.mCalculatedScore = true;
		NeedToRedraw();
		return;
	}
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function GridPiece()
{
	//
	this.mRow = -1;
	this.mCol = -1;

	// point values of this piece, -1 if it's an empty hex
	//  vert can be			1, 5, 9
	//  diag up can be		2, 6, 7
	//	diag down can be	3, 4, 8
	this.mPoints = [-1, -1, -1]; 
	
	// does this piece score any points?
	this.mPieceScores = [true, true, true];

	// define some of the positions around the hex that we'll need later
	var x0, x1, x2, x3;
	var y0, y1, y2;
	var lX, rX, lY, uY, bY, tY, mX;

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.EstablishPoints = function()
	{
		// all the vertices of the hex
		x0 = this.GetX();
		x1 = x0 + HEX_SIDE_RUN;
		x2 = x1 + LINE_LENGTH;
		x3 = x2 + HEX_SIDE_RUN;
		y0 = this.GetY();
		y1 = y0 + HEX_SIZE_RISE;
		y2 = y1 + HEX_SIZE_RISE;

		// all the points on the edges
		lX = x0 + (x1 - x0) / 2.0;
		rX = x2 + (x3 - x2) / 2.0;
		uY = y0 + (y1 - y0) / 2.0;
		lY = y1 + (y2 - y1) / 2.0;
		mX = x1 + (x2 - x1) / 2.0;
		tY = y0;
		bY = y2;
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.GetHeight = function() { return HEX_HEIGHT; }
	this.GetWidth = function() { return HEX_WIDTH; }

	//-----------------------------------------------------------------------------
	// GetX - the left of the guy
	//-----------------------------------------------------------------------------
	this.GetX = function()
	{
		var leftMost = 10;

		// special case for the active piece
		if (this.GetColumn() == -1)
			return leftMost + (gGameBoard.mHighestColumn+3) * (this.GetWidth() - HEX_SIDE_RUN);

		return leftMost + this.GetColumn() * (this.GetWidth() - HEX_SIDE_RUN);
	}

	//-----------------------------------------------------------------------------
	// GetY - top of the tile
	//-----------------------------------------------------------------------------
	this.GetY = function()
	{
		var topMost = 10;

		// special case the active piece
		if (this.GetRow() == -1)
			return topMost + 4 * this.GetHeight() / 2.0;
		
		return topMost + this.GetRow() * this.GetHeight() / 2.0;
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.GetColumn = function()
	{
		return this.mCol;
	}
	
	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.GetRow = function()
	{
		return this.mRow;
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.GetDistanceToPointFromCenter = function(x, y)
	{
		var centerX = this.GetX() + this.GetWidth() / 2.0;
		var centerY = this.GetY() + this.GetHeight() / 2.0;
		var xdist = x - centerX;
		var ydist = y - centerY;
		return Math.sqrt(xdist * xdist + ydist * ydist);
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.GetNeighbors = function()
	{
		alert("not implemented");
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.DrawVerticalScoreLine = function(context)
	{
		this.DrawScoreLine(context, this.mPoints[DIRECTION.VERTICAL], mX, tY, mX, bY, mX - .4 * FONT_PT, tY + 1.1 * FONT_PT, this.mPieceScores[DIRECTION.VERTICAL]);
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.DrawLowerToUpperScoreLine = function(context)
	{
		this.DrawScoreLine(context, this.mPoints[DIRECTION.DIAG_UP], lX, lY, rX, uY, lX + .2 * FONT_PT, lY + .25 * FONT_PT, this.mPieceScores[DIRECTION.DIAG_UP]);
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.DrawUpperToLowerScoreLine = function(context)
	{
		this.DrawScoreLine(context, this.mPoints[DIRECTION.DIAG_DOWN], lX, uY, rX, lY, lX + .2 * FONT_PT, uY + .9 * FONT_PT, this.mPieceScores[DIRECTION.DIAG_DOWN]);
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.DrawScoreLine = function(context, score, startX, startY, endX, endY, textX, textY, pieceScores)
	{
		// Set the style properties
		context.lineWidth = SCORE_LINE_WIDTH;

		if(pieceScores)
		{
			context.fillStyle = GetColorFromScore(score);
			context.strokeStyle = GetColorFromScore(score);
		}
		else
		{
			context.fillStyle = '#eee';
			context.strokeStyle = '#eee';
		}
		

		context.beginPath();

		context.moveTo(startX, startY);
		context.lineTo(endX, endY);
		context.fill();
		context.stroke();

		context.font = FONT_PT + "pt arial";
		context.closePath();

		context.fillStyle = '#000';
		context.fillText(score, textX, textY);
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.Draw = function(context, colorIt)
	{
		// Set the style properties
		if (colorIt)
			context.fillStyle = '#aaf';
		else
			context.fillStyle = '#fff';

		context.strokeStyle = '#000';
		context.lineWidth = LINE_WIDTH;

		context.beginPath();

		// Start from the top-left point.

		context.moveTo(x1, y0); // give the (x,y) coordinates
		context.lineTo(x2, y0);
		context.lineTo(x3, y1);
		context.lineTo(x2, y2);
		context.lineTo(x1, y2);
		context.lineTo(x0, y1);
		context.lineTo(x1, y0);

		// Done! Now fill the shape, and draw the stroke.
		// Note: your shape will not be visible until you call any of the two methods.
		context.fill();
		context.stroke();
		context.closePath();

		// draw the colors if there are any
		if (this.isEmpty() == false)
		{
			// need to draw piece in order of highest score
			var numScoresDrawn = 0;
			var scores = new Array(this.mPoints[0], this.mPoints[1], this.mPoints[2]);

			for (var i = 0; i < 3; ++i)
			{
				if (scores[0] < scores[1] && scores[0] < scores[2])
				{
					this.DrawVerticalScoreLine(context);
					scores[0] = 1000;
				}
				else if (scores[1] < scores[2])
				{
					this.DrawUpperToLowerScoreLine(context);
					scores[1] = 1000;
				}
				else
				{
					this.DrawLowerToUpperScoreLine(context);
					scores[2] = 1000;
				}
			}
		}
	}
	
	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.isEmpty = function()
	{
		return this.mPoints[0] <= 0;
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.toString = function()
	{
		return "GP(" + this.GetRow() + ", " + this.GetColumn() + ") VUD(" + this.mPoints[DIRECTION.VERTICAL] + ", " + this.mPoints[DIRECTION.DIAG_UP] + ", " + this.mPoints[DIRECTION.DIAG_DOWN] + ")";
	}
}
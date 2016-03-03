var PlayerType = {
	HORI: 0,
	VERT: 1
};

var IAMethod = {
	MinMax: 0,
	MinMax_AB: 1,
	Negamax: 2,
	Negamax_AB: 3,
	Negamax_AB_Time: 4
};


var Player = function (type) {

	this.initialType = type;
	this.currentType = type;

	this.possibilities = null;
	this.refreshPossibilities = true;
};

Player.prototype.toggleType = function () {

	this.currentType = !this.currentType;

}

Player.prototype.canPlay = function (board) {

	return this.getNumPossibilities(board) > 0;

};

Player.prototype.getNumPossibilities = function (board, force) {

	if (this.currentType == PlayerType.HORI)
		return this.getHoriPossibilities(board).length;
	else if (this.currentType == PlayerType.VERT)
		return this.getVertPossibilities(board).length;


};

Player.prototype.getPossibilities = function (board, force) {

	if (!force)
		force = false;

	if (this.refreshPossibilities || force) {

		if (this.currentType == PlayerType.HORI)
			this.possibilities = this.getHoriPossibilities(board);
		else if (this.currentType == PlayerType.VERT)
			this.possibilities = this.getVertPossibilities(board);

		this.refreshPossibilities = false;
	}

	return this.possibilities;

};

Player.prototype.getHoriPossibilities = function (board) {

	var possibilities = new Array();

	for (var i = 0; i < board.length; i++) {
		var row = board[i];

		for (var j = 0; j < row.length - 1; j++) {

			var curr = row[j];
			var next = row[j + 1];

			if (!curr && !next) {
				possibilities.push(new Move(i, j, false));
			}

		}

	}

	return possibilities;

};

Player.prototype.getVertPossibilities = function (board) {

	var possibilities = new Array();

	for (var i = 0; i < board.length - 1; i++) {
		var curr = board[i];
		var next = board[i + 1];

		for (var j = 0; j < curr.length; j++) {

			var curr_pos = curr[j];
			var next_pos = next[j];

			if (!curr_pos && !next_pos) {
				possibilities.push(new Move(i, j, true));
			}

		}

	}

	return possibilities;

};

Player.prototype.getOtherType = function () {

	return !this.initialType;

};

Player.prototype.play = function (board, move) {

	board.move(move);

};

Player.prototype.undo = function (board) {

	board.undo();

};




var Human = function (mode) {

	Player.call(this, mode);

};
Human.prototype = Object.create(Player.prototype);






var IA = function (mode) {

	Player.call(this, mode);

	this.method = IAMethod.MinMax;
	this.initialDepth = 3;
	this.currentDepth = 1;

};
IA.prototype = Object.create(Player.prototype);

IA.prototype.evaluate = function (board, current) {

	if (!current)
		current = false;

	if (current) {

		var myPossibilities = this.getNumPossibilities(board.board);

		this.toggleType();
		var otherPossibilities = this.getNumPossibilities(board.board);
		this.toggleType();

	} else {

		var oldType = this.currentType;

		this.currentType = this.initialType;
		var myPossibilities = this.getNumPossibilities(board.board);

		this.toggleType();
		var otherPossibilities = this.getNumPossibilities(board.board);

		this.currentType = oldType;

	}

	return myPossibilities - otherPossibilities;

};

IA.prototype.playBestMove = function (board) {

	var bestMove = {
		move: null,
		eval: 0
	};

	switch (this.method) {
	case IAMethod.MinMax:
		this.max(this.initialDepth, board, bestMove);
		break;
	case IAMethod.MinMax_AB:
		this.max_alphaBeta(this.initialDepth, -50000, 50000, board, bestMove);
		break;
	case IAMethod.Negamax:
		this.negamax(this.initialDepth, board, bestMove);
		break;
	case IAMethod.Negamax_AB:
		this.negamax_alphaBeta(this.initialDepth, -50000, 50000, board, bestMove);
		break;
	case IAMethod.Negamax_AB_Time:
		var tmp = {
			move: null,
			eval: 0
		};
		this.currentDepth = 1;
		while (true) {
			this.negamax_alphaBeta_withTime(this.currentDepth, -50000, 50000, board, tmp);

			if (!TIME.timeIsUp()) {
				this.currentDepth++;
				bestMove.move = tmp.move;
			} else {
				break;
			}
		}
		break;
	}

	console.log(bestMove.move);

	this.play(board, bestMove.move);
};


IA.prototype.max = function (depth, board, bestMove) {

	if (depth == 0)
		return this.evaluate(board, false);

	var eval = -50000;
	var possibilities = this.getPossibilities(board.board, true);

	if (possibilities.length == 0)
		return eval + 1;

	this.toggleType();

	for (var p in possibilities) {

		var move = possibilities[p];

		this.play(board, move);

		var e = this.min(depth - 1, board, bestMove);

		this.undo(board);

		if (e > eval) {
			eval = e;
			if (depth == this.initialDepth)
				bestMove.move = move;
		}

	}

	this.toggleType();

	return eval;

};

IA.prototype.min = function (depth, board, bestMove) {

	if (depth == 0)
		return this.evaluate(board, false);

	var eval = 50000;
	var possibilities = this.getPossibilities(board.board, true);

	if (possibilities.length == 0)
		return eval - 1;

	this.toggleType();

	for (var p in possibilities) {

		var move = possibilities[p];

		this.play(board, move);

		var e = this.max(depth - 1, board, bestMove);

		this.undo(board);

		if (e < eval) {
			eval = e;
			if (depth == this.initialDepth)
				bestMove.move = move;
		}

	}

	this.toggleType();

	return eval;

};
IA.prototype.max_alphaBeta = function (depth, alpha, beta, board, bestMove) {

	if (depth == 0)
		return this.evaluate(board, false);

	var possibilities = this.getPossibilities(board.board, true);

	if (possibilities.length == 0)
		return -49999;

	this.toggleType();

	for (var p in possibilities) {

		var move = possibilities[p];

		this.play(board, move);

		var e = this.min_alphaBeta(depth - 1, alpha, beta, board, bestMove);

		this.undo(board);

		if (e > alpha) {
			alpha = e;

			if (depth == this.initialDepth)
				bestMove.move = move;

			if (alpha >= beta) {
				this.toggleType();
				return beta;
			}
		}

	}

	this.toggleType();

	return alpha;
}

IA.prototype.min_alphaBeta = function (depth, alpha, beta, board, bestMove) {

	if (depth == 0)
		return this.evaluate(board, false);

	var possibilities = this.getPossibilities(board.board, true);

	if (possibilities.length == 0)
		return 49999;

	this.toggleType();

	for (var p in possibilities) {

		var move = possibilities[p];

		this.play(board, move);

		var e = this.max_alphaBeta(depth - 1, alpha, beta, board, bestMove);

		this.undo(board);

		if (e < beta) {
			beta = e;

			if (depth == this.initialDepth)
				bestMove.move = move;

			if (alpha >= beta) {
				this.toggleType();
				return alpha;
			}
		}

	}

	this.toggleType();

	return beta;
}

IA.prototype.negamax = function (depth, board, bestMove) {

	if (depth == 0)
		return this.evaluate(board, true);

	var eval = -50000;
	var possibilities = this.getPossibilities(board.board, true);

	if (possibilities.length == 0)
		return eval + 1;

	this.toggleType();

	for (var p in possibilities) {

		var move = possibilities[p];

		this.play(board, move);

		var e = -this.negamax(depth - 1, board, bestMove);

		this.undo(board);

		if (e > eval) {
			eval = e;

			if (depth == this.initialDepth)
				bestMove.move = move;
		}

	}

	this.toggleType();

	return eval;
}
IA.prototype.negamax_alphaBeta = function (depth, alpha, beta, board, bestMove) {

	if (depth == 0)
		return this.evaluate(board, true);

	var possibilities = this.getPossibilities(board.board, true);

	if (possibilities.length == 0)
		return -49999;

	this.toggleType();

	for (var p in possibilities) {

		var move = possibilities[p];

		this.play(board, move);

		var e = -this.negamax_alphaBeta(depth - 1, -beta, -alpha, board, bestMove);

		this.undo(board);

		if (e > alpha) {
			alpha = e;

			if (depth == this.initialDepth)
				bestMove.move = move;

			if (alpha >= beta) {

				this.toggleType();
				return beta;

			}
		}


	}

	this.toggleType();

	return alpha;
}

IA.prototype.negamax_alphaBeta_withTime = function (depth, alpha, beta, board, bestMove) {

	if (TIME.timeIsUp())
		return 0;

	if (depth == 0)
		return this.evaluate(board, true);

	var possibilities = this.getPossibilities(board.board, true);

	if (possibilities.length == 0)
		return -49999;

	this.toggleType();

	if (TIME.timeIsUp()) {
		this.toggleType();
		return 0;
	}

	for (var p in possibilities) {

		if (TIME.timeIsUp()) {
			this.toggleType();
			return 0;
		}


		var move = possibilities[p];

		this.play(board, move);

		var e = -this.negamax_alphaBeta(depth - 1, -beta, -alpha, board, bestMove);

		this.undo(board);

		if (TIME.timeIsUp()) {
			this.toggleType();
			return 0;
		}

		if (e > alpha) {
			alpha = e;

			if (depth == this.currentDepth)
				bestMove.move = move;

			if (alpha >= beta) {

				this.toggleType();
				return beta;

			}
		}

	}

	this.toggleType();

	return alpha;
}
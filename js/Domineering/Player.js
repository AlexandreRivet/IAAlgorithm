var PlayerType = {
	HORI: 0,
	VERT: 1
};

var IAMethod = {
	MinMax: 0,
	MinMax_AB: 1,
	Negamax: 2,
	Negamax_AB: 3,
	Negamax_AB_Time: 4,
	Negamax_AB_Killer: 5,
	Negamax_AB_Killer_withTime: 6,
	Negamax_AB_Historic: 7,
	Negamax_AB_Historic_withTime: 8
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

	this.timeAllowedToPlay = 2000.0; // en ms
	this.killer = [null, null, null];
	this.history = [];

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

/*********************************************************************************************
PLAY BEST MOVE
*********************************************************************************************/
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

		TIME.start(this.timeAllowedToPlay);

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

	case IAMethod.Negamax_AB_Killer:
		this.negamax_alphaBeta_killer(this.initialDepth, -50000, 50000, board, bestMove);

		this.killer = [null, null, null];
		break;

	case IAMethod.Negamax_AB_Killer_withTime:

		TIME.start(this.timeAllowedToPlay);

		var tmp = {
			move: null,
			eval: 0
		};
		this.currentDepth = 1;
		while (true) {
			this.negamax_alphaBeta_killer_withTime(this.currentDepth, -50000, 50000, board, tmp);

			if (!TIME.timeIsUp()) {
				this.currentDepth++;
				bestMove.move = tmp.move;
			} else {
				break;
			}
		}

		this.killer = [null, null, null];
		break;

	case IAMethod.Negamax_AB_Historic:

		// Reset du tableau
		var board_tmp = new Board(board.w, board.h);
		var posA = this.getHoriPossibilities(board_tmp.board);
		var posB = this.getVertPossibilities(board_tmp.board);
		for (var element in posA) this.history[posA[element].getCode()] = 0;
		for (var element in posB) this.history[posB[element].getCode()] = 0;

		this.negamax_alphaBeta_historic(this.initialDepth, -50000, 50000, board, bestMove);

		this.history = [];
		break;

	case IAMethod.Negamax_AB_Historic_withTime:

		// Reset du tableau
		var board_tmp = new Board(board.w, board.h);
		var posA = this.getHoriPossibilities(board_tmp.board);
		var posB = this.getVertPossibilities(board_tmp.board);
		for (var element in posA) this.history[posA[element].getCode()] = 0;
		for (var element in posB) this.history[posB[element].getCode()] = 0;

		TIME.start(this.timeAllowedToPlay);

		var tmp = {
			move: null,
			eval: 0
		};
		this.currentDepth = 1;
		while (true) {
			this.negamax_alphaBeta_historic_withTime(this.currentDepth, -50000, 50000, board, tmp);

			if (!TIME.timeIsUp()) {
				this.currentDepth++;
				bestMove.move = tmp.move;
			} else {
				break;
			}
		}

		this.history = [];
		break;
	}

	this.play(board, bestMove.move);
};

/*********************************************************************************************
MAX
*********************************************************************************************/
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

/*********************************************************************************************
MIN
*********************************************************************************************/
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

/*********************************************************************************************
MAX ALPHA BETA
*********************************************************************************************/
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

/*********************************************************************************************
MIN ALPHA BETA
*********************************************************************************************/
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

/*********************************************************************************************
NEGAMAX
*********************************************************************************************/
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

/*********************************************************************************************
NEGAMAX ALPHA BETA
*********************************************************************************************/
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


/*********************************************************************************************
NEGAMAX ALPHA BETA KILLER
*********************************************************************************************/
IA.prototype.negamax_alphaBeta_killer = function (depth, alpha, beta, board, bestMove) {

	if (depth == 0)
		return this.evaluate(board, true);

	var possibilities = this.getPossibilities(board.board, true);

	if (possibilities.length == 0)
		return -49999;

	if (board.valid(this.killer[this.initialDepth - depth]))
		possibilities.splice(0, 0, this.killer[this.initialDepth - depth]);

	this.toggleType();

	for (var p in possibilities) {

		var move = possibilities[p];

		this.play(board, move);

		var e = -this.negamax_alphaBeta_killer(depth - 1, -beta, -alpha, board, bestMove);

		this.undo(board);

		if (e > alpha) {
			alpha = e;

			if (depth == this.initialDepth)
				bestMove.move = move;

			if (alpha >= beta) {

				this.killer[this.initialDepth - depth] = move;
				this.toggleType();
				return beta;

			}
		}


	}

	this.toggleType();

	return alpha;

};

/*********************************************************************************************
NEGAMAX ALPHA BETA HISTORIC
*********************************************************************************************/
IA.prototype.negamax_alphaBeta_historic = function (depth, alpha, beta, board, bestMove) {

	if (depth == 0)
		return this.evaluate(board, true);

	var possibilities = this.getPossibilities(board.board, true);

	if (possibilities.length == 0)
		return -49999;

	var self = this;
	possibilities.sort(function (a, b) {

		var elementA = self.history[a.getCode()];
		var elementB = self.history[b.getCode()];

		return elementB - elementA;

	});

	this.toggleType();

	for (var p in possibilities) {

		var move = possibilities[p];

		this.play(board, move);

		var e = -this.negamax_alphaBeta_historic(depth - 1, -beta, -alpha, board, bestMove);

		this.undo(board);

		if (e > alpha) {
			alpha = e;

			if (depth == this.initialDepth)
				bestMove.move = move;

			if (alpha >= beta) {

				this.history[move.getCode()] += Math.pow(4, depth);
				this.toggleType();
				return beta;

			}
		}


	}

	this.toggleType();

	return alpha;

};

/*********************************************************************************************
NEGAMAX ALPHA BETA APPRO.
*********************************************************************************************/
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

		var e = -this.negamax_alphaBeta_withTime(depth - 1, -beta, -alpha, board, bestMove);

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

/*********************************************************************************************
NEGAMAX ALPHA BETA KILLER APPRO.
*********************************************************************************************/
IA.prototype.negamax_alphaBeta_killer_withTime = function (depth, alpha, beta, board, bestMove) {

	if (TIME.timeIsUp())
		return 0;

	if (depth == 0)
		return this.evaluate(board, true);

	var possibilities = this.getPossibilities(board.board, true);

	if (possibilities.length == 0)
		return -49999;

	if (board.valid(this.killer[this.currentDepth - depth]))
		possibilities.splice(0, 0, this.killer[this.currentDepth - depth]);

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

		var e = -this.negamax_alphaBeta_killer_withTime(depth - 1, -beta, -alpha, board, bestMove);

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

				this.killer[this.currentDepth - depth] = move;
				this.toggleType();
				return beta;

			}
		}


	}

	this.toggleType();

	return alpha;

};

/*********************************************************************************************
NEGAMAX ALPHA BETA HISTORIC APPRO.
*********************************************************************************************/
IA.prototype.negamax_alphaBeta_historic_withTime = function (depth, alpha, beta, board, bestMove) {

	if (TIME.timeIsUp())
		return 0;

	if (depth == 0)
		return this.evaluate(board, true);

	var possibilities = this.getPossibilities(board.board, true);

	if (possibilities.length == 0)
		return -49999;

	var self = this;
	possibilities.sort(function (a, b) {

		var elementA = self.history[a.getCode()];
		var elementB = self.history[b.getCode()];

		return elementB - elementA;

	});

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

		var e = -this.negamax_alphaBeta_historic_withTime(depth - 1, -beta, -alpha, board, bestMove);

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

				this.history[move.getCode()] += Math.pow(4, depth);
				this.toggleType();
				return beta;

			}
		}


	}

	this.toggleType();

	return alpha;

};
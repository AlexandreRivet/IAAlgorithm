var PlayerType = {
	HORI: 0,
	VERT: 1
};


var Player = function (type) {

	this.type = type;

	this.possibilities = null;
	this.refreshPossibilities = true;
};

Player.prototype.toggleType = function () {

	this.type = !this.type;

}

Player.prototype.canPlay = function (board) {

	return this.getNumPossibilities(board) > 0;

};

Player.prototype.getNumPossibilities = function (board, force) {

	if (this.type == PlayerType.HORI)
		return this.getHoriPossibilities(board).length;
	else if (this.type == PlayerType.VERT)
		return this.getVertPossibilities(board).length;


};

Player.prototype.getPossibilities = function (board, force) {

	if (!force)
		force = false;

	if (this.refreshPossibilities || force) {

		if (this.type == PlayerType.HORI)
			this.possibilities = this.getHoriPossibilities(board);
		else if (this.type == PlayerType.VERT)
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

	return !this.type;

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

	this.depth = 3;

};
IA.prototype = Object.create(Player.prototype);

IA.prototype.evaluate = function (board) {

	this.toggleType();
	var myPossibilities = this.getNumPossibilities(board.board);

	this.toggleType();
	var otherPossibilities = this.getNumPossibilities(board.board);

	// this.toggleType();

	return myPossibilities - otherPossibilities;

};

IA.prototype.playBestMove = function (board) {

	// var start = new Date().getTime();

	var bestMove = {
		move: null,
		eval: 0
	};

	this.max(this.depth, board, bestMove);

	// console.log((new Date().getTime() - start) + 'ms.');

	this.play(board, bestMove.move);
};


IA.prototype.max = function (depth, board, bestMove) {

	if (depth == 0)
		return this.evaluate(board);

	var eval = -Infinity;
	var possibilities = this.getPossibilities(board.board, true);

	this.toggleType();

	for (var p in possibilities) {

		var move = possibilities[p];

		this.play(board, move);

		var e = this.min(depth - 1, board, bestMove);

		this.undo(board);

		if (e > eval) {
			eval = e;
			bestMove.move = move;
		}

	}

	this.toggleType();

	return eval;

};

IA.prototype.min = function (depth, board, bestMove) {

	if (depth == 0)
		return this.evaluate(board);

	var eval = Infinity;
	var possibilities = this.getPossibilities(board.board, true);

	this.toggleType();

	for (var p in possibilities) {

		var move = possibilities[p];

		this.play(board, move);

		var e = this.max(depth - 1, board, bestMove);

		this.undo(board);

		if (e < eval) {
			eval = e;
			bestMove.move = move;
		}

	}

	this.toggleType();

	return bestMove.eval;

};
var BLOCK_SIZE = 50;

var Board = function (w, h) {

	this.w = w;
	this.h = h;

	this.board = new Array();
	for (var i = 0; i < h; i++) {
		this.board.push(new Array());
		for (var j = 0; j < w; j++) {
			this.board[i].push(false);
		}
	}

	this.moves = []; // Permettra d'avoir un historique des moves

	this.draw = function (ctx) {

		ctx.strokeStyle = 'black';
		for (var r = 0; r < this.h; r++) {
			for (var c = 0; c < this.w; c++) {
				ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
			}
		}

		for (var i = 0, end = this.moves.length; i < end; i++) this.moves[i].draw(ctx, false);

	};

	this.in_bounds = function (move) {

		// Il faut checker par rapport au mode du move
		var blocks = move.blocks();
		for (var i = 0, end = blocks.length; i < end; i++) {
			var block = blocks[i];

			if (block.row < 0 || block.row >= this.h) return false;
			if (block.col < 0 || block.col >= this.w) return false;

		}

		return true;

	};

	this.valid = function (move) {

		var blocks = move.blocks();

		for (var i = 0, end = blocks.length; i < end; i++) {
			if (this.board[blocks[i].row][blocks[i].col]) return false;
		}

		return true;

	};

	this.move = function (move) {

		this.moves.push(move);

		var blocks = move.blocks();
		for (var i = 0, end = blocks.length; i < end; i++) {
			this.board[blocks[i].row][blocks[i].col] = true;
		}

	};

	this.undo = function () {

		var lastMove = this.moves.pop();

		var blocks = lastMove.blocks();
		for (var i = 0, end = blocks.length; i < end; i++) {
			this.board[blocks[i].row][blocks[i].col] = false;
		}

	};


};
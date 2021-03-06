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

		// Dessin des chiffres + des cases

		ctx.strokeStyle = 'black';
		ctx.fillStyle = 'black';
		for (var r = 0; r < this.h; r++) {

			ctx.fillText(r, 25, (r + 0.5) * BLOCK_SIZE + 50);
			ctx.fillText(r, 50 + (r + 0.5) * BLOCK_SIZE, 25);

			for (var c = 0; c < this.w; c++) {
				ctx.strokeRect(50 + c * BLOCK_SIZE, r * BLOCK_SIZE + 50, BLOCK_SIZE, BLOCK_SIZE);
			}
		}

		for (var i = 0, end = this.moves.length; i < end; i++) this.moves[i].draw(ctx, false);

		// Affichage des dix derniers move
		var movesDisplayed = 15;
		var start = (this.moves.length < movesDisplayed) ? 0 : this.moves.length - movesDisplayed;
		var j = 0;
		ctx.font = '10pt Arial';
		for (var i = start; i < this.moves.length; i++) {

			var move = this.moves[i];
			ctx.fillStyle = (move.vertical) ? 'white' : 'black';
			ctx.fillText('[' + move.row + ',' + move.col + ']', 50 + this.w * BLOCK_SIZE + 10, 50 + j * 30);
			j++;

		}

		// Dessin du temps du tour
		if (TIME_TURN != null) {

			var str = 'Turn duration: ' + TIME_TURN + 'ms';
			var widthText = ctx.measureText(str).width;

			ctx.fillStyle = 'black';
			ctx.fillText(str, (this.w * BLOCK_SIZE) / 2 + 50 - widthText / 2, this.h * BLOCK_SIZE + 75);
		}

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

		if (move == null || undefined)
			return false;

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
var Move = function (row, col, vertical) {

	this.row = row;
	this.col = col;
	this.vertical = vertical;

	this.clone = function () {

		return new Move(this.row, this.col, this.vertical);

	}

	this.blocks = function () {

		return [{
			row: this.row,
			col: this.col,
		}, {
			row: this.row + (this.vertical ? 1 : 0),
			col: this.col + (this.vertical ? 0 : 1)
		}];

	};

	this.draw = function (ctx, outline) {

		var w = BLOCK_SIZE * (this.vertical ? 1 : 2);
		var h = BLOCK_SIZE * (this.vertical ? 2 : 1);

		if (outline) {

			ctx.strokeStyle = 'red';
			ctx.strokeRect(this.col * BLOCK_SIZE + 52, this.row * BLOCK_SIZE + 52, w - 4, h - 4);

		} else {

			ctx.fillStyle = (this.vertical) ? 'white' : 'black';
			ctx.fillRect(this.col * BLOCK_SIZE + 51, this.row * BLOCK_SIZE + 51, w - 2, h - 2);

		}

	};

	this.getCode = function () {

		return row + ':' + col + ':' + ((vertical) ? '1' : '0');

	};

};
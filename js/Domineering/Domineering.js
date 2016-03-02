var DomineeringGame = function (w, h, id) {

	this.board = new Board(w, h);
	this.canvas = document.getElementById(id);
	this.canvas.width = this.canvas.clientWidth;
	this.canvas.height = this.canvas.clientHeight;
	this.ctx = this.canvas.getContext('2d');

	this.players = [new Human(PlayerType.HORI), new IA(PlayerType.VERT)];
	this.currentPlayer = -1;

	this.currentMove = null;

	this.update = function () {

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.board.draw(this.ctx);

		if (this.currentMove != null)
			this.currentMove.draw(this.ctx, true);

	};

	this.nextTurn = function () {

		this.currentPlayer++;
		if (this.currentPlayer >= this.players.length)
			this.currentPlayer = 0;

		var player = this.players[this.currentPlayer];

		if (!player.canPlay(this.board.board)) {
			console.log('Je ne peux plus jouer');
			return;
		}

		if (player instanceof IA) {
			player.playBestMove(this.board);
			this.update();

			var self = this;
			setTimeout(function () {
				self.nextTurn();
			}, 100);

		} else if (player instanceof Human) {
			this.currentMove = new Move(0, 0, player.type);
			this.update();
		}

	};

	this.initInterface = function () {

		var self = this;
		window.addEventListener('keyup', function (e) {

			var player = self.players[self.currentPlayer];

			if (player instanceof IA)
				return;

			var keyCode = e.keyCode;
			var move_tmp = new Move(self.currentMove.row, self.currentMove.col, self.currentMove.vertical);

			switch (keyCode) {

			case 13:

				if (self.board.valid(self.currentMove)) {

					self.board.move(self.currentMove);

					self.currentMove = null;
					self.update();

					setTimeout(function () {
						self.nextTurn();
					}, 100);

					return;

				} else {

					alert('Invalid move.');

				}
				break;
			case 37:
				move_tmp.col--;
				break;
			case 38:
				move_tmp.row--;
				break;
			case 39:
				move_tmp.col++;
				break;
			case 40:
				move_tmp.row++;
				break;

			}

			if (self.board.in_bounds(move_tmp)) {
				self.currentMove = move_tmp;
			}

			self.update();

		}, true);

	}

	this.initInterface();
	this.update();
	this.nextTurn();

};
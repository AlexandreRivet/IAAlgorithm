var START_TURN = null;
var TIME_TURN = null;

var DomineeringGame = function (id) {

	this.canvas = document.getElementById(id);
	this.canvas.width = this.canvas.clientWidth;
	this.canvas.height = this.canvas.clientHeight;
	this.ctx = this.canvas.getContext('2d');

	this.interfaceInit = false;

	this.timeoutID = null;

	this.start = function (w, h, playerOne, playerTwo) {

		if (this.timeoutID != null)
			clearTimeout(this.timeoutID);

		TIME_TURN = null;
		BLOCK_SIZE = (this.canvas.width - 100) / w;

		this.board = new Board(w, h);

		this.players = new Array();
		this.players.push(playerOne);
		this.players.push(playerTwo);

		this.currentPlayer = -1;
		this.currentMove = null;

		if (!this.interfaceInit) {
			this.initInterface();
			this.interfaceInit = true;
		}

		this.update();

		var self = this;
		self.timeoutID = setTimeout(function () {
			self.nextTurn();
		}, 100);

	};

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

			var playerMode = (player instanceof IA) ? 'AI' : 'Human';
			var playerType = (player.initialType == PlayerType.HORI) ? 'horizontal' : 'vertical';

			alert(playerMode + ' playing in ' + playerType + ' loses the game.');

			return;
		}

		START_TURN = new Date().getTime();

		if (player instanceof IA) {
			player.playBestMove(this.board);

			TIME_TURN = new Date().getTime() - START_TURN;

			this.update();

			var self = this;
			self.timeoutID = setTimeout(function () {
				self.nextTurn();
			}, 100);

		} else if (player instanceof Human) {
			this.currentMove = new Move(0, 0, player.initialType);
			this.update();
		}

	};

	this.initInterface = function () {

		var self = this;
		window.addEventListener('keyup', function (e) {

			if (self.players == null)
				return;

			var player = self.players[self.currentPlayer];

			if (player instanceof IA)
				return;

			var keyCode = e.keyCode;
			var move_tmp = new Move(self.currentMove.row, self.currentMove.col, self.currentMove.vertical);

			switch (keyCode) {

			case 13:

				if (self.board.valid(self.currentMove)) {

					self.board.move(self.currentMove);

					TIME_TURN = new Date().getTime() - START_TURN;

					self.currentMove = null;
					self.update();

					self.timeoutID = setTimeout(function () {
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

};
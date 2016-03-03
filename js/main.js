var DOMINEERING = null;
var SIZE = 8;
var GAME_MODE = 0;
var FIRST_PLAYER_TYPE = PlayerType.HORI;
var IAMETHOD = IAMethod.Negamax_AB_Killer;

function init() {

	$("#SizeGrid").slider({
		min: 4,
		max: 16,
		value: SIZE,
		slide: function (event, ui) {
			SIZE = ui.value;
			$('#SizeGridValue').html(SIZE);
		}
	});

	$("#button_start").click(function (e) {
		startDomineering();
	});

	$("#TypeOfGame input").change(function () {
		GAME_MODE = parseInt($('input[name=radio_typeGame]:checked', "#TypeOfGame").val());
	});

	$("#TypeOfFirst input").change(function () {
		FIRST_PLAYER_TYPE = parseInt($('input[name=radio_typeFirst]:checked', "#TypeOfFirst").val());
	});

	$("#AITypeEvaluation input").change(function () {
		IAMETHOD = parseInt($('input[name=radio_AIType]:checked', "#AITypeEvaluation").val());
	});

	DOMINEERING = new DomineeringGame('domineering-game');

	// On ajoute toutes les actions possibles

}

function startDomineering() {

	// Récupération des infos
	var size = SIZE;

	playerOneInfo = {};
	playerTwoInfo = {};

	switch (GAME_MODE) {
	case 0:
		playerOneInfo.Mode = IA;
		playerTwoInfo.Mode = IA;
		break;
	case 1:
		playerOneInfo.Mode = IA;
		playerTwoInfo.Mode = Human;
		break;
	case 2:
		playerOneInfo.Mode = Human;
		playerTwoInfo.Mode = IA;
		break;
	case 3:
		playerOneInfo.Mode = Human;
		playerTwoInfo.Mode = Human;
		break;

	}

	playerOneInfo.Type = FIRST_PLAYER_TYPE;
	playerTwoInfo.Type = !FIRST_PLAYER_TYPE;

	var playerOne = new(playerOneInfo.Mode)(playerOneInfo.Type);
	var playerTwo = new(playerTwoInfo.Mode)(playerTwoInfo.Type);

	// Mise à jour des infos supplémentaires

	if (playerOne instanceof IA)
		playerOne.method = IAMETHOD;

	if (playerTwo instanceof IA)
		playerTwo.method = IAMETHOD;

	DOMINEERING.start(size, size, playerOne, playerTwo);

}


$(document).ready(init);
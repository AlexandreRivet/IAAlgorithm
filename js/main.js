var DOMINEERING = null;
var SIZE = 8;
var GAME_MODE = 0;
var FIRST_PLAYER_TYPE = PlayerType.HORI;
var IAMETHOD = IAMethod.MinMax;
var DEPTH = 3;
var TIME_ALLOWED = 500;

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
	
	$("#Depth").slider({
		min: 1,
		max: 6,
		value: DEPTH,
		slide: function (event, ui) {
			DEPTH = ui.value;
			$('#DepthValue').html(DEPTH);
		}
	});
	
	$("#TimeAllowed").slider({
		min: 200,
		max: 2000,
		value: TIME_ALLOWED,
		slide: function (event, ui) {
			TIME_ALLOWED = ui.value;
			$('#TimeAllowedValue').html(TIME_ALLOWED);
		}
	});

	$("#button_start").click(function (e) {
		startDomineering();
	});

	$("#TypeOfGame input").change(function () {
		GAME_MODE = parseInt($('input[name=radio_typeGame]:checked', "#TypeOfGame").val());
		
		if (GAME_MODE != 3) {
		
			$('#AIType').show();
			
		} else {
			
			$('#AIType').hide();
			
		}
	});

	$("#TypeOfFirst input").change(function () {
		FIRST_PLAYER_TYPE = parseInt($('input[name=radio_typeFirst]:checked', "#TypeOfFirst").val());
	});

	$("#AITypeEvaluation input").change(function () {
		IAMETHOD = parseInt($('input[name=radio_AIType]:checked', "#AITypeEvaluation").val());
		
		if (IAMETHOD == IAMethod.Negamax_AB_Time ||
			IAMETHOD == IAMethod.Negamax_AB_Historic_withTime || 
			IAMETHOD == IAMethod.Negamax_AB_Killer_withTime) {
			
			$('#AIDepth').hide();
			$('#AITimeAllowed').show();
			
		}
		else {
			
			$('#AITimeAllowed').hide();
			$('#AIDepth').show();
			
			
		}
	});

	DOMINEERING = new DomineeringGame('domineering-game');

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

	var setPlayer = function(player) {
	
		if (player instanceof IA) {
		
			player.method = IAMETHOD;
			player.initialDepth = DEPTH;
			player.timeAllowedToPlay = TIME_ALLOWED;
			
		}
			
		
	};
	
	setPlayer(playerOne);
	setPlayer(playerTwo);

	DOMINEERING.start(size, size, playerOne, playerTwo);

}


$(document).ready(init);
// Input fields

$("#countryInput").on("change keyup paste",function() {
    inputCountry = $(this).val();
	checkInput(countryData[selectedCode], $("#countryInput"), "country", $("#requireClickCountry").is(":checked"));
    map.updateChoropleth(getCountryColors());
});

$("#capitalInput").on("change keyup paste",function() {
    inputCapital = $(this).val();
    checkInput(countryData[selectedCode], $("#capitalInput"), "capital", $("#requireClickCapital").is(":checked"));
    
    map.updateChoropleth(getCountryColors());
});

// Make the tab key on the capital field go back to the country field, for speedy entering
$('body').on('keydown', '#capitalInput', function(e) {
    if (e.which == 9) {
	        e.preventDefault();
		$("#countryInput").focus();
    }
});


// Flag selection
var selectedFlag = "";
		
$("#flags").on('click', function(event) {
	// Turn off all borders
	$("img").each(function() {
		$(this).css("border", "0");
	});

	// Select flag
	if (event.target != this) {
		var flag = $(event.target);
		flag.css("border", "3px solid yellow");
		selectedFlag = flag.attr('id').replace("-flag","");
		checkFlag();
	}
});

// Hide/show buttons

var countriesRevealed = false;
$("#revealButton").click(function() {
	setAllGuesses(!countriesRevealed);
	updateDisplay();
	countriesRevealed = !countriesRevealed;
	countriesRevealed ? $("#revealButton").text("Reset") : $("#revealButton").text("Solve All");
});

function setAllGuesses(truthiness){
	_.each(countryData, function(country){
		_.each(_.keys(country.guessed), function(guessType) {
			country.guessed[guessType] = truthiness;
		}); 
	});
}

$("#flagDisplayButton").click(function() {
	if ($("#flags").is(":hidden")){
		$("#flags").slideDown();
		$("#flagDisplayButton").text("Hide");
	}
	else {
		$("#flags").slideUp();
		$("#flagDisplayButton").text("Show");
	}
});


// Input verification

function checkFlag(){
	if (selectedFlag == selectedCode) {
		countryData[selectedCode].guessed.flag = true;
		updateDisplay();
	}
}

function checkInput(countryDatum, input, fieldToVerify, clickRequired){
	if (input.val() !== ""){

		var guessIsCorrect = false;

		if (clickRequired){
			guessIsCorrect = verifyInput(countryDatum, input.val(), fieldToVerify);
		}
		else{
			guessIsCorrect = _.some(
				_.map(countryData, function(country){
					return verifyInput(country, input.val(), fieldToVerify);
				})
			);
		}

		if (guessIsCorrect){
			input.val('');
			updateDisplay();
		}
	}
}

function verifyInput(countryDatum, input, fieldToVerify){
	if (countryDatum && !countryDatum.guessed[fieldToVerify]){
		if (_.includes(countryDatum[fieldToVerify], input) && 
			!_.includes(countryDatum[fieldToVerify], "")) {
			countryDatum.guessed[fieldToVerify] = true;
		}
		return countryDatum.guessed[fieldToVerify];
	}
	else {
		return false;
	}
}
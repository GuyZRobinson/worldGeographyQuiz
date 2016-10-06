// Update display

	// Flags
function updateFlags(){
	_.each(countryData, function(country){
		if (country.guessed.flag){
			$("#" + country.iso3 + "-flag").hide();
		}
		else {
			$("#" + country.iso3 + "-flag").show();
		}
	});
}

	// Table
var hbTableSource = $("#countryRowTemplate").html();
var hbTableTemplate = Handlebars.compile(hbTableSource);

function updateTableRows(){
	$("#countriesTableBody").text("");
	var count = 0;
	_.each(countryData, function(country){
		count++;

		var iso3 = country.iso3, name = "?????", capital = "?????", iso2 = "unknown";
		var rowClass = "", countryCellClass = "", capitalCellClass = "", flagCellClass = "";

		if (country.guessed.country){ 
			name = country.country; 
			countryCellClass = "success";
		}
		if (country.guessed.capital){ 
			capital = country.capital; 
			capitalCellClass = "success";
		}
		if (country.guessed.flag){ 
			iso2 = country.iso2; 
			flagCellClass = "success";
		}

		if (_.filter(country.guessed, function(guess) {return guess}).length == Object.keys(country.guessed).length){
			rowClass = "success";
		}

		var hbTableContext = {number: count, country: name, capital: capital, flag: '<img height=25px src="./flags/' + iso2 + '.png">', rowClass: rowClass, countryCellClass:countryCellClass, capitalCellClass: capitalCellClass, flagCellClass: flagCellClass };
		$("#countriesTableBody").append(hbTableTemplate(hbTableContext));
	});
}

updateTableRows();

	// Map and text
function updateDisplay(){
	// Update map colors
	map.updateChoropleth(getCountryColors());

	// Update country count
    var correctCountries = _.filter(countryData, function(country) {return country.guessed.country}).length;
    $("#correctCountries").text(correctCountries + "/" + Object.keys(countryData).length);

    // Update capital count
    var correctCapitals = _.filter(countryData, function(country) {return country.guessed.capital}).length;
    $("#correctCapitals").text(correctCapitals + "/" + Object.keys(countryData).length);

    // Update capital count
    var correctFlags = _.filter(countryData, function(country) {return country.guessed.flag}).length;
    $("#correctFlags").text(correctFlags + "/" + Object.keys(countryData).length);

	updateTableRows();
	updateFlags();

}

// Input fields
$("#countryInput").on("change keyup paste",function() {
    inputCountry = $(this).val();
	checkInput(countryData[selectedCode], $("#requireClickCountry"), $("#countryInput"), 
		"country", "country", "acceptedNames");
    map.updateChoropleth(getCountryColors());
});

$("#capitalInput").on("change keyup paste",function() {
    inputCapital = $(this).val();
    checkInput(countryData[selectedCode], $("#requireClickCapital"), $("#capitalInput"), 
		"capital", "capital", "acceptedCapitals");
    map.updateChoropleth(getCountryColors());
})

// Make the tab key on the capital field go back to the country field, for speedy entering
$('body').on('keydown', '#capitalInput', function(e) {
    if (e.which == 9) {
	        e.preventDefault();
		$("#countryInput").focus();
    }
});

// Hide/show buttons
var countriesRevealed = false;
$("#revealButton").click(function() {
	if (!countriesRevealed){
		_.each(countryData, function(country){
			_.each(_.keys(country.guessed), function(guessType) {
				country.guessed[guessType] = true;
			}) 
		})

		updateDisplay();
		$("#revealButton").text("Reset");
		countriesRevealed = true;
	}
	else {
		_.each(countryData, function(country){
			_.each(_.keys(country.guessed), function(guessType){
				country.guessed[guessType] = false;
			})
		})

		updateDisplay();
		$("#revealButton").text("Show All Info");
		countriesRevealed = false;;
	}
})

$("#flagDisplayButton").click(function() {
	if ($("#flags").is(":hidden")){
		$("#flags").slideDown();
		$("#flagDisplayButton").text("Hide");
	}
	else {
		$("#flags").slideUp();
		$("#flagDisplayButton").text("Show");
	}
})

// Flag generation
var hbFlagSource = $("#flagTemplate").html();
var hbFlagTemplate = Handlebars.compile(hbFlagSource);

function getFlags(){
	$("#flags").text("");
	_.each(countryData, function(country){
		if (!country.guessed.flag){
			var hbFlagContext = {iso2: country.iso2, iso3: country.iso3};
			$("#flags").append(hbFlagTemplate(hbFlagContext));
		}
	});
}
getFlags();

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
		console.log(selectedFlag);
		checkFlag();
	}
});

// Input verification

function checkFlag(){
	if (selectedFlag == selectedCode) {
		countryData[selectedCode].guessed.flag = true;
		console.log("Correct!");
		updateDisplay();
	}
}

function checkInput(countryDatum, checkbox, input, guessedKey, mainAnswerKey, acceptedAnswerKey){
	if (input.val() != ""){
		if (checkbox.is(':checked')){
			if (verifyInput(countryDatum, guessedKey, mainAnswerKey, acceptedAnswerKey, input)) { 
				input.val('');
				updateDisplay(); 
			}
		}
		else{
			_.each(countryData, function(country){
				if (verifyInput(country, guessedKey, mainAnswerKey, acceptedAnswerKey, input)) {
					input.val('');
					updateDisplay();
				}
			})
		}
	}
}

function verifyInput(countryDatum, guessedKey, mainAnswerKey, acceptedAnswerKey, input){
	if (countryDatum && !countryDatum.guessed[guessedKey] && input.val() != ""){
		if (_.includes(countryDatum[acceptedAnswerKey], input.val()) || input.val() == countryDatum[mainAnswerKey]) {
			countryDatum.guessed[guessedKey] = true
			return true;
		}
	}
}
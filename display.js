// Initializing some display elements

function getFlags(){
	var hbFlagSource = $("#flagTemplate").html();
	var hbFlagTemplate = Handlebars.compile(hbFlagSource);

	$("#flags").text("");
	_.each(countryData, function(country){
		if (!country.guessed.flag){
			var hbFlagContext = {iso2: country.iso2, iso3: country.iso3};
			$("#flags").append(hbFlagTemplate(hbFlagContext));
		}
	});
}
getFlags();

function getTableRows(){
	var hbTableSource = $("#countryRowTemplate").html();
	var hbTableTemplate = Handlebars.compile(hbTableSource);

	$("#countriesTableBody").text("");
	var count = 0;
	_.each(countryData, function(country){
		count++;

		hbTableContext = {
			number: count,
			iso3: country.iso3
		};

		$("#countriesTableBody").append(hbTableTemplate(hbTableContext));
	});
}
getTableRows();

// Display updating functions

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

function updateTableRows(){
	_.each(countryData, function(country){
		_.each(country.guessed, function(value, key){
			if (value){
				updateTableRow(country, key);
			}
		});

		if(_.every(_.values(country.guessed))){
			$("#" + country.iso3 + "-row").addClass("success");
		}
	});
}

function updateTableRow(countryDatum, field) {
	var element = $("#" + countryDatum.iso3 + "-row").find("." + field + "Cell");
	element.addClass("success");
	if (field == "flag"){
		element.text("");
		element.prepend('<img height=25px src="./flags/' + countryDatum[field][0] + '.png">');
	}
	else {
		element.text(countryDatum[field][0]);
	}
}


function updateDisplay(){
	map.updateChoropleth(getCountryColors());

    var numCorrectCountries = _.filter(countryData, function(country) {return country.guessed.country;}).length;
    $("#correctCountries").text(numCorrectCountries + "/" + _.keys(countryData).length);

    var numCorrectCapitals = _.filter(countryData, function(country) {return country.guessed.capital;}).length;
    $("#correctCapitals").text(numCorrectCapitals + "/" + _.keys(countryData).length);

    var numCorrectFlags = _.filter(countryData, function(country) {return country.guessed.flag;}).length;
    $("#correctFlags").text(numCorrectFlags + "/" + _.keys(countryData).length);

	updateTableRows();
	updateFlags();

}
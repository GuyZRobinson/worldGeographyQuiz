var selectedCode;
var inputCountry;
var inputCapital;

// Handlebars for the map popup
var hbPopupSource = $("#popupTemplate").html();
var hbPopupTemplate = Handlebars.compile(hbPopupSource);

// ** THE MAP ***
var map = new Datamap({
	element: document.getElementById('mapContainer'),
	data: countryData,
	responsive: true,
	projection: 'mercator', 
	fills: {
		defaultFill: '#f5f5f5',
		highlighted: "yellow",
		oneGuess: '#a8cab7',
		twoGuess: '#81b196',
		threeGuess: '#578e6f'
	},
	geographyConfig: {
		borderColor: '#dddddd',
		popupTemplate: function(geo, datum) {
			var name = "?????", capital = "?????", flag = "unknown";
			if (datum.guessed.country){ name = geo.properties.name; }
			if (datum.guessed.capital){ capital = datum.capital; }
			if (datum.guessed.flag){ flag = datum.iso2; }

			var hbPopupContext = {iso2: flag, countryName: name, capitalName: capital };
			var returnString = hbPopupTemplate(hbPopupContext);
            return returnString;
        }
	},
	// When clicked highlight clicked country
	done: function(datamap) {
        datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
            selectedCode = geography.id;
            console.log(geography.id, geography.properties.name)
        	if (!countryData[selectedCode].isClicked){

        		// Check country
        		checkInput(countryData[selectedCode], $("#requireClickCountry"), $("#countryInput"), 
        			"country", "country", "acceptedNames");
	            // Check capital
	            checkInput(countryData[selectedCode], $("#requireClickCapital"), $("#capitalInput"), 
        			"capital", "capital", "acceptedCapitals");
	            // Check flag
	            checkFlag();

	            map.updateChoropleth(getCountryColors());
        	}
        	else {
            	countryData[selectedCode].isClicked = false;
        		selectedCode = null;
	            map.updateChoropleth(getCountryColors());
        	}
        });

        // For zooming and panning
        datamap.svg.call(d3.behavior.zoom()
        	.scaleExtent([1,30])
        	.on("zoom",redraw));
        function redraw(){
        	datamap.svg.selectAll("g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }
	},
});
// ** END MAP **

// returns an object of the colors for each country
function getCountryColors(){
	var colorMapping = {0: 'defaultFill', 1: 'oneGuess', 2: 'twoGuess', 3: 'threeGuess'};
	// Setting colors for each country
    var countryColors = {};
    _.each(countryData, function(country, key){
    	var guessedAmount = _.filter(country.guessed, function(guess) {return guess}).length;
    	country.isClicked = false;
    	countryColors[key] = {fillKey: colorMapping[guessedAmount]};
    })

    // Set the color for the selected country and mark it as clicked
    if (selectedCode) {
    	countryData[selectedCode].isClicked = true;
    	countryColors[selectedCode] = {fillKey: 'highlighted'};
	}

    return countryColors;
}

// For resizing
$(window).on('resize', function() {
	map.resize();    
});
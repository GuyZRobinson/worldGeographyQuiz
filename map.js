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
		oneCorrect: '#a8cab7',
		twoCorrect: '#81b196',
		threeCorrect: '#578e6f'
	},
	geographyConfig: {
		borderColor: '#dddddd',
		popupTemplate: function(geo, datum) {
			var hbPopupContext = {
				flag: "unknown", 
				country: "?????", 
				capital: "?????" 
			};

			_.each(datum.guessed, function(value,key){
				if (value){
					hbPopupContext[key] = datum[key][0];
				}
			});

            return hbPopupTemplate(hbPopupContext);
        }
	},
	// When clicked highlight clicked country
	done: function(datamap) {
        datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
            selectedCode = geography.id;
        	if (!countryData[selectedCode].isClicked){

        		// Check country
        		checkInput(countryData[selectedCode], $("#countryInput"), 
        			"country", $("#requireClickCountry").is(":checked"));
	            // Check capital
	            checkInput(countryData[selectedCode], $("#capitalInput"), 
	            	"capital", $("#requireClickCapital").is(":checked"));
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
        	.on("zoom",function(){
        		datamap.svg.selectAll("g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        	}));
	},
});
// ** END MAP **

// returns an object of the colors for each country
function getCountryColors(){
	var fillMapping = {
		0: 'defaultFill', 
		1: 'oneCorrect', 
		2: 'twoCorrect', 
		3: 'threeCorrect'
	};

	var strokeMapping = {
		0: map.options.geographyConfig.borderColor, 
		1: '#81b196', 
		2: '#578e6f', 
		3: '#446f56'
	};

	// Setting colors for each country
    var countryColors = {};
    _.each(countryData, function(country, key){
    	var guessedAmount = _.filter(country.guessed, function(guess) {return guess;}).length;
    	country.isClicked = false;
    	countryColors[key] = {fillKey: fillMapping[guessedAmount]};
    	countryColors[key].strokeColor = strokeMapping[guessedAmount];
    });

    // Set the color for the selected country and mark it as clicked
    if (selectedCode) {
    	countryData[selectedCode].isClicked = true;
    	countryColors[selectedCode] = {fillKey: 'highlighted'};
    	countryColors[selectedCode].strokeColor = map.options.geographyConfig.highlightBorderColor;
	}

    return countryColors;
}

// For resizing
$(window).on('resize', function() {
	map.resize();    
});
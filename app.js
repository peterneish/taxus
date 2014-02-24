// TypeAhead stuff

// initialise bloodhound engine
var taxa = new Bloodhound({
	name: 'taxa',
        limit : 10,
	datumTokenizer: function (d) {
        return Bloodhound.tokenizers.whitespace(d.value);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
	remote: {
		url: 'http://bie.ala.org.au/search/auto.jsonp?q=%QUERY&limit=20&idxType=TAXON&callback=?',
		ajax: {dataType: 'jsonp'},
		filter: function(data) {

              var resultList = data.autoCompleteList.map(function (item) {
              return {value : item.matchedNames[0], guid : item.guid }

          });
          return resultList;

        }
	}		
});

taxa.initialize();

$("#searchvalue").typeahead(null, {
    autoselect : true,
    highlight  : true,
    displayKey: 'value',
    source: taxa.ttAdapter()
});

// this puts the guid into the guid field so that we can use that instead of th name string
$("#searchvalue").on("typeahead:selected typeahead:autocompleted", function(e,datum) { 
	$("#guid").val(datum.guid);
	runViz(datum.guid);
	
});


// set up d3 stuff
var diameter = 960,
    format = d3.format(",d"),
    color = d3.scale.category20c();

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1.5);

var svg = d3.select("#viz").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");



// the function that runs the visualisation
function runViz(guid){
	speciesurl = "http://bie.ala.org.au/ws/species/" + guid + ".json?callback=?";
	$("<a />", {
		href: speciesurl,
		text: speciesurl
		}).appendTo("#viz");
	
}





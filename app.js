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

// calculate window size
var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementById("viz"),
    x = g.clientWidth || w.innerWidth || e.clientWidth,
    y = w.innerHeight|| e.clientHeight || g.clientHeight;

var width = Math.max( x * 0.9, 400 ),  //width
    height = Math.max( y * 0.9, 300 ); //height
var colour = d3.scale.category20();
var linktype = d3.scale.category20c();

var circlesize = 20;

var force = d3.layout.force()
    .charge(-100)
    .linkDistance(80)
    .size([width, height]);

var svg = d3.select("#viz").append("svg")
    .attr("width", width)
    .attr("height", height);





// the function that runs the visualisation
function runViz(guid){
	speciesurl = "http://bie.ala.org.au/ws/species/" + guid + ".json?callback={callback}";
	$("<a />", {
		href: speciesurl,
		text: speciesurl
		}).appendTo("#viz");
	
	d3.jsonp(speciesurl, function(graph) {
	  var guid = graph.taxonConcept.guid;
	  var nodes = [];
	  var  links = [];
	  
	  nodes.push({name: graph.taxonConcept.nameString, guid: graph.taxonConcept.guid});
	  
	  var i=1;
	  graph.synonyms.forEach(function(link) {
		links.push({source: 0, target: i++, value: link.relationship});		
		nodes.push({ name: link.nameString, guid: link.guid} );
	  });
	  
	  console.log(links);
	  console.log(nodes);

	  force
		  .nodes(nodes)
		  .links(links)
		  .start();

	  var link = svg.selectAll(".link")
		  .data(links)
		.enter().append("line").
		 attr("class", "link");

	  var node = svg.selectAll(".node")
		  .data(nodes)
		.enter().append("circle")
		  .attr("class", "node")
		  .attr("r", 15)
		  .style("fill", function(d) { return  colour(d.name); })
		  .call(force.drag);

	  node.append("title")
		  .text(function(d) { return d.name; });

	  force.on("tick", function() {
		link.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });

		node.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; });
	  });
	});
}





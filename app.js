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
var linkcolour = d3.scale.category10();

var circlesize = 20;

var force = d3.layout.force()
    .gravity(.05)
    .distance(100)
    .charge(-100)
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
	  

	  force
		  .nodes(nodes)
		  .links(links)
		  .start();

	  var link = svg.selectAll(".link")
		   	.data(links)
			.enter().append("line").
		 	attr("class", "link").
		 	attr("stroke-width", 5).
		 	attr("stroke", function(d) { return linkcolour(d.value); });

	  var node = svg.selectAll("g.node")
		  .data(nodes);

	  node.enter().append("svg:g")
		.attr("class", "node")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });


	  node.append("circle")
		  .attr("class", "node")
		  .attr("r", 15)
		  .style("fill", function(d) { return  colour(d.name); });

	  node.append("title")
		  .text(function(d) { return d.name; });

  	  node.append("text")
      		.attr("dx", 12)
      		.attr("dy", ".35em")
      		.text(function(d) { return d.name });

	  node.call(force.drag);
	  	

	force.on("tick", function() {
    		link.attr("x1", function(d) { return d.source.x; })
        	.attr("y1", function(d) { return d.source.y; })
        	.attr("x2", function(d) { return d.target.x; })
        	.attr("y2", function(d) { return d.target.y; });

    		node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  	});
	});
}





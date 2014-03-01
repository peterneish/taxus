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
var nodes = [];
var  links = [];

var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .gravity(.05)
    .distance(100)
    .charge(-100)
    .size([width, height])
    .on("tick", tick);

var svg = d3.select("#viz").append("svg")
    .attr("width", width)
    .attr("height", height);

var node = svg.selectAll(".node"),
    link = svg.selectAll(".link");


// the function that runs the visualisation
function runViz(guid){
	speciesurl = "http://bie.ala.org.au/ws/species/" + guid + ".json?callback={callback}";
	
	d3.jsonp(speciesurl, function(graph) {
	  
	  src= {name: graph.taxonConcept.nameString, guid: graph.taxonConcept.guid};
	  nodes.push(src);
	  
	  graph.synonyms.forEach(function(s) {
		syn = { name: s.nameString, guid: s.guid};
		nodes.push(syn);	
		links.push({source: src, target: syn, value: link.relationship});		
	  });

	  start();

	});
}


function start() {

  link = link.data(force.links(), function(d) { return d.source.guid + "-" + d.target.guid; ; });
  link.enter().insert("line", ".node").
		 	attr("class", "link").
		 	attr("stroke-width", 5).
		 	attr("stroke", function(d) { return linkcolour(d.value); });
//  link = link.data(force.links(), function(d) { return d.source.guid + "-" + d.target.guid; });
//  link.enter().insert("line", ".node").attr("class", "link");
  link.exit().remove();


  node = node.data(force.nodes(), function(d) { return d.guid;});
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
  node.exit().remove();

  force.start();
}

function tick() {
  node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });
}

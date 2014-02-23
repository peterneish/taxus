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
          console.log(resultList);
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
	alert(" Hello" + $("#guid").val());
	
});


// set up d3 stuff



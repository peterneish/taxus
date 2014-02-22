// initialise bloodhound engine
var taxa = new Bloodhound({
	name: 'taxa',
	datumTokenizer: function (d) {
        return Bloodhound.tokenizers.whitespace(d.value);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
	remote: {
		url: 'http://bie.ala.org.au/search/auto.jsonp?q=%QUERY&limit=10&idxType=TAXON&callback=callback',
		ajax: {dataType: 'jsonp', jsonpCallback: 'callback'},
		filter: function(data) {

              var resultList = data.autoCompleteList.map(function (item) {
              return {value : item.name }

          });
          console.log(resultList);
          return resultList;

        }
	}		
});

taxa.initialize();

$("#searchvalue").typeahead(null, {
    displayKey: 'value',
    source: taxa.ttAdapter()
});

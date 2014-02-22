// initialise bloodhound engine
var taxa = new Bloodhound({
	name: 'taxa',
	datumTokenizer: function (d) {
        return Bloodhound.tokenizers.whitespace(d.value);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
	remote: {
		url: 'http://bie.ala.org.au/search/auto.jsonp?q=%QUERY&limit=10&idxType=TAXON',
		filter: function(data) {

              var resultList = data.autoCompleteList.map(function (item) {
              return item.name;

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

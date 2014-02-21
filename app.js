// stub
$("#searchvalue").typeahead({
        minLength: 3,
		items: 20,
        source: function(query, process) {
            $.getJSON('http://bie.ala.org.au/search/auto.jsonp?callback=?',
		      { q: query, limit: 100, idxType: "TAXON", geoOnly: "true"}, 
		      function(data) {
			
				rows = new Array();
				mapped = {};
				$.each(data.autoCompleteList, function(i, name){
					var query_label = name.matchedNames[0];
					mapped[query_label] = {rankString: name.rankString, guid: name.guid};
					
					rows.push(query_label);
				});
				//data = data.autoCompleteList;
				//for(var i=0; i<data.length; i++){
				//	rows[i] = data[i].matchedNames[0];
				//}
                		process(rows);
            		});
        },
		updater: function(query_label){
			var rankString = mapped[query_label].rankString;
			$("#searchtype").val(rankString);
			
			//console.log(rankString + ":" + query_label + ":" + mapped[query_label].guid);
			$("#splash").hide();

			search_current = rankString;
			
			$("#waiting").show();
	
			doChart(mapped[query_label].guid, rankString);
			
			//$("a.facet").removeClass("disabled");
			//$("a[href='taxon']").addClass("btn-primary");
						
			return query_label;			
		}
});
function scSearch(searchString){
	SC.get("/tracks", {q: searchString, limit: 10}, scPrintTracks);
}

function scPrintTracks(tracks){
  if (!!templateCache) { 
		tracks.forEach(function(track, index, array){
			clone = $(templateCache).clone();
			clone.attr('data-song-id','sc:' + track.id);
			clone.find(".artistname").html(track.user.username);
			clone.find(".songtitle").html(track.title);
			clone.find("img").attr('src', track.artwork_url);
			$(".search-result-list").append(clone);
  	}); 

    $('.search-result-loading').hide();
    $('.search-result-list').show(1000);
  }
}

function scLoadThumbnails(){
  var q = playlist.playlist_entries.filter(function(index, element){
      return element.song.type == "sc"; 
    });
  q = q.map(function(index, element){ return element.song.id; }).toArray();

  SC.get("/tracks", {ids: q.join()}, 
    function(tracks){
      tracks.forEach(function(track, index, array){
        if (track.artwork_url){
          $(".playlist li[data-song-id='sc:"+ track.id +"'] .search-thumbnail")
              .css("background-image", "url("+ track.artwork_url +")");
        }
      });
  });
}
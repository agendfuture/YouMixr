function ytSearch(searchString, show){
	if (gapiLoaded) {
    var request = gapi.client.youtube.search.list({
      q: searchString,      
      part: 'snippet'
    });
  
    request.execute(function(response){
      ytPrintTracks(response, show);
      $("#show-yt-results").show();
    });
  }
}

function ytPrintTracks(response, show){
	var tracks = response.result.items;
	var title, clone;
	if (!!templateCache) {
		tracks.forEach(function(track, index, array){
			clone = $(templateCache).clone();
			title = track.snippet.title.split("-");
  		clone.attr('data-song-id','yt:' + track.id.videoId);
  		clone.find(".artistname").html(title[0]);
  		clone.find(".songtitle").html(title[1]);
  		clone.find("img").attr('src', track.snippet.thumbnails.default.url);
  		$(".search-result-list-yt").append(clone);
  	}); 

    finishSearchRequest();
    if (show) {$('.search-result-list-yt').show(1000);}
  }
}

function ytShowResultList(){
  $('.search-result-list').hide();
  $('.search-result-list-yt').show(1000)
}


function ytLoadThumbnails(){
	if (gapiLoaded) {
    var q = playlist.playlist_entries.filter(function(index, element){
    		return element.song.type == "yt"; 
    	});
    q = q.map(function(index, element){ return element.song.id; }).toArray();
    var request = gapi.client.youtube.videos.list({
      id: q.join(),      
      part: 'snippet'
    });
  
    request.execute(function(response){
    	var items = response.result.items;
      if (!!items){ 
        items.forEach(function(track, index, array){
          $(".playlist li[data-song-id='yt:"+ track.id +"'] .search-thumbnail")
            .css("background-image", "url("+ track.snippet.thumbnails.default.url +")");
        });
      }
    });
  }
}

// ----------- Player ------------
function onYtPlayerStateChange(event){
  switch(event.data){
    case YT.PlayerState.ENDED:
      player.next();
      break;
    case YT.PlayerState.PLAYING:
      if(!Player.playing)
        player.play(event);
      break;
    case YT.PlayerState.BUFFERING:
      player.timer.stop();
      break;
    case YT.PlayerState.PAUSED:
      player.skipTo(player.ytPlayer.getCurrentTime());
      player.stop();
      break;     
  }
}

function ytOnReady(event){      
  player.progressbar.show();  
  player.play();
}

$.Class("Clock", 
	{
		elapsedTime: 0,
		callback: null,
		intervalObj: null,
		interval: 1000
	}, 
	{
		start : function(callback, interval, seek){
			this.elapsedTime = seek;
			this.callback = callback;
			this.interval = interval;
			this.intervalObj = window.setInterval($.proxy(this.tick, this), this.interval);
		},
		stop : function(){
			window.clearInterval(this.intervalObj);
		},
		tick : function(){
			this.elapsedTime = this.elapsedTime + 1;
			this.callback(this.elapsedTime);
		}

 });
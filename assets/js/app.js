const config = {
	apiKey: 'AIzaSyDi0DWfWqD-EyT4HYOVURLP-5HoD4iInIQ',
	authDomain: 'playlist-30555.firebaseapp.com',
	databaseURL: 'https://playlist-30555.firebaseio.com',
	projectId: 'playlist-30555',
};
firebase.initializeApp(config);

const playlistsRef = firebase.database().ref('playlists');

let usersChannel = { //Object for default user todo: need to populate this when we log the user in
	id: null,
	title: 'Guest',
	views: null,
	playlists: []
};

currentItem = {
	songName: null,
	artist: null,
	songId: null,
	lyricsId: null
}

let state2 = "song"
const searchResultsLyrics = $('#search-results-lyrics');
const searchBtn = $('#search-button');
const searchInput = $('#search-input');
const searchResults = $('#yt-search-results');
const ytPlayer = $('#yt-player');
searchResults.hide();
$(".mdl-card").hide(); // Hides the results card at the beginning
$(".mdl-card1").hide(); // Hides the video player card at the beginning
$(".mdl-card-lyrics").hide(); // Hides the lyrics card at the beginning

function setPlaceHolder(){
	var t1 = document.getElementById("search-input");
	t1.parentElement.MaterialTextfield.change("Search for a Song");
	state2 = "song";
	$('.mdl-textfield__label, .mdl-textfield_input, .crazy').css("color", "blue");

}

function getPlaylists() {
	// console.log(usersChannel)
	if(usersChannel.id !== null) {
		playlistsRef.child(usersChannel.id).child('1').once('value', snap => { // For Playlist Page
			let playlist = snap.val();
			let playlistDiv = $('#saved-music').empty();	
			for (const song in playlist) {
				const { artist, songId, lyricsId, songName } = playlist[song];
				const div = $('<div>').addClass('mdl-navigation__link')
				const delBtn = $('<i>').addClass('material-icons float-right danger del').text('close').attr({
					'data-song': song
				})
				const li = $('<span>').addClass('playlist-song float-left').attr({ 
					id: song, href: '#', 
					'data-lyrics-id': lyricsId, 
					'data-song-id': songId, 
				}).text(songName).append(delBtn)
				div.append(li).append(delBtn);
				playlistDiv.append(div);
				
			}
		});
	}else{
		console.log('Waiting...')
		setTimeout(getPlaylists, 100)
	}
	
}
$(document).on('click', '.del', function() {
	const songId = $(this).attr('data-song');
	playlistsRef.child(`${usersChannel.id}/1/${songId}`).remove();
	getPlaylists()
});

getPlaylists();


$(document).on('click', '.playlist-song', function() {

	playPlaylistSong($(this).attr('data-song-id'), $(this).attr('data-lyrics-id'))
	var d = document.querySelector('.mdl-layout');
	d.MaterialLayout.toggleDrawer();
});

function playPlaylistSong(songId, lyricId) {
	console.log(songId, lyricId);
	setYtPlayer(songId);
	setLyrics(lyricId);
}

function setLyrics(id) {
	$.ajax({
		type: 'GET',
		data: {
			apikey: '837d23235a55ecdf0d0c33f76c0c1051',
			track_id: id,
			format: 'jsonp',
			callback: 'jsonp_callback'
		},
		url: 'https://api.musixmatch.com/ws/1.1/track.lyrics.get',
		dataType: 'jsonp',
		jsonpCallback: 'jsonp_callback',
		contentType: 'application/json',

	}).then(function (data) {
		var letterP = $('<p>').addClass('lyrics');
		letterP.text(data.message.body.lyrics.lyrics_body);
		searchResultsLyrics.empty();
		searchResultsLyrics.append(letterP);
		$(".mdl-card-lyrics").show();
	}).catch(err=>console.log(err));
}

function setYtPlayer(id) {
	ytPlayer.attr({src: `https://www.youtube.com/embed/${id}?autoplay=1`})
	$('.mdl-card1').show();
}

function greet(n) {
	name = n || 'Guest';
	$('#name').text(name)
}
greet();

//Restrict search-input from having special characters
$('#search-input').bind('keydown', function (event) {
	switch (event.keyCode) {
		case 8:  // Backspace
		case 9:  // Tab
		case 32: // Space
		case 37: // Left
		case 38: // Up
		case 39: // Right
		case 40: // Down
			break;
		default:
			var regex = new RegExp('^[a-zA-Z0-9.,/ $@]+$');
			var key = event.key;
			if (!regex.test(key)) {
				// event.preventDefault();
				return false;
			}
			else if (event.keyCode === 13) {
				$('#search-button').click();
			}
			break;
	}
});

function addToPlaylist() {
	if(usersChannel.id === null) { return console.log('Please sign in first') };
	for (const key in currentItem) {
		if (currentItem[key] === null) { return console.log('please pick a song first') }
	}
	// console.log(usersChannel, currentItem)
	let { lyricsId, songId, songName, artist } = currentItem;
	// console.log(lyricId)
	playlistsRef.child(`${usersChannel.id}/1`).push().set({ // dbRef/playlists/{usersChannel.id}/1/{newKey}
		songName,
		artist,
		songId,
		lyricsId
	}).catch(err=>console.log(err));
	getPlaylists();
}

//Prevent pasting  of special characters into search input
$('#search-input').on({
	keydown: function (e) {
		if (e.which === 220) {
			//e.preventDefault();
			var v = this.value,
				s = this.selectionStart;
			this.value = v.substr(0, s) + '' + v.substr(s, v.length);
		}
		if (e.which === 55) {
			e.preventDefault();
			var v = this.value,
				s = this.selectionStart;
			this.value = v.substr(0, s) + '7' + v.substr(s, v.length);
		}
	},
	paste: function (e) {
		var stopPaste = function () {
			this.value = this.value.replace(/[|&()]/g, '');
		};
		setTimeout(stopPaste.bind(this), 1);
	}
});

function displayResults(results) {
	let { items, kind, nextPageToken, prevPageToken, pageInfo } = results;
	if (items.length > 0) {
		searchResults.empty();
		let resultItemDiv
		for (let item of items) {
			let { channelId, channelTitle, description, publishedAt, thumbnails, title } = item.snippet;
			//item.id {kind, videoId}, item.kind, item.snippet {^}
			resultItemDiv = $('<div>').attr({ 'data-id': item.id.videoId, 'data-song': title, style: 'float: left;' }).addClass('youtube-search-result')
			let thumbnail = $('<img>').attr({ src: thumbnails.default.url, width: thumbnails.default.width, height: thumbnails.default.height })
			let detailsDiv = $('<div>').attr({}).addClass('youtube-search-result-details')
				.append($('<h6>').addClass('text-truncate result-title').attr({}).text(title)) //would like to find out how to truncate this text
				.append($('<p>').addClass('text-truncate result-description').text(description)) //should be truncated as well
				.append($('<span>').addClass('result-creator').text(channelTitle))
				.append($('<span>').addClass('result-date-created').text(moment(publishedAt).format('lll')).attr({}))//can be formatted better
				.append($('<div>').addClass('clearfix')) // to clear the floats in the div
			resultItemDiv.append(thumbnail).append(detailsDiv)
			searchResults.append(resultItemDiv);
		}
		searchResults.show();
	}
};

$(document).on('click', '.youtube-search-result', function (e) {
	let VIDEO_ID = $(this).attr('data-id');
	currentItem.songName = $(this).attr('data-song');
	currentItem.songId = VIDEO_ID;
	// console.log(currentItem)
	setYtPlayer(VIDEO_ID);
	$(".mdl-card").hide(); // hides the reults list
	$(".mdl-card1").show(); // shows the results card after search is entered
	$(".mdl-card-lyrics").show(); // shows the results card after search is entered
});

searchBtn.on('click', function (e) {
	e.preventDefault();
	let q = searchInput.val().trim().replace(' ', '+') || 'cats';
	//searchYoutube(q)
});

searchBtn.on('click', function (e) {
	e.preventDefault();
	var trackSearch = searchInput.val().trim()
	var artistSearch = searchInput.val().trim()
	// console.log(trackSearch)
	// console.log(state2)
	searchResults.empty();
	$(".mdl-card1").hide(); // Hides the video player card 
	$(".mdl-card-lyrics").hide(); // Hides the lyrics card 
	// console.log(state2)
	if(state2 === "song"){
		$.ajax({ 	// Perfoming an AJAX GET request to our queryURL
			type: 'GET',
			data: {
				apikey: '837d23235a55ecdf0d0c33f76c0c1051',
				q_track: trackSearch,
				f_has_lyrics: 'yes',
				format: 'jsonp',
				callback: 'jsonp_callback'
			},
			url: 'https://api.musixmatch.com/ws/1.1/track.search',
			dataType: 'jsonp',
			jsonpCallback: 'jsonp_callback',
			contentType: 'application/json',
		}).then(function (data) {
			// console.log(data)
			
			for (let i = 0; i < data.message.body.track_list.length; i++) {
				// console.log(data.message.body.track_list[i].track.artist_name)
				var letterP = $('<p>')
					.addClass('lyrics-search-result')
					.attr({
						'data-artist': data.message.body.track_list[i].track.artist_name,
						'data-track-id': data.message.body.track_list[i].track.track_id,
						'data-track-name': data.message.body.track_list[i].track.commontrack_vanity_id,
					}).text(data.message.body.track_list[i].track.artist_name);
				searchResults.append(letterP);
			}
			searchResults.show();
		}).catch(err=>console.log(err));
	}
	else if(state2 === "artist"){
		$.ajax({ 	// Perfoming an AJAX GET request to our queryURL
			type: 'GET',
			data: {
				apikey: '837d23235a55ecdf0d0c33f76c0c1051',
				q_artist: artistSearch,
				f_has_lyrics: 'yes',
				format: 'jsonp',
				callback: 'jsonp_callback'
			},
			url: 'https://api.musixmatch.com/ws/1.1/track.search',
			dataType: 'jsonp',
			jsonpCallback: 'jsonp_callback',
			contentType: 'application/json',
		}).then(function (data) {
			console.log(data)
			console.log(state2)
			for (let i = 0; i < data.message.body.track_list.length; i++) {
				console.log(data.message.body.track_list[i].track.track_name)
				var letterP = $('<p>')
					.addClass('lyrics-search-result')
					.attr({
						'data-artist': data.message.body.track_list[i].track.artist_name,
						'data-track-id': data.message.body.track_list[i].track.track_id,
						'data-track-name': data.message.body.track_list[i].track.commontrack_vanity_id,
					}).text(data.message.body.track_list[i].track.track_name);
				searchResults.append(letterP);
			}
			searchResults.show();
		}).catch(err=>console.log(err));
	}
	$(".mdl-card").show(); // shows the results card after search is entered
});
$(document).on('click', '.lyrics-search-result', function (e) {

	currentItem.artist = $(this).attr('data-artist');
	currentItem.lyricsId = $(this).attr('data-track-id');
	console.log(currentItem)
	let songName = $(this).attr('data-track-name');
	trackId = $(this).attr('data-track-id');
	let pT = ''; 

	$.ajax({
		type: 'GET',
		data: {
			apikey: '837d23235a55ecdf0d0c33f76c0c1051',
			track_id: trackId,
			format: 'jsonp',
			callback: 'jsonp_callback'
		},
		url: 'https://api.musixmatch.com/ws/1.1/track.lyrics.get',
		dataType: 'jsonp',
		jsonpCallback: 'jsonp_callback',
		contentType: 'application/json',

	}).then(function (data) {
		// console.log(data)
		var letterP = $('<p>').addClass('lyrics');
		letterP.text(data.message.body.lyrics.lyrics_body);
		searchResultsLyrics.empty();
		searchResultsLyrics.append(letterP);
		searchYoutube(songName, pT);
	}).catch(err=>console.log(err));
	searchResults.hide();
});

$(document).on('click', '.hide', function (e) {
	$(".mdl-card").hide();
});

$(document).on('click', '.show', function (e) {
	$(".mdl-card").show();
});

$(document).on('click', '.playlist', function (e) {
	var d = document.querySelector('.mdl-layout');
	d.MaterialLayout.toggleDrawer();
});

$('#add-playlist').on('click', function (e) { // button to add song to playlist
	addToPlaylist();
});
$('.add').on('click', e => {
	addToPlaylist();
})

$(document).on('click', '.toggle1', function (e) { // button to add toggle bewteen searching by song or artist
	var state1 = $(this).attr('class')
	if (state1.includes("is-checked")){
		var t1 = document.getElementById("search-input");
		t1.parentElement.MaterialTextfield.change("Search for an Artist");
		$('.mdl-textfield__label, .mdl-textfield_input, .crazy').css("color", "rgb(235, 22, 146)");
		state2 = "artist";
	}
	else {
		var t1 = document.getElementById("search-input");
		t1.parentElement.MaterialTextfield.change("Search for a Song");
		state2 = "song";
		$('.mdl-textfield__label, .mdl-textfield_input, .crazy').css("color", "blue");
	}
});



$('input:text').focus(
    function(){
        $(this).val('');
    });
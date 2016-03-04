// how long song title is displayed, in seconds
var titletime = nodecg.bundleConfig.titletime || 10;
// how long sub message is displayed, in seconds
var msgtime = nodecg.bundleConfig.msgtime || 5;
// how often the title is updated, in seconds
var update = nodecg.bundleConfig.update || 1;
// your last.fm API key (last.fm/api)
var apikey = nodecg.bundleConfig.apikey;

var auto = nodecg.Replicant('musicauto');
var showing = false;
var songsource = nodecg.Replicant('musicsource');
var lastsong = '';

var autoInterval = nodecg.Replicant('musicinterval');
var messageRep = nodecg.Replicant('musicmessage');

var curline = -1;
var MESSAGE_SHOWN = 1;
var TITLE_SHOWN = 0;
var NO_MESSAGE = -1;
var toggleto;
var autotoggleto;
var autohideto;

function showMusic() {
	updateSong();
	if (!showing) {
		$('#musiccontainer').removeClass('slideOutRight').addClass('slideInRight');
		showing = true;
	}
}
function hideMusic() {
	if (showing) {
		$('#musiccontainer').removeClass('slideInRight').addClass('slideOutRight');
		showing = false;
	}
}

function updateMessage(old, newValue) {
	$('#musicmessage').html(newValue);

	if (!newValue) {
		if (curline === MESSAGE_SHOWN) {
			toggleLines();
		}
		clearTimeout(toggleto);
		curline = NO_MESSAGE;
	} else {
		if (curline === NO_MESSAGE) {
			curline = TITLE_SHOWN;
			clearTimeout(toggleto);
			toggleLines();
		}
	}
}

setInterval(updateSong, update * 1000);
function updateSong() {
	if (songsource.value === '') {
		$.get('Snip/Snip.txt', function (data, status) {
			if (status=='success') {
				updateTitle(data);
			}
		});
	} else {
		$.getJSON('http://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=' + songsource + '&api_key=' + apikey + '&limit=2&format=json&callback=?', 
		function (data) {
			updateTitle(data.recenttracks.track[0].artist['#text'] + ' - ' + data.recenttracks.track[0].name);
		});
	}
}
function updateTitle(song) {
	if (song !== lastsong) {
		$('#musictitle').text(song);
		if (curline === MESSAGE_SHOWN) {
			toggleLines();
		}
		if (auto.value) {
			showMusic();
			clearTimeout(toggleto);
			clearTimeout(autotoggleto);
			clearTimeout(autohideto);
			autotoggleto = setTimeout(toggleLines, autoInterval.value * 600);
			autohideto = setTimeout(hideMusic, autoInterval.value * 1000);
		}
	}
	lastsong = song;
}
function toggleLines() {
	if (curline === TITLE_SHOWN) {
		$('#musictitle').transition({
			'opacity': '0',
			'margin-top': '-4px'
		}, 300, 'ease-out');
		$('#musicmessage').delay(150).transition({
			'opacity': '1',
			'margin-top': '-2px'
		}, 300, 'ease-out');
		curline = MESSAGE_SHOWN;
		if (!auto.value) {
			if (!toggleto) {
				toggleto = setTimeout(toggleLines, msgtime * 1000);
			}
		}
	} else if (curline === MESSAGE_SHOWN) {
		$('#musictitle').delay(150).transition({
			'opacity': '1',
			'margin-top': '10px'
		}, 300, 'ease-out');
		$('#musicmessage').transition({
			'opacity': '0',
			'margin-top': '20px'
		}, 300, 'ease-out');
		curline = TITLE_SHOWN;
		if (!auto.value) {
			if (!toggleto) {
				toggleto = setTimeout(toggleLines, titletime * 1000);
			}
		}
	}
}

messageRep.on('change', updateMessage);
nodecg.listenFor('show', showMusic);
nodecg.listenFor('hide', hideMusic);

$(function () {
	if (messageRep.value) {
		updateMessage(null, messageRep.value);
	}

	$('#musiccontainer').addClass('animated slideOutRight');
});

//https://www.youtube.com/watch?v=QPjHCAHfjoU&ab_channel=CodingShiksha
//https://developers.google.com/youtube/iframe_api_reference

let player

function onYouTubeIframeAPIReady() {
  console.log("Ready embedded");
  player = new YT.Player("player", {
    height: '390',
    width: '640',
    videoId: 'M7lc1UVf-VE',
    playerVars: {
      'playsinline': 1
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  event.target.playVideo();
}

var startedPlaying = true;
function onPlayerStateChange(event) {

  if (!startedPlaying) {
    player.playVideo();
    startedPlaying = true;
  }
}

function changeVideo(videoId) {
  player.cueVideoById(videoId);
  startedPlaying = false;
}

/*document.getElementById("anger").addEventListener("click", function() {
  changeVideo("CwFRJ7SkYvI");
}, false);

document.getElementById("disgust").addEventListener("click", function() {
  changeVideo("t0Q2otsqC4I");
}, false);

document.getElementById("joy").addEventListener("click", function() {
  changeVideo("n_NfxUQCoXE");
}, false);

document.getElementById("fear").addEventListener("click", function() {
  changeVideo("TelaKoiS-Bo");
}, false);

document.getElementById("sadness").addEventListener("click", function() {
  changeVideo("L7av0C0jWQw");
}, false);

document.getElementById("surprise").addEventListener("click", function() {
  changeVideo("HeGVeBWECu8");
}, false);*/
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-overlay');
    if (!video || !button) {
      return;
    }
    var url = video.getAttribute('data-m3u8');
    var attached = false;
    var hlsInstance = null;

    function attachSource() {
      if (attached || !url) {
        return;
      }
      var nativeHls = video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');
      if (nativeHls) {
        video.src = url;
        attached = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        attached = true;
        return;
      }
      video.src = url;
      attached = true;
    }

    function beginPlayback() {
      attachSource();
      button.hidden = true;
      player.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          button.hidden = false;
          player.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', beginPlayback);
    video.addEventListener('click', function () {
      if (video.paused) {
        beginPlayback();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      button.hidden = true;
      player.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        button.hidden = false;
        player.classList.remove('is-playing');
      }
    });
    video.addEventListener('ended', function () {
      button.hidden = false;
      player.classList.remove('is-playing');
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    document.querySelectorAll('[data-player]').forEach(initPlayer);
  });
})();

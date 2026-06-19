(function () {
  function setupPlayer(panel) {
    var video = panel.querySelector("video");
    var cover = panel.querySelector(".player-cover");
    var videoUrl = panel.getAttribute("data-video");
    var ready = false;
    var hlsInstance = null;

    function attachMedia() {
      if (ready) {
        return Promise.resolve();
      }

      ready = true;

      return new Promise(function (resolve) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = videoUrl;
          resolve();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hlsInstance.loadSource(videoUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
              return;
            }

            if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
              return;
            }

            hlsInstance.destroy();
          });
          return;
        }

        video.src = videoUrl;
        resolve();
      });
    }

    function playVideo() {
      panel.classList.add("is-loading");
      attachMedia().then(function () {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.then === "function") {
          playPromise.then(function () {
            panel.classList.remove("is-loading");
            panel.classList.add("is-playing");
          }).catch(function () {
            panel.classList.remove("is-loading");
          });
        } else {
          panel.classList.remove("is-loading");
          panel.classList.add("is-playing");
        }
      });
    }

    if (cover) {
      cover.addEventListener("click", playVideo);
    }

    video.addEventListener("play", function () {
      panel.classList.remove("is-loading");
      panel.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        return;
      }
      panel.classList.remove("is-playing");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".player-panel").forEach(setupPlayer);
  });
})();

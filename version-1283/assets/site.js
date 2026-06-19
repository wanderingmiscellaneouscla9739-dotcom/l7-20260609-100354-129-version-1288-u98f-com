(function () {
  function bySelector(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function bindMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function bindSearch() {
    bySelector("[data-search-input]").forEach(function (input) {
      var targetName = input.getAttribute("data-search-input");
      var scope = targetName ? document.querySelector('[data-search-scope="' + targetName + '"]') : document;
      if (!scope) {
        scope = document;
      }
      var empty = document.querySelector('[data-empty-for="' + targetName + '"]');
      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        var visible = 0;
        bySelector(".searchable-card", scope).forEach(function (card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          var matched = !keyword || text.indexOf(keyword) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      });
    });
  }

  function bindHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = bySelector(".hero-slide", slider);
    var dots = bySelector(".hero-dot", slider);
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === active);
      });
    }

    function start() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    show(0);
    start();
  }

  window.initPlayer = function (videoId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var error = document.querySelector("[data-player-error]");
    var loaded = false;
    var hls = null;

    if (!video || !overlay || !sourceUrl) {
      return;
    }

    function setError(message) {
      if (error) {
        error.textContent = message || "";
      }
    }

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      setError("");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setError("视频暂时无法播放，请稍后再试");
          }
        });
      } else {
        video.src = sourceUrl;
      }
    }

    function start() {
      attach();
      overlay.hidden = true;
      video.play().catch(function () {
        overlay.hidden = false;
        setError("点击播放按钮重新开始");
      });
    }

    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      overlay.hidden = true;
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        overlay.hidden = false;
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    bindMenu();
    bindSearch();
    bindHero();
  });
})();

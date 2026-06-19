(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');

  if (header && toggle) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var previous = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var slideIndex = 0;
  var slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    slideIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle('is-active', itemIndex === slideIndex);
    });

    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle('is-active', itemIndex === slideIndex);
    });
  }

  function restartSlider() {
    if (slideTimer) {
      window.clearInterval(slideTimer);
    }

    if (slides.length > 1) {
      slideTimer = window.setInterval(function () {
        showSlide(slideIndex + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    showSlide(0);
    restartSlider();
  }

  if (previous) {
    previous.addEventListener('click', function () {
      showSlide(slideIndex - 1);
      restartSlider();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(slideIndex + 1);
      restartSlider();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      restartSlider();
    });
  });

  var filterInput = document.querySelector('.card-filter-input');
  var pageSearchInput = document.getElementById('pageSearchInput');
  var searchStatus = document.getElementById('searchStatus');
  var cardSelector = '.movie-card, .rank-card';
  var cards = Array.prototype.slice.call(document.querySelectorAll(cardSelector));
  var emptyState = document.querySelector('.empty-state');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter(value) {
    var query = normalize(value);
    var matched = false;

    cards.forEach(function (card) {
      var blob = normalize((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-tags') || ''));
      var visible = !query || blob.indexOf(query) !== -1;
      card.hidden = !visible;
      matched = matched || visible;
    });

    if (emptyState) {
      emptyState.hidden = matched || !cards.length;
    }

    if (searchStatus) {
      searchStatus.textContent = query ? (matched ? '已更新匹配影片列表。' : '没有找到匹配影片。') : '请输入片名、标签或地区进行查找。';
    }
  }

  if (filterInput && cards.length) {
    filterInput.addEventListener('input', function () {
      applyFilter(filterInput.value);
    });
  }

  if (pageSearchInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    pageSearchInput.value = initialQuery;
    applyFilter(initialQuery);

    pageSearchInput.addEventListener('input', function () {
      applyFilter(pageSearchInput.value);
    });
  }

  var video = document.getElementById('movieVideo');
  var overlay = document.getElementById('videoOverlay');
  var configNode = document.getElementById('videoConfig');

  if (video && configNode) {
    var videoConfig = {};
    var ready = false;

    try {
      videoConfig = JSON.parse(configNode.textContent || '{}');
    } catch (error) {
      videoConfig = {};
    }

    function attachVideo() {
      if (ready || !videoConfig.stream) {
        return;
      }

      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoConfig.stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(videoConfig.stream);
        hls.attachMedia(video);
        video.hlsController = hls;
        return;
      }

      video.src = videoConfig.stream;
    }

    function startVideo() {
      attachVideo();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var playTask = video.play();

      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  }
})();

(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initPageFilter() {
    var input = document.querySelector('[data-page-filter]');
    var list = document.querySelector('[data-card-list]');
    var note = document.querySelector('[data-result-note]');
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.children);

    function applyFilter(extraValue) {
      var keyword = normalize(input.value + ' ' + (extraValue || ''));
      var visible = 0;
      cards.forEach(function (card) {
        var content = normalize(card.getAttribute('data-content'));
        var matched = !keyword || content.indexOf(keyword) !== -1;
        card.classList.toggle('is-hidden-by-filter', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (note) {
        note.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    input.addEventListener('input', function () {
      applyFilter('');
    });

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        applyFilter(button.getAttribute('data-filter-value') || '');
      });
    });
  }

  function createMovieCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '  <a class="movie-poster" href="' + escapeHtml(movie.url) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="movie-score">热度 ' + Number(movie.score || 0).toFixed(1) + '</span>',
      '    <span class="movie-play-mark">▶</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta-line">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine || '') + '</p>',
      '    <div class="movie-tags">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initGlobalSearch() {
    var form = document.querySelector('[data-global-search-form]');
    var results = document.querySelector('[data-global-results]');
    var note = document.querySelector('[data-global-result-note]');
    var index = window.MOVIE_SEARCH_INDEX || [];
    if (!form || !results || !note || !index.length) {
      return;
    }
    var input = form.querySelector('input[name="q"]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input && initialQuery) {
      input.value = initialQuery;
      render(initialQuery);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render(input ? input.value : '');
      var query = input ? input.value.trim() : '';
      var nextUrl = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      window.history.replaceState(null, '', nextUrl);
    });

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }

    function render(query) {
      var words = normalize(query).split(/\s+/).filter(Boolean);
      var matched = index.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine,
          movie.category
        ].join(' '));
        return !words.length || words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 120);
      results.innerHTML = matched.map(createMovieCard).join('');
      note.textContent = words.length ? '找到 ' + matched.length + ' 条匹配结果，最多展示 120 条。' : '输入关键词开始检索，默认展示最新推荐。';
    }
  }

  function initPlayer() {
    var card = document.querySelector('[data-player-card]');
    if (!card) {
      return;
    }
    var video = card.querySelector('[data-video]');
    var button = card.querySelector('[data-play-button]');
    var status = card.querySelector('[data-player-status]');
    if (!video || !button) {
      return;
    }
    var source = button.getAttribute('data-src');

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function playNative() {
      video.src = source;
      video.play().then(function () {
        setStatus('正在播放');
      }).catch(function () {
        setStatus('浏览器阻止了自动播放，请再次点击视频播放按钮。');
      });
    }

    button.addEventListener('click', function () {
      if (!source) {
        setStatus('未找到播放源。');
        return;
      }
      button.classList.add('is-hidden');
      setStatus('正在加载播放源...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        playNative();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().then(function () {
            setStatus('正在播放');
          }).catch(function () {
            setStatus('播放源已加载，请点击视频控制栏继续播放。');
          });
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源加载失败，可刷新页面后重试。');
          }
        });
        return;
      }

      playNative();
    });
  }

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initPageFilter();
    initGlobalSearch();
    initPlayer();
  });
})();

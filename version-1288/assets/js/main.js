(function () {
  'use strict';

  var DEFAULT_PLAY_URL = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

  function getBasePath() {
    return document.body.getAttribute('data-base') || '';
  }

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var toggle = $('[data-menu-toggle]');
    var panel = $('[data-mobile-panel]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHeroSlider() {
    var hero = $('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
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

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);

    show(0);
    start();
  }

  function setupImageFallbacks() {
    $all('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
        image.removeAttribute('src');
      });
    });
  }

  function getCardText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags'),
      card.getAttribute('data-category')
    ].join(' ').toLowerCase();
  }

  function setupFilters() {
    var filterInput = $('[data-filter-input]');
    var typeSelect = $('[data-filter-type]');
    var yearSelect = $('[data-filter-year]');
    var resetButton = $('[data-filter-reset]');
    var countNode = $('[data-filter-count]');
    var cards = $all('[data-filter-card]');
    var emptyState = $('[data-empty-state]');

    if (!cards.length || (!filterInput && !typeSelect && !yearSelect)) {
      return;
    }

    function applyFilters() {
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = getCardText(card);
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesType = !type || cardType.indexOf(type) !== -1;
        var matchesYear = !year || (year === '2020' ? Number(cardYear) <= 2020 : cardYear === year);
        var shouldShow = matchesKeyword && matchesType && matchesYear;

        card.classList.toggle('hidden-by-filter', !shouldShow);

        if (shouldShow) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
      }

      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    }

    [filterInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (filterInput) {
          filterInput.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        applyFilters();
      });
    }

    applyFilters();
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');

      if (existing) {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);
        if (window.Hls) {
          resolve();
        }
        return;
      }

      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setupPlayers() {
    $all('[data-player]').forEach(function (player) {
      var video = $('video', player);
      var playButton = $('[data-play-button]', player);
      var status = $('[data-player-status]', player.parentElement || document);
      var source = player.getAttribute('data-src') || DEFAULT_PLAY_URL;
      var loaded = false;

      if (!video || !playButton) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function attachHls() {
        if (loaded) {
          return Promise.resolve();
        }

        loaded = true;
        player.classList.add('loaded');
        setStatus('正在连接高清线路…');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          setStatus('高清线路已就绪，可直接播放。');
          return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('高清线路已就绪，可直接播放。');
          });
          hls.on(window.Hls.Events.ERROR, function () {
            setStatus('高清线路连接异常，可刷新页面或更换线路。');
          });
          return Promise.resolve();
        }

        return loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js').then(function () {
          loaded = false;
          return attachHls();
        }).catch(function () {
          video.src = source;
          setStatus('浏览器将尝试使用原生方式播放。');
        });
      }

      playButton.addEventListener('click', function () {
        attachHls().then(function () {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              setStatus('播放已准备，请再次点击视频播放。');
            });
          }
        });
      });
    });
  }

  function movieCardTemplate(movie) {
    var base = getBasePath();
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card" data-filter-card data-title="', escapeHtml(movie.title), '" data-region="', escapeHtml(movie.region), '" data-type="', escapeHtml(movie.type), '" data-year="', escapeHtml(movie.year), '" data-genre="', escapeHtml(movie.genre), '" data-tags="', escapeHtml((movie.tags || []).join(',')), '">',
      '<a class="poster-link" href="', base, 'detail/', movie.id, '.html">',
      '<img src="', base, movie.cover, '" alt="', escapeHtml(movie.title), ' 海报" loading="lazy">',
      '<span class="poster-badge">', escapeHtml(movie.type), '</span>',
      '<span class="poster-play">播放</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="movie-meta-line"><span>', escapeHtml(movie.year), '</span><span>', escapeHtml(movie.region), '</span><span>', escapeHtml(movie.score), '</span></div>',
      '<h3><a href="', base, 'detail/', movie.id, '.html">', escapeHtml(movie.title), '</a></h3>',
      '<p class="genre-line">', escapeHtml(movie.genre), '</p>',
      '<p class="one-line">', escapeHtml(movie.oneLine), '</p>',
      '<div class="tag-row">', tags, '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function setupSearchPage() {
    var results = $('[data-search-results]');
    var form = $('[data-search-form]');
    var input = $('[data-search-page-input]');
    var count = $('[data-search-count]');

    if (!results || !window.MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function render(query) {
      var keyword = query.trim().toLowerCase();
      var matched = window.MOVIES.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(' '), movie.oneLine].join(' ').toLowerCase();
        return !keyword || text.indexOf(keyword) !== -1;
      }).slice(0, 240);

      results.innerHTML = matched.map(movieCardTemplate).join('');
      setupImageFallbacks();

      if (count) {
        count.textContent = '找到 ' + matched.length + ' 条结果' + (keyword ? '：' + query : '，可继续输入关键词缩小范围');
      }
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input ? input.value : '';
        var newUrl = window.location.pathname + (query ? '?q=' + encodeURIComponent(query) : '');
        window.history.replaceState(null, '', newUrl);
        render(query);
      });
    }

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }

    render(initialQuery);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroSlider();
    setupImageFallbacks();
    setupFilters();
    setupPlayers();
    setupSearchPage();
  });
}());

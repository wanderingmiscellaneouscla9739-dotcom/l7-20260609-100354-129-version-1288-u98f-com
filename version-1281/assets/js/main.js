(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });
    show(0);
    restart();
  }

  function initGlobalSearch() {
    document.querySelectorAll('[data-global-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var suffix = query ? '?q=' + encodeURIComponent(query) : '';
        window.location.href = './search.html' + suffix;
      });
    });
  }

  function getText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-tags'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-category')
    ].join(' ').toLowerCase();
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (panel) {
      var container = panel.parentElement || document;
      var input = panel.querySelector('[data-search-input]');
      var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-field]'));
      var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card, .horizontal-card'));
      var empty = panel.querySelector('[data-empty-state]');
      var active = { field: 'all', value: '' };

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = getText(card);
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesFilter = !active.value || String(card.getAttribute('data-' + active.field) || '').indexOf(active.value) !== -1;
          var visible = matchesQuery && matchesFilter;
          card.classList.toggle('is-hidden', !visible);
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          var field = button.getAttribute('data-filter-field') || 'all';
          var value = button.getAttribute('data-filter-value') || '';
          active = { field: field, value: value };
          buttons.forEach(function (btn) {
            btn.classList.toggle('is-active', btn === button);
          });
          apply();
        });
      });
      if (input) {
        input.addEventListener('input', apply);
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
          input.value = query;
        }
      }
      apply();
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initGlobalSearch();
    initFilters();
  });
})();

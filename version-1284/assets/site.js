(function () {
    var header = document.querySelector('[data-header]');
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function updateHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 18);
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    initHero();
    initFilters();
    applyQuerySearch();
})();

function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
        return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
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

    function play() {
        clearInterval(timer);
        timer = setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    if (prev) {
        prev.addEventListener('click', function () {
            show(index - 1);
            play();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            show(index + 1);
            play();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            show(Number(dot.getAttribute('data-hero-dot')) || 0);
            play();
        });
    });

    show(0);
    play();
}

function initFilters() {
    var roots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));

    roots.forEach(function (root) {
        var input = root.querySelector('[data-filter-input]');
        var list = root.parentElement.querySelector('[data-filter-list]');
        var yearButtons = Array.prototype.slice.call(root.querySelectorAll('[data-year-filter]'));
        var selectedYear = 'all';

        if (!list) {
            return;
        }

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var cards = Array.prototype.slice.call(list.querySelectorAll('.filter-card'));

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-year') || ''
                ].join(' ').toLowerCase();
                var year = card.getAttribute('data-year') || '';
                var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
                var yearMatched = selectedYear === 'all' || year === selectedYear;
                card.style.display = keywordMatched && yearMatched ? '' : 'none';
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        yearButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                selectedYear = button.getAttribute('data-year-filter') || 'all';
                yearButtons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilter();
            });
        });

        applyFilter();
    });
}

function applyQuerySearch() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    var year = params.get('year');

    if (!query && !year) {
        return;
    }

    var input = document.querySelector('[data-filter-input]');
    if (input && query) {
        input.value = query;
        input.dispatchEvent(new Event('input'));
    }

    if (year) {
        var button = document.querySelector('[data-year-filter="' + year.replace(/"/g, '') + '"]');
        if (button) {
            button.click();
        }
    }
}

function initVideoPlayer(mediaUrl) {
    var box = document.querySelector('[data-player]');
    if (!box) {
        return;
    }

    var video = box.querySelector('video');
    var cover = box.querySelector('.play-cover');
    var started = false;
    var hlsInstance = null;

    function bindMedia() {
        if (!video || started) {
            return;
        }

        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = mediaUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(mediaUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = mediaUrl;
        }

        if (cover) {
            cover.classList.add('is-hidden');
        }

        video.setAttribute('controls', 'controls');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener('click', bindMedia);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (!started) {
                bindMedia();
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setMobileMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".site-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setSpotlight() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".spotlight-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".spotlight-dot"));
        if (slides.length === 0) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                play();
            });
        });
        show(0);
        play();
    }

    function normalize(text) {
        return String(text || "").toLowerCase().trim();
    }

    function setFilters() {
        var input = document.querySelector(".filter-input");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var noResult = document.querySelector(".no-result");
        if (!input || cards.length === 0) {
            return;
        }
        function runFilter() {
            var keyword = normalize(input.value);
            var shown = 0;
            cards.forEach(function (card) {
                var text = normalize(card.textContent + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-year"));
                var visible = keyword === "" || text.indexOf(keyword) !== -1;
                card.style.display = visible ? "" : "none";
                if (visible) {
                    shown += 1;
                }
            });
            if (noResult) {
                noResult.classList.toggle("visible", shown === 0);
            }
        }
        input.addEventListener("input", runFilter);
        Array.prototype.slice.call(document.querySelectorAll(".filter-chip")).forEach(function (chip) {
            chip.addEventListener("click", function () {
                input.value = chip.textContent || "";
                runFilter();
            });
        });
        runFilter();
    }

    function setSearchPage() {
        var input = document.querySelector(".search-input");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".search-grid .movie-card"));
        var noResult = document.querySelector(".no-result");
        if (!input || cards.length === 0) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        input.value = query;
        function runSearch() {
            var keyword = normalize(input.value);
            var shown = 0;
            cards.forEach(function (card) {
                var text = normalize(card.textContent + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-year"));
                var visible = keyword === "" || text.indexOf(keyword) !== -1;
                card.style.display = visible ? "" : "none";
                if (visible) {
                    shown += 1;
                }
            });
            if (noResult) {
                noResult.classList.toggle("visible", shown === 0);
            }
        }
        input.addEventListener("input", runSearch);
        runSearch();
    }

    function setupStaticPlayer(streamUrl) {
        var video = document.querySelector(".player-video");
        var layer = document.querySelector(".play-layer");
        var button = document.querySelector(".play-button");
        var state = document.querySelector(".player-state");
        var started = false;
        var hls = null;
        function setState(text) {
            if (state) {
                state.textContent = text;
            }
        }
        function startVideo() {
            if (!video) {
                return;
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    setState("点击播放按钮即可开始观看");
                });
            }
        }
        function prepare() {
            if (!video || !streamUrl) {
                setState("暂时无法播放该影片");
                return;
            }
            if (started) {
                startVideo();
                return;
            }
            started = true;
            if (layer) {
                layer.classList.add("hidden");
            }
            setState("正在加载影片...");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.addEventListener("loadedmetadata", function () {
                    setState("");
                    startVideo();
                }, { once: true });
                video.load();
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setState("");
                    startVideo();
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setState("播放失败，请稍后重试");
                        if (hls) {
                            hls.destroy();
                            hls = null;
                        }
                    }
                });
            } else {
                video.src = streamUrl;
                video.load();
                startVideo();
            }
        }
        if (layer) {
            layer.addEventListener("click", prepare);
        }
        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                prepare();
            });
        }
        if (video) {
            video.addEventListener("click", function () {
                if (!started) {
                    prepare();
                }
            });
        }
    }

    window.setupStaticPlayer = setupStaticPlayer;

    ready(function () {
        setMobileMenu();
        setSpotlight();
        setFilters();
        setSearchPage();
    });
})();

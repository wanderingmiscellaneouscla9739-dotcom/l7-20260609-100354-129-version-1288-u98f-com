document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var index = Number(dot.getAttribute("data-slide"));
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  document.querySelectorAll(".filter-area").forEach(function (area) {
    var input = area.querySelector(".filter-input");
    var select = area.querySelector(".filter-select");
    var section = area.closest(".content-section");
    var cards = section ? Array.prototype.slice.call(section.querySelectorAll(".movie-card")) : [];

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var year = select ? select.value : "";

      cards.forEach(function (card) {
        var searchText = card.getAttribute("data-search") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var matchedKeyword = !keyword || searchText.indexOf(keyword) !== -1;
        var matchedYear = !year || cardYear === year;
        card.style.display = matchedKeyword && matchedYear ? "" : "none";
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    if (select) {
      select.addEventListener("change", applyFilter);
    }
  });

  var searchResults = document.getElementById("searchResults");
  var searchSummary = document.getElementById("searchSummary");
  var searchInput = document.getElementById("searchPageInput");

  if (searchResults && window.SEARCH_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();

    if (searchInput) {
      searchInput.value = query;
    }

    function renderResults(items, message) {
      if (searchSummary) {
        searchSummary.textContent = message;
      }

      searchResults.innerHTML = items.map(function (item) {
        return "<a class=\"movie-card\" href=\"" + item.href + "\">" +
          "<span class=\"poster-wrap\">" +
          "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
          "<span class=\"poster-badge\">" + escapeHtml(item.category) + "</span>" +
          "</span>" +
          "<span class=\"card-body\">" +
          "<strong>" + escapeHtml(item.title) + "</strong>" +
          "<em>" + escapeHtml(item.desc) + "</em>" +
          "<span class=\"card-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></span>" +
          "</span>" +
          "</a>";
      }).join("");
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    if (query) {
      var needle = query.toLowerCase();
      var matched = window.SEARCH_INDEX.filter(function (item) {
        return item.text.indexOf(needle) !== -1;
      }).slice(0, 120);
      renderResults(matched, matched.length ? "搜索结果" : "未找到相关影片");
    } else {
      renderResults(window.SEARCH_INDEX.slice(0, 60), "输入关键词进行搜索");
    }
  }
});

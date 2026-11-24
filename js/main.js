/*
 * Vinarija Porta — opšti UI: navigacija, učitavanje vina iz products.json,
 * FAQ akordeon i slanje forme za upit (Netlify Forms + WhatsApp rezerva).
 */
(function () {
  var WHATSAPP_NUMBER = "381653268722"; /* +381 65 326 87 22, bez + i razmaka */

  /* ---------- Mobilna navigacija ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        links.classList.toggle("open");
      });
      links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { links.classList.remove("open"); });
      });
    }

    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    initFaq();
    initProductGrids();
    initOrderForm();
    initReveal();
    initHeroSlideshow();
    initHeaderScroll();
    initCounters();
  });

  /* ---------- Brojčanici u statistici: animacija od nule ---------- */
  function initCounters() {
    var counters = document.querySelectorAll(".counter");
    if (!counters.length) return;

    function formatNumber(n) {
      return Math.round(n).toLocaleString("sr-RS");
    }

    function animateCounter(el) {
      var target = parseFloat(el.getAttribute("data-target")) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = 1600;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = formatNumber(target * eased) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Header: providan i veći na vrhu, sažima se i tamni na skrol ---------- */
  function initHeaderScroll() {
    var header = document.querySelector(".site-header");
    var floatCta = document.getElementById("heroFloatCta");
    var backToTop = document.getElementById("backToTop");
    if (!header) return;
    function update() {
      var scrolled = window.scrollY > 60;
      header.classList.toggle("is-scrolled", scrolled);
      if (floatCta) floatCta.classList.toggle("is-visible", scrolled);
      if (backToTop) backToTop.classList.toggle("is-visible", scrolled);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    if (backToTop) {
      backToTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  /* ---------- Hero pozadinski slideshow (Ken Burns zum) + tekst po slajdu ---------- */
  function initHeroSlideshow() {
    var slideshow = document.getElementById("heroSlideshow");
    if (!slideshow) return;
    var slides = slideshow.querySelectorAll(".hero-slide");
    if (slides.length < 2) return;

    var headingEl = document.getElementById("heroHeading");
    var leadEl = document.getElementById("heroLead");
    var texts = [
      { heading: "VINO KOJE PRIČA PRIČU", lead: "Vinarija Porta — autentična vina iz srca Negotinske krajine" },
      { heading: "TRADICIJA STARA VEKOVIMA", lead: "15 godina posvećenosti vinogradima Negotinske krajine" },
      { heading: "OD VINOGRADA DO VAŠE ČAŠE", lead: "Veleprodaja vina — Cuvée, Chardonnay, Merlot i još mnogo toga" },
      { heading: "UKUS KOJI SE PAMTI", lead: "Otkrijte vina Vinarije Porta, negovana sa 8 hektara vinograda" }
    ];

    var current = 0;
    var interval = 7000;

    function swapText(index) {
      if (!headingEl || !leadEl || !texts[index]) return;
      headingEl.style.opacity = 0;
      leadEl.style.opacity = 0;
      setTimeout(function () {
        headingEl.innerHTML = texts[index].heading;
        leadEl.textContent = texts[index].lead;
        headingEl.style.opacity = 1;
        leadEl.style.opacity = 1;
      }, 400);
    }

    setInterval(function () {
      var next = (current + 1) % slides.length;
      slides[current].classList.remove("is-active");
      void slides[next].offsetWidth; /* forsira reflow da se animacija ponovo pokrene */
      slides[next].classList.add("is-active");
      swapText(next);
      current = next;
    }, interval);
  }

  /* ---------- Scroll-reveal (Intersection Observer, bez biblioteka) ---------- */
  var revealObserver;
  function initReveal(scope) {
    scope = scope || document;
    if (!("IntersectionObserver" in window)) {
      scope.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    }
    scope.querySelectorAll(".reveal:not(.is-visible)").forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ---------- Vina iz products.json ---------- */
  function fetchProducts() {
    return fetch("data/products.json").then(function (res) {
      if (!res.ok) throw new Error("Ne mogu da učitam katalog vina.");
      return res.json();
    });
  }

  function wineCardHTML(p) {
    return (
      '<article class="wine-card reveal" data-id="' + p.id + '">' +
        '<div class="wine-media">' +
          '<img src="' + p.slika + '" alt="' + p.naziv + ' — Vinarija Porta" loading="lazy" width="900" height="900">' +
          '<div class="wine-desc-overlay"><p>' + p.opis + '</p></div>' +
        '</div>' +
        '<div class="wine-body">' +
          '<span class="wine-type">' + p.tip + '</span>' +
          '<h3>' + p.naziv + '</h3>' +
          '<p class="wine-sorta">' + p.sorta + '</p>' +
          '<div class="qty-row">' +
            '<div class="qty-stepper">' +
              '<button type="button" data-pstep="-6">−</button>' +
              '<input type="number" min="6" step="6" value="6" data-pqty>' +
              '<button type="button" data-pstep="6">+</button>' +
            '</div>' +
            '<button type="button" class="btn btn-outline btn-sm" data-add-inquiry>Dodaj u upit</button>' +
          '</div>' +
          '<div class="wine-price-row">' +
            '<span class="wine-price">' + PortaCart.formatPrice(p.cena) + '<small>' + p.jedinica + '</small></span>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function initProductGrids() {
    var grids = document.querySelectorAll("[data-products]");
    if (!grids.length) return;
    fetchProducts().then(function (products) {
      grids.forEach(function (grid) {
        var limit = parseInt(grid.getAttribute("data-limit"), 10);
        var list = limit ? products.slice(0, limit) : products;
        grid.innerHTML = list.map(wineCardHTML).join("");
        bindAddButtons(grid, products);
        initReveal(grid);
      });
    }).catch(function (err) {
      grids.forEach(function (grid) {
        grid.innerHTML = '<p class="text-center">Trenutno ne možemo da učitamo katalog vina. Pokušajte ponovo ili nas kontaktirajte telefonom.</p>';
      });
      console.error(err);
    });
  }

  function bindAddButtons(grid, products) {
    grid.addEventListener("click", function (e) {
      var stepBtn = e.target.closest("[data-pstep]");
      var addBtn = e.target.closest("[data-add-inquiry]");
      var card = e.target.closest(".wine-card");
      if (!card) return;
      var qtyInput = card.querySelector("[data-pqty]");

      if (stepBtn) {
        var delta = parseInt(stepBtn.getAttribute("data-pstep"), 10);
        var next = Math.max(6, (parseInt(qtyInput.value, 10) || 6) + delta);
        qtyInput.value = next;
      } else if (addBtn) {
        var id = card.getAttribute("data-id");
        var product = products.find(function (p) { return p.id === id; });
        if (!product) return;
        PortaCart.addItem(product, qtyInput.value);
        addBtn.textContent = "Dodato ✓";
        setTimeout(function () { addBtn.textContent = "Dodaj u upit"; }, 1400);
      }
    });
  }

  /* ---------- FAQ akordeon ---------- */
  function initFaq() {
    document.querySelectorAll(".faq-item").forEach(function (item) {
      var question = item.querySelector(".faq-question");
      var answer = item.querySelector(".faq-answer");
      if (!question || !answer) return;
      question.addEventListener("click", function () {
        var isOpen = item.classList.contains("open");
        item.closest(".faq-list").querySelectorAll(".faq-item").forEach(function (i) {
          i.classList.remove("open");
          i.querySelector(".faq-answer").style.maxHeight = null;
        });
        if (!isOpen) {
          item.classList.add("open");
          answer.style.maxHeight = answer.scrollHeight + "px";
        }
      });
    });
  }

  /* ---------- Forma za upit / narudžbinu ---------- */
  function initOrderForm() {
    var form = document.getElementById("orderForm");
    if (!form) return;

    var successBox = document.getElementById("formSuccess");
    var errorBox = document.getElementById("formError");

    /* Stroža provera od ugrađene: e-mail mora imati domen sa tačkom (npr. ime@firma.rs) */
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/;
    var PHONE_RE = /^[0-9+()\/\s.\-]{6,}$/;
    function checkField(name, re, msg) {
      var el = form.elements[name];
      if (!el) return true;
      el.value = el.value.trim();
      el.setCustomValidity(re.test(el.value) ? "" : msg);
      if (!el.checkValidity()) { el.reportValidity(); el.focus(); return false; }
      return true;
    }
    function validateContactFields() {
      return checkField("email", EMAIL_RE, "Unesite ispravnu e-mail adresu, npr. ime@firma.rs") &&
             checkField("telefon", PHONE_RE, "Unesite ispravan broj telefona, npr. +381 65 123 4567");
    }
    ["email", "telefon"].forEach(function (n) {
      var el = form.elements[n];
      if (el) el.addEventListener("input", function () { el.setCustomValidity(""); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateContactFields()) return;
      var formData = new FormData(form);
      formData.set("upit-vina", PortaCart.buildSummaryText());

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          handleSuccess();
        })
        .catch(function () { handleError(); });
    });

    function showMessage(box, other) {
      if (other) { other.classList.remove("show"); other.hidden = true; }
      if (!box) return;
      box.hidden = false;
      box.classList.add("show");
      /* sačekaj da se raspored stabilizuje (korpa se osvežava), pa skroluj i fokusiraj */
      window.requestAnimationFrame(function () {
        box.scrollIntoView({ behavior: "smooth", block: "center" });
        try { box.focus({ preventScroll: true }); } catch (err) { box.focus(); }
      });
    }

    function handleSuccess() {
      form.reset();
      PortaCart.clearCart();
      showMessage(successBox, errorBox);
    }

    function handleError() {
      showMessage(errorBox, successBox);
    }

    var waBtn = document.getElementById("sendWhatsappFallback");

    function buildMessage() {
      var naziv = form.querySelector("[name='firma']").value || "-";
      var pib = form.querySelector("[name='pib']").value || "-";
      var osoba = form.querySelector("[name='kontakt-osoba']").value || "-";
      var telefon = form.querySelector("[name='telefon']").value || "-";
      var adresa = form.querySelector("[name='adresa']").value || "-";
      var napomena = form.querySelector("[name='napomena']").value || "-";
      return (
        "Upit za narudžbinu — Vinarija Porta\n\n" +
        "Firma: " + naziv + "\n" +
        "PIB/matični broj: " + pib + "\n" +
        "Kontakt osoba: " + osoba + "\n" +
        "Telefon: " + telefon + "\n" +
        "Adresa isporuke: " + adresa + "\n\n" +
        "Vina:\n" + PortaCart.buildSummaryText() + "\n\n" +
        "Napomena: " + napomena
      );
    }

    if (waBtn) {
      waBtn.addEventListener("click", function () {
        var text = encodeURIComponent(buildMessage());
        window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text, "_blank");
      });
    }
  }
})();

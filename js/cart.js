/*
 * Vinarija Porta — mini "korpa upita" (localStorage, bez plaćanja online).
 * Skuplja izabrana vina i količine tokom razgledanja kataloga.
 * Deljeno na svim stranicama preko window.PortaCart.
 */
(function () {
  var STORAGE_KEY = "porta_upit_korpa_v1";

  function getCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var items = raw ? JSON.parse(raw) : [];
      return Array.isArray(items) ? items : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    renderAll();
  }

  function addItem(product, qty) {
    qty = Math.max(1, parseInt(qty, 10) || 1);
    var items = getCart();
    var existing = items.find(function (i) { return i.id === product.id; });
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        id: product.id,
        naziv: product.naziv,
        cena: product.cena,
        jedinica: product.jedinica || "boca 0,75l",
        slika: product.slika || "",
        qty: qty
      });
    }
    saveCart(items);
    return items;
  }

  function updateQty(id, qty) {
    qty = parseInt(qty, 10) || 1;
    var items = getCart();
    var item = items.find(function (i) { return i.id === id; });
    if (!item) return items;
    if (qty <= 0) {
      items = items.filter(function (i) { return i.id !== id; });
    } else {
      item.qty = qty;
    }
    saveCart(items);
    return items;
  }

  function removeItem(id) {
    var items = getCart().filter(function (i) { return i.id !== id; });
    saveCart(items);
    return items;
  }

  function clearCart() {
    saveCart([]);
  }

  function getCount() {
    return getCart().reduce(function (sum, i) { return sum + i.qty; }, 0);
  }

  function getTotal() {
    return getCart().reduce(function (sum, i) { return sum + i.qty * i.cena; }, 0);
  }

  function formatPrice(n) {
    return Math.round(n).toLocaleString("sr-RS") + " RSD";
  }

  /* ---------- UI: bedž u headeru + drawer ---------- */

  function renderBadge() {
    var count = getCount();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = count;
    });
    document.querySelectorAll("[data-cart-total-label]").forEach(function (el) {
      el.textContent = formatPrice(getTotal());
    });
    document.querySelectorAll("[data-cart-badge]").forEach(function (el) {
      el.textContent = count;
      el.classList.toggle("has-items", count > 0);
    });
  }

  function renderDrawer() {
    var list = document.getElementById("cartItems");
    var totalEl = document.getElementById("cartTotal");
    var foot = document.getElementById("cartDrawerFoot");
    if (!list) return;

    var items = getCart();
    if (items.length === 0) {
      list.innerHTML = '<p class="cart-empty">Vaš upit je trenutno prazan.<br>Dodajte vina iz Vinoteke.</p>';
      if (foot) foot.classList.add("hidden");
      return;
    }
    if (foot) foot.classList.remove("hidden");

    list.innerHTML = items.map(function (i) {
      return (
        '<div class="cart-item" data-id="' + i.id + '">' +
          '<img src="' + (i.slika || "") + '" alt="' + i.naziv + '">' +
          '<div>' +
            '<div class="cart-item-name">' + i.naziv + '</div>' +
            '<div class="cart-item-meta">' + i.qty + ' × ' + formatPrice(i.cena) + ' (' + i.jedinica + ')</div>' +
            '<button type="button" class="cart-item-remove" data-remove="' + i.id + '">Ukloni</button>' +
          '</div>' +
          '<div class="qty-stepper">' +
            '<button type="button" data-step="-1" data-id="' + i.id + '">−</button>' +
            '<input type="number" min="1" value="' + i.qty + '" data-qty-input="' + i.id + '">' +
            '<button type="button" data-step="1" data-id="' + i.id + '">+</button>' +
          '</div>' +
        '</div>'
      );
    }).join("");

    if (totalEl) totalEl.textContent = formatPrice(getTotal());
  }

  function renderOrderSummary() {
    var box = document.getElementById("orderSummary");
    if (!box) return;
    var items = getCart();
    if (items.length === 0) {
      box.innerHTML = '<h4>Vaš upit</h4><p class="order-summary-empty">Korpa upita je prazna. Vratite se u <a href="vinoteka.html" style="color:var(--gold-light);text-decoration:underline;">Vinoteku</a> i izaberite vina pre slanja upita, ili opišite željena vina u napomeni ispod.</p>';
      return;
    }
    var rows = items.map(function (i) {
      return '<div class="order-summary-row"><span>' + i.naziv + ' × ' + i.qty + '</span><span>' + formatPrice(i.qty * i.cena) + '</span></div>';
    }).join("");
    box.innerHTML = '<h4>Vaš upit</h4>' + rows +
      '<div class="order-summary-total"><span>Ukupno (orijentaciono)</span><span>' + formatPrice(getTotal()) + '</span></div>';
  }

  function buildSummaryText() {
    var items = getCart();
    if (items.length === 0) return "Nema izabranih vina iz Vinoteke — pogledati napomenu.";
    var lines = items.map(function (i) {
      return "- " + i.naziv + " (" + i.jedinica + "): " + i.qty + " kom x " + formatPrice(i.cena) + " = " + formatPrice(i.qty * i.cena);
    });
    lines.push("UKUPNO (orijentaciono): " + formatPrice(getTotal()));
    return lines.join("\n");
  }

  function bindDrawerEvents() {
    var list = document.getElementById("cartItems");
    if (!list) return;
    list.addEventListener("click", function (e) {
      var stepBtn = e.target.closest("[data-step]");
      var removeBtn = e.target.closest("[data-remove]");
      if (stepBtn) {
        var id = stepBtn.getAttribute("data-id");
        var delta = parseInt(stepBtn.getAttribute("data-step"), 10);
        var current = getCart().find(function (i) { return i.id === id; });
        if (current) updateQty(id, current.qty + delta);
      } else if (removeBtn) {
        removeItem(removeBtn.getAttribute("data-remove"));
      }
    });
    list.addEventListener("change", function (e) {
      if (e.target.matches("[data-qty-input]")) {
        var id = e.target.getAttribute("data-qty-input");
        updateQty(id, e.target.value);
      }
    });
  }

  function bindToggleEvents() {
    var openBtns = document.querySelectorAll("[data-cart-open]");
    var closeBtns = document.querySelectorAll("[data-cart-close]");
    var drawer = document.getElementById("cartDrawer");
    var overlay = document.getElementById("cartOverlay");

    function open() {
      if (drawer) drawer.classList.add("open");
      if (overlay) overlay.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function close() {
      if (drawer) drawer.classList.remove("open");
      if (overlay) overlay.classList.remove("open");
      document.body.style.overflow = "";
    }
    openBtns.forEach(function (b) { b.addEventListener("click", open); });
    closeBtns.forEach(function (b) { b.addEventListener("click", close); });
    if (overlay) overlay.addEventListener("click", close);
  }

  function renderAll() {
    renderBadge();
    renderDrawer();
    renderOrderSummary();
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindDrawerEvents();
    bindToggleEvents();
    renderAll();
  });

  window.PortaCart = {
    getCart: getCart,
    addItem: addItem,
    updateQty: updateQty,
    removeItem: removeItem,
    clearCart: clearCart,
    getCount: getCount,
    getTotal: getTotal,
    formatPrice: formatPrice,
    buildSummaryText: buildSummaryText,
    renderAll: renderAll
  };
})();

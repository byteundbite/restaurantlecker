/* --------------------------------------------------------------------------
 * 1) Globale Konfiguration (Preise, Texte, Storage-Key, MwSt.)
 * -------------------------------------------------------------------------- */
const CONFIG = {
  // Gesetzliche Mehrwertsteuer (z. B. 19%)
  vatRate: 0.19,

  // Währungsdarstellung
  currency: "€",

  // Texte: Tagesangebote (Anzeige auf der Startseite)
  texts: {
    daily: {
      0: "Heute haben wir Ruhetag. Wir freuen uns auf morgen!",
      1: "Pizza Margherita mit frischem Basilikum (8,90 €)",
      2: "Pizza Funghi mit Champignons und Kräutern (9,90 €)",
      3: "Pizza BBQ Chicken mit Zwiebeln (11,90 €)",
      4: "Pizza Verdure – buntes Gemüse (10,90 €)",
      5: "Pizza Diavolo – scharf und würzig (11,50 €)",
      6: "Trüffel-Pizza mit Rucola (12,90 €)"
    }
  },

  // Vorkonfigurierte Presets für "Pizza des Tages" (werden per LocalStorage in den Konfigurator übergeben)
  dailySpecials: {
    1: {size:"30", dough:"italian", sauce:"tomato", cheeses:["mozzarella"], toppings:["basil"], note:"Pizza des Tages: Margherita", qty:1},
    2: {size:"30", dough:"italian", sauce:"tomato", cheeses:["mozzarella"], toppings:["mushrooms"], note:"Pizza des Tages: Funghi", qty:1},
    3: {size:"30", dough:"american", sauce:"bbq", cheeses:["cheddar"], toppings:["chicken","onion"], note:"Pizza des Tages: BBQ Chicken", qty:1},
    4: {size:"30", dough:"italian", sauce:"tomato", cheeses:["mozzarella"], toppings:["paprika","rucola","corn","mushrooms","olives"], note:"Pizza des Tages: Verdure", qty:1},
    5: {size:"30", dough:"italian", sauce:"tomato", cheeses:["mozzarella"], toppings:["peperoni","onion"], note:"Pizza des Tages: Diavolo", qty:1},
    6: {size:"30", dough:"italian", sauce:"oilherbs", cheeses:["mozzarella"], toppings:["rucola","porcini"], note:"Pizza des Tages: Trüffel & Rucola", qty:1}
  },

  // Preisliste (Nettopreise). Versandkosten flat: shippingFlat.
  prices: {
    size: { "26": 6.5, "30": 8.5, "36": 10.5 },
    dough: { american: 0.5, italian: 0, glutenfree: 1.0 },
    sauce: { tomato: 0, white: 0.5, bbq: 0.5, oilherbs: 0.3 },
    cheese: { mozzarella: 0, cheddar: 0.5, goat: 1.0 },
    toppings: {
      salami: 1.2, ham: 1.0, parma: 1.5, chicken: 1.4,
      porcini: 1.2, paprika: 0.8, onion: 0.5, olives: 0.9,
      rucola: 0.7, peperoni: 0.7, corn: 0.6, mushrooms: 0.8
    },
    shippingFlat: 0
  },

  // LocalStorage-Schlüssel für Warenkorb
  storageKey: "lecker_v3_cart",

  // Storage für letzte Bestellzusammenfassung (Thankyou-Seite)
  lastOrderKey: "lecker_v3_lastOrder"
};

/* --------------------------------------------------------------------------
 * 2) Hilfsfunktionen
 * -------------------------------------------------------------------------- */

/** Brutto aus Netto mit MwSt. */
function applyVAT(net){ return net * (1 + (CONFIG.vatRate || 0)); }

/** Netto aus Brutto (Fallback für Alt-Daten im LocalStorage) */
function removeVAT(gross){ return gross / (1 + (CONFIG.vatRate || 0)); }

/** Formatiert eine Zahl als Euro mit 2 Dezimalstellen (Deutsch: Komma) */
function euro(n){ return n.toFixed(2).replace(".", ",") + " " + CONFIG.currency; }

/** Liefert die Werte aller angehakten Eingaben (Checkboxen) für einen Selektor */
function checkedValues(selector){ return Array.from(document.querySelectorAll(selector + ":checked")).map(el => el.value); }

/** Liest den Warenkorb aus LocalStorage (robust gegen kaputte Inhalte) */
function loadCart(){ try { return JSON.parse(localStorage.getItem(CONFIG.storageKey) || "[]"); } catch { return []; } }

/** Speichert den übergebenen Warenkorb im LocalStorage */
function saveCart(items){ localStorage.setItem(CONFIG.storageKey, JSON.stringify(items)); }

/** Speichert die letzte Bestell-Zusammenfassung für thankyou.html */
function saveLastOrderSummary(data){
  localStorage.setItem(CONFIG.lastOrderKey, JSON.stringify(data));
}

/** Holt die letzte Bestell-Zusammenfassung */
function loadLastOrderSummary(){
  try { return JSON.parse(localStorage.getItem(CONFIG.lastOrderKey) || "null"); } catch { return null; }
}

/** Erzeugt eine menschenlesbare Beschreibung einer Pizza-Konfiguration */
function pizzaLabel(item){
  const cheeseTxt = item.cheeses?.length ? " • Käse: " + item.cheeses.join(", ") : "";
  const topsTxt = item.toppings?.length ? " • Beläge: " + item.toppings.join(", ") : "";
  const noteTxt = item.note ? ` • Hinweis: ${item.note}` : "";
  return `Pizza (${item.size}cm, ${item.dough}, ${item.sauce}${cheeseTxt}${topsTxt}${noteTxt})`;
}

/* --------------------------------------------------------------------------
 * 3) DOM-Ready: Initialisierung pro Seite (Startseite, Konfigurator, Warenkorb,
 *    Kasse, Danke-Seite, Kontakt)
 * -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {

  /* ----- 3.1 Footer-Jahreszahl setzen ----- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----- 3.2 Startseite: Pizza des Tages inkl. Deep-Link in den Konfigurator ----- */
  const dailyEl = document.getElementById("daily-special");
  if (dailyEl){
    const today = new Date().getDay(); // 0=Sonntag, 1=Montag, ...
    dailyEl.textContent = CONFIG.texts.daily[today];

    // Wenn ein Preset vorhanden ist: Button einfügen, der die Konfiguration übergibt
    const preset = CONFIG.dailySpecials[today];
    if (preset){
      const link = document.createElement('a');
      link.href = 'configurator.html';
      link.textContent = 'Jetzt auswählen';
      link.className = 'btn-primary';
      link.style.marginLeft = '0.6rem';

      const wrap = document.createElement('span');
      wrap.className = 'daily-wrap';
      wrap.appendChild(document.createTextNode(' '));
      wrap.appendChild(link);

      dailyEl.appendChild(wrap);

      link.addEventListener('click', (e) => {
        e.preventDefault();
        // Pending-Konfiguration speichern und dann auf den Konfigurator leiten
        localStorage.setItem(CONFIG.storageKey + "_pending", JSON.stringify(preset));
        window.location.href = link.href;
      });
    }
  }

  /* ----- 3.3 Konfigurator: Live-Preise, in den Warenkorb legen, Mini-Warenkorb ----- */
  const priceEl = document.getElementById("price");
  const sizeEl = document.getElementById("size");
  const doughEl = document.getElementById("dough");
  const sauceEl = document.getElementById("sauce");
  const qtyEl = document.getElementById("qty");
  const noteEl = document.getElementById("note");
  const addBtn = document.getElementById("add-to-cart");

  const miniList = document.getElementById("mini-cart-list");

  // Vorkonfiguration aus "Pizza des Tages" übernehmen (falls vorhanden)
  try {
    const pendingRaw = localStorage.getItem(CONFIG.storageKey + "_pending");
    if (pendingRaw && sizeEl && doughEl && sauceEl){
      const p = JSON.parse(pendingRaw);
      // Größe
      sizeEl.value = p.size || sizeEl.value;
      // Teig (Mapping für Text/Keys)
      const doughMap = { "Amerikanisch – dick & fluffig": "american", "Italienisch – dünn & knusprig": "italian", "Glutenfrei": "glutenfree", "american":"american", "italian":"italian", "glutenfree":"glutenfree" };
      doughEl.value = doughMap[p.dough] || p.dough || doughEl.value;
      // Soße
      const sauceMap = { "Mediterrane Tomatensoße":"tomato", "Weiße Soße mit Crème fraîche":"white", "BBQ-Soße":"bbq", "Olivenöl mit Kräutern":"oilherbs", "tomato":"tomato","white":"white","bbq":"bbq","oilherbs":"oilherbs" };
      sauceEl.value = sauceMap[p.sauce] || p.sauce || sauceEl.value;
      // Käse
      document.querySelectorAll('input.cheese').forEach(ch => ch.checked = false);
      (p.cheeses || []).forEach(name => {
        const map = { "Mozzarella":"mozzarella", "Cheddar":"cheddar", "Ziegenkäse":"goat", "mozzarella":"mozzarella", "cheddar":"cheddar", "goat":"goat" };
        const val = map[name] || name;
        const el = document.querySelector('input.cheese[value="'+val+'"]');
        if (el) el.checked = true;
      });
      // Beläge
      document.querySelectorAll('input.topping').forEach(tp => tp.checked = false);
      (p.toppings || []).forEach(name => {
        const map = {"Salami":"salami","Hinterschinken":"ham","Parmaschinken":"parma","Hähnchen":"chicken","Steinpilze":"porcini","Paprika":"paprika","Zwiebeln":"onion","Oliven":"olives","Rucola":"rucola","Peperoni":"peperoni","Mais":"corn","Champignons":"mushrooms","salami":"salami","ham":"ham","parma":"parma","chicken":"chicken","porcini":"porcini","paprika":"paprika","onion":"onion","olives":"olives","rucola":"rucola","peperoni":"peperoni","corn":"corn","mushrooms":"mushrooms"};
        const val = map[name] || name;
        const el = document.querySelector('input.topping[value="'+val+'"]');
        if (el) el.checked = true;
      });
      // Menge & Hinweis
      if (qtyEl) qtyEl.value = p.qty || 1;
      if (noteEl && p.note) noteEl.value = p.note;
      // Pending wieder löschen & Preis neu berechnen
      localStorage.removeItem(CONFIG.storageKey + "_pending");
      if (typeof calcAndRenderPrice === 'function') calcAndRenderPrice();
    }
  } catch{}

  const miniEmpty = document.getElementById("mini-cart-empty");
  const miniSummary = document.getElementById("mini-cart-summary");
  const miniTotal = document.getElementById("mini-cart-total");

  if (priceEl && sizeEl && doughEl && sauceEl && qtyEl && addBtn){
    // Preisberechnung pro Pizza (Netto)
    function calcUnit(){
      let unit = 0;
      unit += CONFIG.prices.size[sizeEl.value] || 0;
      unit += CONFIG.prices.dough[doughEl.value] || 0;
      unit += CONFIG.prices.sauce[sauceEl.value] || 0;
      checkedValues("input.cheese").forEach(c => unit += CONFIG.prices.cheese[c] || 0);
      checkedValues("input.topping").forEach(t => unit += CONFIG.prices.toppings[t] || 0);
      return unit;
    }

    // Gesamtsumme (Brutto) rendern (inkl. MwSt.-Hinweis)
    function calcAndRenderPrice(){
      const qty = Math.max(1, parseInt(qtyEl.value || "1", 10));
      const totalNet = calcUnit() * qty;
      const totalGross = applyVAT(totalNet);
      priceEl.textContent = euro(totalGross) + " (inkl. MwSt.)";
      return totalGross;
    }

    // Live-Aktualisierung bei Änderungen
    ["change","input"].forEach(ev => {
      document.body.addEventListener(ev, (e) => {
        if (e.target.closest("main")) calcAndRenderPrice();
      }, true);
    });
    calcAndRenderPrice();

    // Artikel in den Warenkorb legen (stilles Hinzufügen; kein Popup)
    addBtn.addEventListener("click", () => {
  const item = {
    size: sizeEl.value,
    dough: doughEl.options[doughEl.selectedIndex].text,
    sauce: sauceEl.options[sauceEl.selectedIndex].text,
    cheeses: checkedValues("input.cheese").map(v => ({mozzarella:"Mozzarella", cheddar:"Cheddar", goat:"Ziegenkäse"}[v] || v)),
    toppings: checkedValues("input.topping").map(v => ({
      salami:"Salami", ham:"Hinterschinken", parma:"Parmaschinken", chicken:"Hähnchen",
      porcini:"Steinpilze", paprika:"Paprika", onion:"Zwiebeln", olives:"Oliven",
      rucola:"Rucola", peperoni:"Peperoni", corn:"Mais", mushrooms:"Champignons"
    }[v] || v)),
    note: (noteEl?.value || "").trim(),
    qty: Math.max(1, parseInt(qtyEl.value || "1", 10))
  };

  const unitNet = calcUnit();
  const unitGross = applyVAT(unitNet);

  item.unitNet = unitNet;
  item.unit = unitGross;
  item.totalNet = unitNet * item.qty;
  item.total = unitGross * item.qty;

  const cart = loadCart();

  // Prüfen, ob die gleiche Pizza schon existiert
  const existing = cart.find(it =>
    it.size === item.size &&
    it.dough === item.dough &&
    it.sauce === item.sauce &&
    JSON.stringify(it.cheeses) === JSON.stringify(item.cheeses) &&
    JSON.stringify(it.toppings) === JSON.stringify(item.toppings) &&
    it.note === item.note
  );

  if (existing) {
    // Gleiche Pizza gefunden -> Menge erhöhen
    existing.qty += item.qty;
    existing.totalNet = existing.unitNet * existing.qty;
    existing.total    = existing.unit * existing.qty;
  } else {
    cart.push(item);
  }

  saveCart(cart);
  renderMiniCart();
  calcAndRenderPrice();
});

// Mini-Warenkorb rendern
function renderMiniCart() {
  if (!miniList || !miniEmpty || !miniSummary || !miniTotal) return;

  const cart = loadCart();
  miniList.innerHTML = "";

  if (cart.length === 0) {
    miniEmpty.style.display = "block";
    miniSummary.style.display = "none";
    miniTotal.textContent = euro(0);
    return;
  }

  miniEmpty.style.display = "none";
  miniSummary.style.display = "flex";

  let sum = 0;

  cart.forEach(it => {
    sum += it.unit * it.qty;

    const li = document.createElement("li");
    li.innerHTML = `<span class="small">${it.qty} × ${pizzaLabel(it)}</span> <strong>${euro(it.unit * it.qty)}</strong>`;
    miniList.appendChild(li);
  });

  miniTotal.textContent = euro(sum);
}
renderMiniCart();
}

  /* ----- 3.4 Warenkorb-Seite: Tabelle rendern, Mengen ändern, entfernen, Summen ----- */
  const cartTable = document.getElementById("cart-table");
  const cartBody = document.getElementById("cart-body");
  const cartEmpty = document.getElementById("cart-empty");

  // neue IDs lt. Anforderung (Warenkorb)
  const cartNet = document.getElementById("cart-net");
  const cartShipping = document.getElementById("cart-shipping");
  const cartSubtotal = document.getElementById("cart-subtotal");
  const cartVAT = document.getElementById("cart-vat");
  const cartTotal = document.getElementById("cart-total");

  if (cartTable && cartBody && cartEmpty && cartSubtotal && cartTotal){
    // Leeren Warenkorb abfangen: "Zur Kasse" nur wenn Artikel im Warenkorb liegen
    const cartToCheckoutLink = document.querySelector('a[href="checkout.html"].btn-primary.fullwidth');
    if (cartToCheckoutLink){
      cartToCheckoutLink.addEventListener("click", (e) => {
        const items = loadCart();
        if (!items || items.length === 0){
          e.preventDefault();
          alert("Ihr Warenkorb ist leer.");
        }
      });
    }

    // Hilfsfunktion: Summen neu berechnen & anzeigen (inkl. Netto/Brutto-Schema)
    function renderTotals(items){
      // Summe Netto & Brutto aus Positionen bilden
      let sumNet = 0;
      let sumGross = 0;

      items.forEach(it => {
        // Fallbacks für ältere Cart-Einträge ohne totalNet/unitNet
        const itTotalGross = Number(it.total) || 0;
        const itTotalNet = (it.totalNet !== undefined)
          ? Number(it.totalNet)
          : removeVAT(itTotalGross);

        sumGross += itTotalGross;
        sumNet += itTotalNet;
      });

      // Versandkosten sind Nettopreise laut CONFIG
      const shippingNet = CONFIG.prices.shippingFlat || 0;

      const subtotalNet = sumNet + shippingNet; // Nettobetrag + Lieferung
      const vatAmount = subtotalNet * (CONFIG.vatRate || 0);
      const grossTotal = subtotalNet + vatAmount;

      if (cartNet)       cartNet.textContent = euro(sumNet);        // Nettobetrag (nur Artikel)
      if (cartShipping)  cartShipping.textContent = euro(shippingNet); // Lieferung netto
      if (cartSubtotal)  cartSubtotal.textContent = euro(subtotalNet); // Zwischensumme netto inkl. Lieferung
      if (cartVAT)       cartVAT.textContent = euro(vatAmount);     // MwSt.
      if (cartTotal)     cartTotal.textContent = euro(grossTotal);  // Bruttobetrag (Endpreis)
    }

    // Haupt-Renderer für die Warenkorbtabelle
    function renderCart(){
      const items = loadCart();
      cartBody.innerHTML = "";
      if (items.length === 0){
        cartEmpty.style.display = "block";
        cartTable.style.display = "none";
      } else {
        cartEmpty.style.display = "none";
        cartTable.style.display = "table";
      }

      items.forEach((it, idx) => {
        // Fallback für alte Daten ohne unitNet:
        if (it.unitNet === undefined && it.unit !== undefined){
          // 'unit' ist Brutto => Netto ableiten
          it.unitNet = removeVAT(it.unit);
        }
        if (it.totalNet === undefined && it.total !== undefined){
          it.totalNet = removeVAT(it.total);
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>
            <div><strong>${pizzaLabel(it)}</strong></div>
            <div class="small">Einzelpreis: ${euro(it.unit || 0)}</div>
          </td>
          <td><input type="number" class="cart-qty" data-idx="${idx}" min="1" value="${it.qty}"/></td>
          <td>${euro(it.total || 0)}</td>
          <td><button class="btn-secondary remove" data-idx="${idx}">Entfernen</button></td>
        `;
        cartBody.appendChild(tr);
      });

      renderTotals(items);

      // Mengenänderungen live anwenden
      cartBody.querySelectorAll(".cart-qty").forEach(inp => {
        inp.addEventListener("change", (e) => {
          const idx = +e.target.dataset.idx;
          const qty = Math.max(1, parseInt(e.target.value || "1", 10));
          const items = loadCart();
          const it = items[idx];
          if (!it) return;
          it.qty = qty;

          // Wenn noch keine gespeicherten Netto-/Brutto-Einzelpreise vorhanden sind,
          // aus vorhandenen Werten herleiten.
          if (it.unitNet === undefined && it.unit !== undefined){
            it.unitNet = removeVAT(it.unit);
          }
          if (it.unit === undefined && it.unitNet !== undefined){
            it.unit = applyVAT(it.unitNet);
          }

          // Gesamtposition neu berechnen
          it.totalNet = (it.unitNet || 0) * it.qty;
          it.total    = (it.unit    || 0) * it.qty;

          saveCart(items);
          renderCart();
        });
      });

      // Entfernen-Buttons
      cartBody.querySelectorAll(".remove").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const idx = +e.target.dataset.idx;
          const items = loadCart();
          items.splice(idx, 1);
          saveCart(items);
          renderCart();
        });
      });
    }
    renderCart();
  }

  /* ----- 3.5 Checkout: Zusammenfassung + Liefertermin-Logik + Absenden ----- */
  const coList = document.getElementById("checkout-list");
  const coNet = document.getElementById("checkout-net");
  const coShipping = document.getElementById("checkout-shipping");
  const coVAT = document.getElementById("checkout-vat");
  const coTotal = document.getElementById("checkout-total");
  const coForm = document.getElementById("checkout-form");

  // Liefertermin-Felder
  const coDateTimeEl = document.getElementById("co-datetime");
  const coAsapEl = document.getElementById("co-asap");

  // (a) Mindestzeitpunkt = jetzt + 1h
  if (coDateTimeEl){
    const oneHourMs = 60 * 60 * 1000;
    const minDate = new Date(Date.now() + oneHourMs);

    function pad(n){ return String(n).padStart(2,"0"); }
    // datetime-local format: "YYYY-MM-DDTHH:MM"
    const minVal = [
      minDate.getFullYear(),
      pad(minDate.getMonth()+1),
      pad(minDate.getDate())
    ].join("-") + "T" + pad(minDate.getHours()) + ":" + pad(minDate.getMinutes());

    coDateTimeEl.min = minVal;
  }

  // (b) Ausgrauen bei "nächstmöglicher Zeitpunkt"
  function applyAsapState(){
    if (!coDateTimeEl || !coAsapEl) return;
    if (coAsapEl.checked){
      coDateTimeEl.classList.add("faded");
      // Wenn Checkbox aktiv ist -> gewählten Zeitpunkt löschen
      coDateTimeEl.value = "";
    } else {
      coDateTimeEl.classList.remove("faded");
    }
  }

  if (coAsapEl){
    coAsapEl.addEventListener("change", applyAsapState);
  }
  if (coDateTimeEl){
    // Wenn der User das Feld aktiv klickt/fokussiert, Checkbox deaktivieren + Optik zurücksetzen
    coDateTimeEl.addEventListener("focus", () => {
      if (coAsapEl){
        coAsapEl.checked = false;
      }
      applyAsapState();
    });
  }
  applyAsapState();

  // (c) Bestellübersicht berechnen (Checkout-Seite)
  if (coList && coTotal){
    const items = loadCart();
    coList.innerHTML = "";

    // Summen bilden wie im Warenkorb (aber ohne Mengenänderung)
    let sumNet = 0;
    items.forEach(it => {
      const itTotalGross = Number(it.total) || 0;
      const itTotalNet = (it.totalNet !== undefined)
        ? Number(it.totalNet)
        : removeVAT(itTotalGross);
      sumNet += itTotalNet;

      const li = document.createElement("li");
      li.innerHTML = `<span class="small">${pizzaLabel(it)}</span><strong>${euro(it.total)}</strong>`;
      coList.appendChild(li);
    });

    const shippingNet = CONFIG.prices.shippingFlat || 0;
    const vatAmount = (sumNet + shippingNet) * (CONFIG.vatRate || 0);
    const grossTotal = (sumNet + shippingNet) + vatAmount;

    if (coNet)      coNet.textContent = euro(sumNet);
    if (coShipping) coShipping.textContent = euro(shippingNet);
    if (coVAT)      coVAT.textContent = euro(vatAmount);
    if (coTotal)    coTotal.textContent = euro(grossTotal);
  }

  if (coForm){
    // "Abschicken": Zusammenfassung speichern -> Warenkorb leeren -> Weiterleitung zur Danke-Seite
    coForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Aktuelle Summen berechnen
      const items = loadCart();
      let sumNet = 0;
      items.forEach(it => {
        const itTotalGross = Number(it.total) || 0;
        const itTotalNet = (it.totalNet !== undefined)
          ? Number(it.totalNet)
          : removeVAT(itTotalGross);
        sumNet += itTotalNet;
      });
      const shippingNet = CONFIG.prices.shippingFlat || 0;
      const vatAmount = (sumNet + shippingNet) * (CONFIG.vatRate || 0);
      const grossTotal = (sumNet + shippingNet) + vatAmount;

      // Liefertermin-Text bestimmen
      let deliveryText = "";
      if (coAsapEl && coAsapEl.checked){
        deliveryText = "nächstmöglicher Zeitpunkt";
      } else if (coDateTimeEl && coDateTimeEl.value){
        deliveryText = coDateTimeEl.value; // raw datetime-local String
      } else {
        deliveryText = "nicht angegeben";
      }

      // Infos für Thankyou speichern
      saveLastOrderSummary({
        net: sumNet,
        shipping: shippingNet,
        vat: vatAmount,
        gross: grossTotal,
        delivery: deliveryText
      });

      // Warenkorb leeren
      saveCart([]);

      // Weiterleiten zur Danke-Seite
      window.location.href = "thankyou.html";
    });
  }

  /* ----- 3.6 Danke-Seite (thankyou.html): Daten anzeigen ----- */
  const tyNet = document.getElementById("ty-net");
  const tyShipping = document.getElementById("ty-shipping");
  const tyVat = document.getElementById("ty-vat");
  const tyTotal = document.getElementById("ty-total");
  const tyTime = document.getElementById("ty-time");

  if (tyNet || tyShipping || tyVat || tyTotal || tyTime){
    const summary = loadLastOrderSummary();
    if (summary){
      if (tyNet)     tyNet.textContent = euro(summary.net || 0);
      if (tyShipping)tyShipping.textContent = euro(summary.shipping || 0);
      if (tyVat)     tyVat.textContent = euro(summary.vat || 0);
      if (tyTotal)   tyTotal.textContent = euro(summary.gross || 0);
      if (tyTime)    tyTime.textContent = summary.delivery || "–";
    } else {
      // Fallback falls direkt aufgerufen ohne Bestellung
      if (tyNet)     tyNet.textContent = "0,00 €";
      if (tyShipping)tyShipping.textContent = "0,00 €";
      if (tyVat)     tyVat.textContent = "0,00 €";
      if (tyTotal)   tyTotal.textContent = "0,00 €";
      if (tyTime)    tyTime.textContent = "–";
    }
  }

  /* ----- 3.7 Kontaktformular: Fake-Senden mit Bestätigungsansicht ----- */
  const contactForm = document.getElementById("contact-form");
  if (contactForm){
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // Einfache Bestätigung erzeugen (keine echte Mail)
      const wrapper = contactForm.closest(".card") || contactForm.parentElement;
      contactForm.style.display = "none";
      const confirm = document.createElement("div");
      confirm.className = "contact-confirm";
      confirm.innerHTML = `
        <h2>Vielen Dank für Ihre Nachricht!</h2>
        <p>Wir haben Ihre Anfrage erhalten und melden uns in Kürze bei Ihnen.</p>
        <a href="index.html" class="btn-secondary">Zur Startseite</a>
      `;
      wrapper.appendChild(confirm);
    });
  }
});




/* ----- Saisonale Bestseller-Pizza ----- */
const seasonalEl = document.getElementById("seasonal-special");
if (seasonalEl){
  // Aktueller Monat bestimmen
  const month = new Date().getMonth(); // 0=Jan ... 11=Dez
  let season;
  if (month >= 2 && month <= 4) season = "spring";   // März–Mai
  else if (month >= 5 && month <= 7) season = "summer"; // Juni–Aug
  else if (month >= 8 && month <= 10) season = "autumn"; // Sept–Nov
  else season = "winter"; // Dez–Feb

  // Presets für jede Jahreszeit
  // Saisonale Bestseller-Pizza Presets
const seasonalSpecials = {
  spring: { size: "30", dough: "italian", sauce: "tomato", cheeses: ["mozzarella"], toppings: ["basil","artichokes","mushrooms"], note: "Frühlings-Pizza: Frischer Gartenmix", qty: 1 },
  summer: { size: "30", dough: "italian", sauce: "tomato", cheeses: ["mozzarella","goat"], toppings: ["tomatoes","zucchini","bellpeppers"], note: "Sommer-Pizza: Mediterraner Genuss", qty: 1 },
  autumn: { size: "30", dough: "american", sauce: "bbq", cheeses: ["cheddar"], toppings: ["chicken","onion","mushrooms","peperoni"], note: "Herbst-Pizza: Herzhaft & würzig", qty: 1 },
  winter: { size: "30", dough: "italian", sauce: "oilherbs", cheeses: ["mozzarella","goat"], toppings: ["rucola","porcini","walnuts"], note: "Winter-Pizza: Trüffel & Wintergemüse", qty: 1 }
};

  const preset = seasonalSpecials[season];
  if (preset){
    // Preis dynamisch berechnen
    function calcPizzaPrice(item){
      let unit = 0;
      unit += CONFIG.prices.size[item.size] || 0;
      unit += CONFIG.prices.dough[item.dough] || 0;
      unit += CONFIG.prices.sauce[item.sauce] || 0;
      (item.cheeses || []).forEach(c => unit += CONFIG.prices.cheese[c] || 0);
      (item.toppings || []).forEach(t => unit += CONFIG.prices.toppings[t] || 0);
      return applyVAT(unit); // Brutto inkl. MwSt.
    }

    const priceStr = euro(calcPizzaPrice(preset));

    // Text inkl. Preis
    seasonalEl.textContent = `${preset.note} (${priceStr})`;

    // Button wie bei Pizza des Tages
    const link = document.createElement('a');
    link.href = 'configurator.html';
    link.textContent = 'Jetzt auswählen';
    link.className = 'btn-primary';
    link.style.marginLeft = '0.6rem';

    const wrap = document.createElement('span');
    wrap.className = 'daily-wrap';
    wrap.appendChild(document.createTextNode(' '));
    wrap.appendChild(link);
    seasonalEl.appendChild(wrap);

    link.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.setItem(CONFIG.storageKey + "_pending", JSON.stringify(preset));
      window.location.href = link.href;
    });
  }
}

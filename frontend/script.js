/****************************************************
 * Restaurant Lecker - Frontend JavaScript
 * Warenkorb und Bestellfunktionen
 ****************************************************/

let STATE = {};
let CART = [];

/****************************************************
 * 1. Initialisierung
 ****************************************************/
function initApp() {
    loadCartFromStorage();
    renderDailyPizzaOnIndex();
    renderSeasonPizzaOnIndex();
}

// Kontaktformular: Submit an Backend schicken
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // Email-Validierung mit Echtzeit-Feedback
    const emailInput = document.getElementById('c-email');
    const emailFeedback = document.getElementById('email-feedback');

    // Telefon-Validierung mit Echtzeit-Feedback
    const phoneInput = document.getElementById('c-phone');
    const phoneFeedback = document.getElementById('phone-feedback');

    if (phoneInput && phoneFeedback) {
        // Regex-Patterns für deutsche Telefonnummern
        // Mobil: +49 (0)1xx xxx xxx oder 01xx xxx xxx
        // Festnetz: +49 (0)xxx xxx xxxx oder 0xxx xxx xxxx
        const mobileRegex = /^(\+49|0049|0)?\s*1[0-9]{1,3}\s*[0-9\s\-\/]{6,}$/;
        const landlineRegex = /^(\+49|0049|0)?\s*[2-9][0-9]{1,4}\s*[0-9\s\-\/]{6,}$/;

        phoneInput.addEventListener('input', () => {
            const phone = phoneInput.value.trim();
            phoneFeedback.className = 'phone-feedback';
            phoneFeedback.textContent = '';

            if (phone.length === 0) {
                return; // Leer = kein Feedback nötig
            }

            // Entfernt Leerzeichen für Längsprüfung
            const phoneDigits = phone.replace(/\s/g, '');

            if (!/^[0-9+\-\s\/()]+$/.test(phone)) {
                phoneFeedback.className = 'phone-feedback error';
                phoneFeedback.textContent = '✘ Telefonnummer darf nur Zahlen, +, -, Leerzeichen und () enthalten';
                return;
            }

            if (phoneDigits.length < 10) {
                phoneFeedback.className = 'phone-feedback error';
                phoneFeedback.textContent = '✘ Telefonnummer zu kurz (mindestens 10 Ziffern)';
                return;
            }

            if (phoneDigits.length > 20) {
                phoneFeedback.className = 'phone-feedback error';
                phoneFeedback.textContent = '✘ Telefonnummer zu lang (maximal 20 Ziffern)';
                return;
            }

            // Prüfe ob es eine Mobilnummer ist
            if (mobileRegex.test(phone)) {
                phoneFeedback.className = 'phone-feedback success';
                phoneFeedback.textContent = '✓ Gültige Mobilnummer erkannt';
                return;
            }

            // Prüfe ob es eine Festnetznummer ist
            if (landlineRegex.test(phone)) {
                phoneFeedback.className = 'phone-feedback success';
                phoneFeedback.textContent = '✓ Gültige Festnetznummer erkannt';
                return;
            }

            // Wenn mindestens 10 Ziffern und grundlegendes Format okay
            if (/^[+0-9\s\-()]+$/.test(phone) && phoneDigits.length >= 10) {
                phoneFeedback.className = 'phone-feedback success';
                phoneFeedback.textContent = '✓ Telefonnummer ist gültig';
            } else {
                phoneFeedback.className = 'phone-feedback error';
                phoneFeedback.textContent = '✘ Telefonnummer-Format ist ungültig';
            }
        });

        phoneInput.addEventListener('blur', () => {
            if (phoneInput.value.trim().length === 0) {
                phoneFeedback.className = 'phone-feedback';
                phoneFeedback.textContent = '';
            }
        });
    }

    if (emailInput && emailFeedback) {
        const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        emailInput.addEventListener('input', () => {
            const email = emailInput.value.trim();
            emailFeedback.className = 'email-feedback';
            emailFeedback.textContent = '';

            if (email.length === 0) {
                return; // Leer = kein Feedback nötig
            }

            if (!email.includes('@')) {
                emailFeedback.className = 'email-feedback error';
                emailFeedback.textContent = '✘ E-Mail-Adresse muss ein @ enthalten';
                return;
            }

            const [localPart, domain] = email.split('@');

            if (!localPart || localPart.length === 0) {
                emailFeedback.className = 'email-feedback error';
                emailFeedback.textContent = '✘ Benutzername vor @ fehlt';
                return;
            }

            if (!domain || domain.length === 0) {
                emailFeedback.className = 'email-feedback error';
                emailFeedback.textContent = '✘ Domain nach @ fehlt';
                return;
            }

            if (!domain.includes('.')) {
                emailFeedback.className = 'email-feedback error';
                emailFeedback.textContent = '✘ Domain muss einen Punkt enthalten (z.B. example.com)';
                return;
            }

            const domainParts = domain.split('.');
            const tld = domainParts[domainParts.length - 1];

            if (tld.length < 2) {
                emailFeedback.className = 'email-feedback error';
                emailFeedback.textContent = '✘ TLD (wie .com, .de) muss mindestens 2 Zeichen lang sein';
                return;
            }

            if (emailRegex.test(email)) {
                emailFeedback.className = 'email-feedback success';
                emailFeedback.textContent = '✓ E-Mail-Adresse ist gültig';
            } else {
                emailFeedback.className = 'email-feedback error';
                emailFeedback.textContent = '✘ E-Mail-Format ist ungültig';
            }
        });

        emailInput.addEventListener('blur', () => {
            if (emailInput.value.trim().length === 0) {
                emailFeedback.className = 'email-feedback';
                emailFeedback.textContent = '';
            }
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('c-name')?.value.trim() || '';
        const phone = document.getElementById('c-phone')?.value.trim() || '';
        const email = document.getElementById('c-email')?.value.trim() || '';
        const message = document.getElementById('c-msg')?.value.trim() || '';

        if (!name || !email || !message) {
            alert('Bitte Name, E-Mail und Nachricht ausfüllen.');
            return;
        }

        const kontaktApiUrl = 'http://localhost:8000/api/kontakt';

        try {
            const res = await fetch(kontaktApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, email, message })
            });

            const data = await res.json();
            if (!res.ok || data.fehler) {
                console.error('Fehler beim Senden des Kontaktformulars:', data);
                alert('Fehler beim Senden des Formulars: ' + (data.nachricht || 'Unbekannter Fehler'));
                return;
            }

            alert('Vielen Dank! Ihre Nachricht wurde gesendet.');
            form.reset();
        } catch (err) {
            console.error('Netzwerkfehler beim Senden des Kontaktformulars:', err);
            alert('Netzwerkfehler beim Senden des Formulars.');
        }
    });
}

/****************************************************
 * 2. DB-Daten zu Tages- & Saisonpizza
 ****************************************************/
const API_BASE = 'http://localhost:8000';

async function getDailyPizzaFromDB() {
    try {
        const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        const today = days[new Date().getDay()];
        const res = await fetch(`${API_BASE}/api/tagespizza/tag/${today}`);
        const data = await res.json();
        if (res.ok && !data.fehler) {
            return data;
        }
    } catch (err) {
        console.error('Fehler beim Laden der TagesPizza:', err);
    }
    return null;
}

async function getSeasonPizzaFromDB() {
    try {
        const month = new Date().getMonth();
        let season = "Winter";
        if (month >= 2 && month <= 4) season = "Frühling";
        else if (month >= 5 && month <= 7) season = "Sommer";
        else if (month >= 8 && month <= 10) season = "Herbst";
        const res = await fetch(`${API_BASE}/api/saisonpizza/saison/${season}`);
        const data = await res.json();
        if (res.ok && !data.fehler) {
            return data;
        }
    } catch (err) {
        console.error('Fehler beim Laden der SaisonPizza:', err);
    }
    return null;
}

/****************************************************
 * 3. Index: Tages- & Saisonpizza anzeigen
 ****************************************************/
function euro(v) {
    return v.toFixed(2) + " €";
}

function renderDailyPizzaOnIndex() {
    const el = document.getElementById("daily-special");
    if (!el) return;

    async function load() {
        const p = await getDailyPizzaFromDB();
        if (!p) {
            el.textContent = "Keine Pizza des Tages gefunden.";
            return;
        }

        el.innerHTML = `
            <strong>${p.bezeichnung}</strong><br>
            ${p.beschreibung}<br>
            Preis: <strong>${euro(p.netto_preis * 1.19)}</strong>
        `;
    }
    load();
}

function renderSeasonPizzaOnIndex() {
    const el = document.getElementById("seasonal-special");
    if (!el) return;

    async function load() {
        const p = await getSeasonPizzaFromDB();
        if (!p) {
            el.textContent = "Keine Saisonpizza gefunden.";
            return;
        }

        el.innerHTML = `
            <strong>${p.bezeichnung}</strong><br>
            ${p.beschreibung}<br>
            Preis: <strong>${euro(p.netto_preis * 1.19)}</strong>
        `;
    }
    load();
}

/****************************************************
 * 4. Mini-Warenkorb
 ****************************************************/
function loadCartFromStorage() {
    CART = JSON.parse(localStorage.getItem("cart") || "[]");
    renderMiniCart();
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(CART));
}

function renderMiniCart() {
    const empty = document.getElementById("mini-cart-empty");
    if (!empty) return; // Nicht auf der Startseite

    const list = document.getElementById("mini-cart-list");
    const summary = document.getElementById("mini-cart-summary");

    if (!CART.length) {
        empty.style.display = "block";
        list.innerHTML = "";
        summary.style.display = "none";
        return;
    }

    empty.style.display = "none";
    summary.style.display = "block";

    list.innerHTML = "";
    let sum = 0;

    CART.forEach(item => {
        const li = document.createElement("li");
        li.className = "mini-cart-item";
        li.innerHTML = `
            <span>${item.qty}× ${item.text}</span>
            <strong>${euro(item.total)}</strong>
        `;
        list.appendChild(li);
        sum += item.total;
    });

    document.getElementById("mini-cart-total").textContent = euro(sum);
}

/****************************************************
 * 5. Warenkorb-Seite rendern
 ****************************************************/
function renderCartPage() {
    const cartBody = document.getElementById("cart-body");
    if (!cartBody) return;

    const empty = document.getElementById("cart-empty");
    const table = document.getElementById("cart-table");

    loadCartFromStorage();

    if (CART.length === 0) {
        empty.style.display = "block";
        table.style.display = "none";

        document.getElementById("cart-net").textContent = "0,00 €";
        document.getElementById("cart-shipping").textContent = "0,00 €";
        document.getElementById("cart-subtotal").textContent = "0,00 €";
        document.getElementById("cart-vat").textContent = "0,00 €";
        document.getElementById("cart-total").textContent = "0,00 €";

        return;
    }

    empty.style.display = "none";
    table.style.display = "table";

    let net = 0;
    cartBody.innerHTML = "";

    CART.forEach((item, index) => {
        net += item.total;

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.text}</td>

            <td>
                <div class="qty-wrapper">
                    <button class="qty-btn" data-action="minus" data-index="${index}">−</button>
                    <input class="cart-qty" value="${item.qty}" readonly />
                    <button class="qty-btn" data-action="plus" data-index="${index}">+</button>
                </div>
            </td>

            <td>${euro(item.total)}</td>

            <td>
                <button class="btn-secondary remove-btn" data-index="${index}">X</button>
            </td>
        `;

        cartBody.appendChild(tr);
    });

    // --- Buttons aktivieren ---
    attachCartQtyListeners();

    // --- Totals aktualisieren ---
    const shipping = 2.00;
    const subtotal = net + shipping;
    const vat = subtotal * 0.19;
    const total = subtotal + vat;
    
    document.getElementById("cart-net").textContent = euro(net);
    document.getElementById("cart-shipping").textContent = euro(shipping);
    document.getElementById("cart-subtotal").textContent = euro(subtotal);
    document.getElementById("cart-vat").textContent = euro(vat);
    document.getElementById("cart-total").textContent = euro(total);
}
function attachCartQtyListeners() {
    document.querySelectorAll(".qty-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = btn.dataset.index;
            const action = btn.dataset.action;

            // Stückpreis aus aktuellem Zustand berechnen
            const item = CART[index];
            const unitPrice = item.total / item.qty;  // brutto pro Pizza

            if (action === "minus" && item.qty > 1) {
                item.qty--;
            }
            if (action === "plus") {
                item.qty++;
            }

            // neuen Gesamtpreis aus Stückpreis * Menge berechnen
            item.total = unitPrice * item.qty;

            saveCart();
            renderCartPage();
        });
    });

    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = btn.dataset.index;
            CART.splice(index, 1);
            saveCart();
            renderCartPage();
        });
    });
}


/****************************************************
 * 6. Checkout-Button absichern
 ****************************************************/
function protectCheckoutWhenCartEmpty() {
    const coForm = document.getElementById("checkout-form");
    if (!coForm) return;

    coForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
        if (!currentCart.length) {
            alert("Ihr Warenkorb ist noch leer.");
            return;
        }
        completeOrder();
    });
}

/****************************************************
 * 7. Bestellung abschließen (nur lokale Verarbeitung)
 ****************************************************/
function completeOrder() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (!cart.length) {
        alert("Warenkorb ist leer – Bestellung nicht möglich.");
        return;
    }

    const name   = document.getElementById("co-name")?.value.trim()   || "";
    const street = document.getElementById("co-street")?.value.trim() || "";
    const zip    = document.getElementById("co-zip")?.value.trim()    || "";
    const city   = document.getElementById("co-city")?.value.trim()   || "";
    const phone  = document.getElementById("co-phone")?.value.trim()  || "";
    const email  = document.getElementById("co-email")?.value.trim()  || "";
    const asap   = document.getElementById("co-asap")?.checked        || false;
    const dtVal  = document.getElementById("co-datetime")?.value      || null;
    const note   = document.getElementById("co-note")?.value.trim()   || "";

    if (!name || !street || !zip || !city || !email) {
        alert("Bitte alle Pflichtfelder ausfüllen (Name, Adresse, PLZ, Stadt, E-Mail).");
        return;
    }

    let sumNet = 0;
    cart.forEach(item => {
        sumNet += item.total || 0;
    });

    const shippingNet = 2.00;
    const vatAmount   = (sumNet + shippingNet) * 0.19;
    const grossTotal  = sumNet + shippingNet + vatAmount;

    const deliveryText = asap
        ? "Schnellstmögliche Lieferung"
        : (dtVal ? new Date(dtVal).toLocaleString("de-DE") : "–");

    const lastOrderSummary = {
        kunde: { name, street, zip, city, phone, email },
        items: cart,
        net: sumNet,
        shipping: shippingNet,
        vat: vatAmount,
        total: grossTotal,
        deliveryText,
        note
    };

    localStorage.setItem("lastOrderSummary", JSON.stringify(lastOrderSummary));
    localStorage.removeItem("cart");
    window.location.href = "thankyou.html";
}

/****************************************************
 * 8. Checkout-Seite: Bestellung anzeigen
 ****************************************************/
function renderCheckoutSummary() {
    const coList     = document.getElementById("checkout-list");
    if (!coList) return; // wir sind nicht auf checkout.html

    const coNet      = document.getElementById("checkout-net");
    const coShipping = document.getElementById("checkout-shipping");
    const coVAT      = document.getElementById("checkout-vat");
    const coTotal    = document.getElementById("checkout-total");

    // Warenkorb aus localStorage lesen
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    coList.innerHTML = "";

    if (!cart.length) {
        if (coNet)      coNet.textContent      = "0,00 €";
        if (coShipping) coShipping.textContent = "0,00 €";
        if (coVAT)      coVAT.textContent      = "0,00 €";
        if (coTotal)    coTotal.textContent    = "0,00 €";
        return;
    }

    let sumNet = 0;

    cart.forEach(item => {
        const total = item.total || 0;
        sumNet += total;

        const li = document.createElement("li");
        li.className = "mini-cart-item";
        li.innerHTML = `
            <span class="small">${item.qty}× ${item.text}</span>
            <strong>${euro(total)}</strong>
        `;
        coList.appendChild(li);
    });

    // --- Totals aktualisieren (Lieferung 3 €) ---
    const shipping = 2.00;
    const vatBase  = sumNet + shipping;
    const vat      = vatBase * 0.19;
    const total    = vatBase + vat;

    if (coNet)      coNet.textContent      = euro(sumNet);
    if (coShipping) coShipping.textContent = euro(shipping);
    if (coVAT)      coVAT.textContent      = euro(vat);
    if (coTotal)    coTotal.textContent    = euro(total);
}

/****************************************************
 * 9. Thankyou-Seite: Bestellübersicht anzeigen
 ****************************************************/
function renderThankyouSummary() {
  const netEl = document.getElementById("ty-net");
  if (!netEl) return; // wir sind nicht auf thankyou.html

  const raw = localStorage.getItem("lastOrderSummary");
  if (!raw) {
    console.warn("Keine lastOrderSummary im localStorage gefunden.");
    return;
  }

  let summary;
  try {
    summary = JSON.parse(raw);
  } catch (e) {
    console.error("Konnte lastOrderSummary nicht parsen:", e);
    return;
  }

  // Kundendaten
  const kunde = summary.kunde || {};
  (document.getElementById("ty-name")    || {}).textContent   = kunde.name   || "–";
  (document.getElementById("ty-street")  || {}).textContent   = kunde.street || "–";
  (document.getElementById("ty-zipcity") || {}).textContent   =
    (kunde.zip || "–") + " " + (kunde.city || "");
  (document.getElementById("ty-email")   || {}).textContent   = kunde.email  || "–";
  (document.getElementById("ty-phone")   || {}).textContent   = kunde.phone  || "–";

  // Bestellte Artikel
  const itemsEl = document.getElementById("ty-items");
  if (itemsEl) {
    itemsEl.innerHTML = "";
    (summary.items || []).forEach(item => {
      const li = document.createElement("li");
      li.className = "mini-cart-item";
      li.innerHTML = `
        <span class="small">${item.qty}× ${item.text}</span>
        <strong>${euro(item.total || 0)}</strong>
      `;
      itemsEl.appendChild(li);
    });
  }

  // Preise
  document.getElementById("ty-net").textContent      = euro(summary.net      || 0);
  document.getElementById("ty-shipping").textContent = euro(summary.shipping || 0);
  document.getElementById("ty-vat").textContent      = euro(summary.vat      || 0);
  document.getElementById("ty-total").textContent    = euro(summary.total    || 0);

  // Liefertermin
  document.getElementById("ty-time").textContent     = summary.deliveryText || "–";
}




/****************************************************
 * START
 ****************************************************/
window.addEventListener("DOMContentLoaded", () => {
    initApp();
    renderCartPage();
    protectCheckoutWhenCartEmpty();
    initCheckoutDatetimeLogic();
    renderCheckoutSummary();
    renderThankyouSummary();
    initContactForm();
});

/****************************************************
 * 10. Checkout: Lieferzeitpunkt wählen (ASAP oder Datum)
 ****************************************************/
function initCheckoutDatetimeLogic() {
    const asapCheckbox = document.getElementById("co-asap");
    const datetimeInput = document.getElementById("co-datetime");

    if (!asapCheckbox || !datetimeInput) return;

     // Mindestdatum auf „jetzt“ setzen (kein Datum in der Vergangenheit)
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // für datetime-local korrigieren
    const minValue = now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
    datetimeInput.min = minValue;


    function updateState() {
        if (asapCheckbox.checked) {
            datetimeInput.value = "";
            datetimeInput.disabled = true;
            datetimeInput.required = false;
        } else {
            datetimeInput.disabled = false;
            datetimeInput.required = true;
        }
    }
     // Wenn der Nutzer ein Datum auswählt, automatisch ASAP deaktivieren
    datetimeInput.addEventListener("input", () => {
        if (datetimeInput.value) {
            asapCheckbox.checked = false;
            updateState();
        }
    });

    // Änderungen an der Checkbox behandeln
    asapCheckbox.addEventListener("change", updateState);

    // Standard: „Schnellstmöglich“ aktiv
    asapCheckbox.checked = true;
    updateState();

}

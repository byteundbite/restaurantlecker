/****************************************************
 * Dynamischer Pizza-Konfigurator – Byte & Bite
 * Backend-API: /api/pizzaconfig/load
 ****************************************************/

console.log("Dynamic Pizza Configurator loaded.");

const API_URL = "http://localhost:8000/api/pizzaconfig/load";

let PIZZA_DATA = null;
let STATE = {};
let CART = [];

/****************************************************
 * 1. Daten vom Backend laden
 ****************************************************/
async function loadPizzaConfig() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        if (!data.erfolg) throw new Error("Backend meldet Fehler");

        PIZZA_DATA = data.daten;
        console.log("Pizza-Konfiguration geladen:", PIZZA_DATA);

        // Nur laden, wenn es die jeweiligen Bereiche gibt
        if (isConfiguratorPage()) {
            buildConfiguratorUI();
            applyPresetIfExists();
            attachEventHandlers();
            updatePriceUI();
        }

        loadCartFromStorage();

        // Wird immer ausgeführt – aber nur, wenn auf der index.html Elemente vorhanden sind
        renderDailyPizzaOnIndex();
        renderSeasonPizzaOnIndex();

    } catch (err) {
        console.error("Fehler beim Laden der Konfiguration:", err);
    }
}

/****************************************************
 * Hilfsfunktion: Prüfen ob Konfigurator geladen werden soll
 ****************************************************/
function isConfiguratorPage() {
    return document.getElementById("size") !== null;
}
//neu
/****************************************************
 * 2. DB-Daten zu Tages- & Saisonpizza
 ****************************************************/
function getAllProducts() {
    if (!PIZZA_DATA) return [];
    return [
        ...PIZZA_DATA.groesse,
        ...PIZZA_DATA.teig,
        ...PIZZA_DATA.sosse,
        ...PIZZA_DATA.kaese,
        ...PIZZA_DATA.belag,
        ...(PIZZA_DATA.produkt || [])
    ];
}

function getDailyPizzaFromDB() {
    if (!PIZZA_DATA?.produkt) return null;

    const weekly = PIZZA_DATA.produkt.filter(p => p.kategorieId == 16);
    if (weekly.length === 0) return null;

    const weekday = new Date().getDay(); // 0=So ... 6=Sa
    const sorted = weekly.sort((a, b) => a.id - b.id);

    return sorted[weekday] || sorted[0];
}

function getSeasonPizzaFromDB() {
    if (!PIZZA_DATA?.produkt) return null;

    const seasonal = PIZZA_DATA.produkt.filter(p => p.kategorieId == 17);
    if (seasonal.length === 0) return null;

    const month = new Date().getMonth();
    let season = "Frühling";

    if (month >= 2 && month <= 4) season = "Frühling";
    else if (month >= 5 && month <= 7) season = "Sommer";
    else if (month >= 8 && month <= 10) season = "Herbst";
    else season = "Winter";

    return seasonal.find(p => p.bezeichnung.startsWith(season)) || seasonal[0];
}

/****************************************************
 * 3. Beschreibung → Zutaten IDs
 ****************************************************/
function parseIngredients(desc) {
    if (!desc) return { sauce: null, cheese: [], toppings: [] };

    const parts = desc.split(",").map(x => x.trim().toLowerCase());

    const sauce = PIZZA_DATA.sosse.find(s =>
        parts.includes(s.beschreibung.toLowerCase())
    )?.id || 41;

    const cheese = PIZZA_DATA.kaese
        .filter(k => parts.includes(k.beschreibung.toLowerCase()))
        .map(x => x.id);

    const toppings = PIZZA_DATA.belag
        .filter(b => parts.includes(b.beschreibung.toLowerCase()))
        .map(x => x.id);

    return { sauce, cheese, toppings };
}

function buildPresetFromProduct(p) {
    const ing = parseIngredients(p.details || p.beschreibung);

    return {
        size: 36,
        dough: 39,
        sauce: ing.sauce,
        cheese: ing.cheese,
        toppings: ing.toppings,
        qty: 1
    };
}

/****************************************************
 * 4. Konfigurator UI mit Backend erzeugen (im Konfigurator)
 ****************************************************/
function buildConfiguratorUI() {
    if (!isConfiguratorPage()) return;

    const sizeSelect = document.getElementById("size");
    sizeSelect.innerHTML = "";
    PIZZA_DATA.groesse.forEach(p => {
        sizeSelect.innerHTML += `<option value="${p.id}">${p.beschreibung}</option>`;
    });

    const doughSelect = document.getElementById("dough");
    doughSelect.innerHTML = "";
    PIZZA_DATA.teig.forEach(p => {
        doughSelect.innerHTML += `<option value="${p.id}">${p.beschreibung}</option>`;
    });

    const sauceSelect = document.getElementById("sauce");
    sauceSelect.innerHTML = "";
    PIZZA_DATA.sosse.forEach(p => {
        sauceSelect.innerHTML += `<option value="${p.id}">${p.beschreibung}</option>`;
    });

    const cheeseFieldset = document.querySelectorAll("fieldset")[0];
    cheeseFieldset.innerHTML = `<legend>Käse</legend>`;
    PIZZA_DATA.kaese.forEach(p => {
        cheeseFieldset.innerHTML += `
        <label class="chip">
            <input type="checkbox" class="cheese" value="${p.id}">
            ${p.beschreibung}
        </label>`;
    });

    const toppingsFieldset = document.querySelectorAll("fieldset")[1];
    toppingsFieldset.innerHTML = `<legend>Beläge</legend>`;
    PIZZA_DATA.belag.forEach(p => {
        toppingsFieldset.innerHTML += `
        <label class="chip">
            <input type="checkbox" class="topping" value="${p.id}">
            ${p.beschreibung}
        </label>`;
    });
}

/****************************************************
 * 5. Preset im Konfigurator anwenden
 ****************************************************/
function applyPresetIfExists() {
    if (!isConfiguratorPage()) return;

    const params = new URLSearchParams(window.location.search);
    if (!params.has("preset")) return;

    let product = null;

    if (params.get("preset") === "daily")
        product = getDailyPizzaFromDB();

    if (params.get("preset") === "season")
        product = getSeasonPizzaFromDB();

    if (!product) return;

    const preset = buildPresetFromProduct(product);

    document.getElementById("size").value = preset.size;
    document.getElementById("dough").value = preset.dough;
    document.getElementById("sauce").value = preset.sauce;

    document.querySelectorAll(".cheese").forEach(el => {
        el.checked = preset.cheese.includes(Number(el.value));
    });

    document.querySelectorAll(".topping").forEach(el => {
        el.checked = preset.toppings.includes(Number(el.value));
    });

    updatePriceUI();
}

/****************************************************
 * 6. Index: Tages- & Saisonpizza anzeigen
 ****************************************************/
function euro(v) {
    return v.toFixed(2) + " €";
}

function renderDailyPizzaOnIndex() {
    const el = document.getElementById("daily-special");
    if (!el || !PIZZA_DATA?.produkt) return;

    const p = getDailyPizzaFromDB();
    if (!p) {
        el.textContent = "Keine Pizza des Tages gefunden.";
        return;
    }

    el.innerHTML = `
        <strong>${p.bezeichnung}</strong><br>
        ${p.beschreibung}<br>
        Preis: <strong>${euro(p.nettopreis * 1.19)}</strong><br>
        <a href="configurator.html?preset=daily">Jetzt konfigurieren →</a>
    `;
}

function renderSeasonPizzaOnIndex() {
    const el = document.getElementById("seasonal-special");
    if (!el || !PIZZA_DATA?.produkt) return;

    const p = getSeasonPizzaFromDB();
    if (!p) {
        el.textContent = "Keine Saisonpizza gefunden.";
        return;
    }

    el.innerHTML = `
        <strong>${p.bezeichnung}</strong><br>
        ${p.beschreibung}<br>
        Preis: <strong>${euro(p.nettopreis * 1.19)}</strong><br>
        <a href="configurator.html?preset=season">Jetzt konfigurieren →</a>
    `;
}

/****************************************************
 * 7. Auswahl-State erfassen
 ****************************************************/
function collectState() {
    if (!isConfiguratorPage()) return;

    STATE = {
        size: document.getElementById("size").value,
        dough: document.getElementById("dough").value,
        sauce: document.getElementById("sauce").value,
        cheese: Array.from(document.querySelectorAll(".cheese:checked")).map(n => n.value),
        toppings: Array.from(document.querySelectorAll(".topping:checked")).map(n => n.value),
        qty: parseInt(document.getElementById("qty").value) || 1,
        note: document.getElementById("note").value
    };
}

/****************************************************
 * 8. Preis berechnen
 ****************************************************/
function findProductById(id) {
    id = Number(id);
    return getAllProducts().find(p => p.id === id);
}

function calculatePrice() {
    if (!isConfiguratorPage()) return 0;

    collectState();
    let total = 0;

    total += findProductById(STATE.size)?.bruttopreis || 0;
    total += findProductById(STATE.dough)?.bruttopreis || 0;
    total += findProductById(STATE.sauce)?.bruttopreis || 0;

    STATE.cheese.forEach(id => total += findProductById(id)?.bruttopreis || 0);
    STATE.toppings.forEach(id => total += findProductById(id)?.bruttopreis || 0);

    return total * STATE.qty;
}

function updatePriceUI() {
    if (!isConfiguratorPage()) return;

    const priceEl = document.getElementById("price");
    if (priceEl) priceEl.textContent = euro(calculatePrice());
}

/****************************************************
 * 9. Mini-Warenkorb
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
 * 10. In den Warenkorb legen (gleiche Produkte werden zusammengefasst)
 ****************************************************/
function addToCart() {
    if (!isConfiguratorPage()) return;

    collectState();
    const total = calculatePrice();

    // Neue Pizza (sortierte Arrays für Vergleich)
    const newItem = {
        size: STATE.size,
        dough: STATE.dough,
        sauce: STATE.sauce,
        cheese: [...STATE.cheese].sort(),
        toppings: [...STATE.toppings].sort(),
        qty: STATE.qty,
        note: STATE.note.trim(),
        total: total
    };

    // Prüfen nach identischer Pizza
    const duplicate = CART.find(item =>
        item.size === newItem.size &&
        item.dough === newItem.dough &&
        item.sauce === newItem.sauce &&
        item.note === newItem.note &&
        JSON.stringify(item.cheese) === JSON.stringify(newItem.cheese) &&
        JSON.stringify(item.toppings) === JSON.stringify(newItem.toppings)
    );

    if (duplicate) {
        // wenn ja, Menge erhöhen
        duplicate.qty += newItem.qty;
        duplicate.total += newItem.total;

        // sonst neuen Text erzeugen (inkl. Menge)
        duplicate.text = generatePizzaTextFromObject(duplicate);
    } else {
        // Text einmalig erzeugen
        newItem.text = generatePizzaTextFromObject(newItem);
        CART.push(newItem);
    }

    saveCart();
    renderMiniCart();
}

/****************************************************
 * Hilfsfunktion: Text für zusammengefasste Pizza
 ****************************************************/
function generatePizzaTextFromObject(item) {
    const size = findProductById(item.size)?.beschreibung;
    const dough = findProductById(item.dough)?.beschreibung;
    const sauce = findProductById(item.sauce)?.beschreibung;

    const cheese = item.cheese
        .map(id => findProductById(id)?.beschreibung)
        .join(", ");

    const toppings = item.toppings
        .map(id => findProductById(id)?.beschreibung)
        .join(", ");

    const noteText = item.note
        ? `<br><em>Anmerkung: ${item.note}</em>`
        : "";

    return `${size}, ${dough}, ${sauce}, Käse: ${cheese}, Beläge: ${toppings}${noteText}`;
}


/****************************************************
 * 11. Event-Handler
 ****************************************************/
function attachEventHandlers() {
    if (!isConfiguratorPage()) return;

    const sizeEl = document.getElementById("size");
    const doughEl = document.getElementById("dough");
    const sauceEl = document.getElementById("sauce");
    const qtyEl = document.getElementById("qty");
    const addBtn = document.getElementById("add-to-cart");

    if (sizeEl) sizeEl.addEventListener("change", updatePriceUI);
    if (doughEl) doughEl.addEventListener("change", updatePriceUI);
    if (sauceEl) sauceEl.addEventListener("change", updatePriceUI);
    if (qtyEl) qtyEl.addEventListener("input", updatePriceUI);

    document.querySelectorAll(".cheese, .topping").forEach(el =>
        el.addEventListener("change", updatePriceUI)
    );

    if (addBtn) addBtn.addEventListener("click", addToCart);
}

/****************************************************
 * 12. Warenkorb-Seite rendern
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
            <td>${item.qty}</td>
            <td>${euro(item.total)}</td>
            <td><button class="btn-secondary" data-i="${index}">X</button></td>
        `;
        cartBody.appendChild(tr);
    });

    document.getElementById("cart-net").textContent = euro(net);
    document.getElementById("cart-shipping").textContent = euro(0);
    document.getElementById("cart-subtotal").textContent = euro(net);
    document.getElementById("cart-vat").textContent = euro(net * 0.19);
    document.getElementById("cart-total").textContent = euro(net * 1.19);

    document.querySelectorAll("[data-i]").forEach(btn =>
        btn.addEventListener("click", e => {
            const idx = e.target.dataset.i;
            CART.splice(idx, 1);
            saveCart();
            renderCartPage();
        })
    );
}

/****************************************************
 * 13. Checkout-Button absichern
 ****************************************************/
function protectCheckoutWhenCartEmpty() {
    const checkoutBtn = document.querySelector(".btn-primary.fullwidth");
    if (!checkoutBtn) return;

    checkoutBtn.addEventListener("click", (e) => {
        const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
        if (!currentCart.length) {
            e.preventDefault();
            alert("Ihr Warenkorb ist noch leer.");
        }
    });
}

/****************************************************
 * START
 ****************************************************/
window.addEventListener("DOMContentLoaded", () => {
    loadPizzaConfig();
    renderCartPage();
    protectCheckoutWhenCartEmpty();
    initCheckoutDatetimeLogic(); 
});

/****************************************************
 * im Checkout-Bereich: Lieferzeitpunkt wählen, entweder ASAP oder Datum
 ****************************************************/
function initCheckoutDatetimeLogic() {
    const asapCheckbox = document.getElementById("co-asap");
    const datetimeInput = document.getElementById("co-datetime");

    if (!asapCheckbox || !datetimeInput) return;

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

    asapCheckbox.addEventListener("change", updateState);
    updateState();
}

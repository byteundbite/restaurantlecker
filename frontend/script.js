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

        const nameFeedback = document.getElementById('name-feedback');
        const messageFeedback = document.getElementById('message-feedback');

        // Fehler-Validierung für Name
        if (!name) {
            nameFeedback.className = 'name-feedback error';
            nameFeedback.textContent = '✘ Name ist erforderlich';
        } else {
            nameFeedback.className = 'name-feedback';
            nameFeedback.textContent = '';
        }

        // Fehler-Validierung für Email
        if (!email) {
            emailFeedback.className = 'email-feedback error';
            emailFeedback.textContent = '✘ E-Mail ist erforderlich';
        } else if (!/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            emailFeedback.className = 'email-feedback error';
            emailFeedback.textContent = '✘ E-Mail-Format ist ungültig';
        }

        // Fehler-Validierung für Nachricht
        if (!message) {
            messageFeedback.className = 'message-feedback error';
            messageFeedback.textContent = '✘ Nachricht ist erforderlich';
        } else {
            messageFeedback.className = 'message-feedback';
            messageFeedback.textContent = '';
        }

        if (!name || !email || !message) {
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
                return;
            }

            form.reset();
            // Feedback-Meldungen leeren
            emailFeedback.className = 'email-feedback';
            emailFeedback.textContent = '';
            phoneFeedback.className = 'phone-feedback';
            phoneFeedback.textContent = '';
            nameFeedback.className = 'name-feedback';
            nameFeedback.textContent = '';
            messageFeedback.className = 'message-feedback';
            messageFeedback.textContent = '';
        } catch (err) {
            console.error('Netzwerkfehler beim Senden des Kontaktformulars:', err);
        }
    });
}

/****************************************************
 * 2. DB-Daten zu Tages- & Saisonpizza
 ****************************************************/
const API_BASE = 'http://localhost:8000';
const PENDING_PRESET_KEY = 'pendingPreset';

function normalizeIdList(list) {
    return (list || []).map(x => String(x.id ?? x)).sort();
}

function componentsEqual(a, b) {
    if (!a || !b) return false;
    const same = (x, y) => String(x || '') === String(y || '');
    if (!same(a.sizeId, b.sizeId)) return false;
    if (!same(a.doughId, b.doughId)) return false;
    if (!same(a.sauceId, b.sauceId)) return false;
    if (!same(a.note || '', b.note || '')) return false;

    const cheeseA = normalizeIdList(a.cheeses);
    const cheeseB = normalizeIdList(b.cheeses);
    const toppingA = normalizeIdList(a.toppings);
    const toppingB = normalizeIdList(b.toppings);

    return cheeseA.join('|') === cheeseB.join('|') && toppingA.join('|') === toppingB.join('|');
}

function persistPendingPreset(preset) {
    if (!preset) return;
    try {
        localStorage.setItem(PENDING_PRESET_KEY, JSON.stringify(preset));
    } catch (err) {
        console.error('Preset konnte nicht gespeichert werden:', err);
    }
}

function readPendingPreset() {
    const raw = localStorage.getItem(PENDING_PRESET_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (err) {
        console.error('Preset konnte nicht gelesen werden:', err);
        return null;
    }
}

function clearPendingPreset() {
    localStorage.removeItem(PENDING_PRESET_KEY);
}

/****************************************************
 * 2a. Konfigurator: Komponenten laden & anzeigen
 ****************************************************/
async function fetchConfiguratorComponents() {
    const url = `${API_BASE}/api/konfigurator/komponenten`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || data.fehler) {
        throw new Error(data.nachricht || 'Komponenten konnten nicht geladen werden');
    }

    return data;
}

function formatName(label) {
    if (!label) return '';
    return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatWithPrice(label, price) {
    const suffix = price > 0 ? ` (+${euro(price)})` : ' (inkl.)';
    return `${formatName(label)}${suffix}`;
}

function renderSelectOptions(selectId, items) {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = '';

    items.forEach((item, index) => {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.dataset.price = item.preis;
        opt.textContent = item.beschreibung
            ? `${item.beschreibung} (${formatName(item.bezeichnung)})${item.preis ? ` · +${euro(item.preis)}` : ''}`
            : formatWithPrice(item.bezeichnung, item.preis);
        if (index === 0) opt.selected = true;
        select.appendChild(opt);
    });
}

function renderCheeseOptions(cheeses) {
    const container = document.getElementById('cheese-options');
    if (!container) return;

    container.innerHTML = '';
    if (!cheeses || cheeses.length === 0) {
        container.textContent = 'Keine Käsesorten verfügbar.';
        return;
    }

    cheeses.forEach((c, idx) => {
        const label = document.createElement('label');
        label.className = 'chip';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'cheese';
        input.value = c.id;
        input.dataset.price = c.preis;
        if (idx === 0) input.checked = true;

        label.appendChild(input);
        label.appendChild(document.createTextNode(' ' + formatWithPrice(c.bezeichnung, c.preis)));
        container.appendChild(label);
    });
}

function renderToppingGroups(toppings) {
    const container = document.getElementById('topping-groups');
    if (!container) return;

    container.innerHTML = '';
    if (!toppings || toppings.length === 0) {
        container.textContent = 'Keine Beläge verfügbar.';
        return;
    }

    const meatSea = [];
    const veggie = [];

    toppings.forEach(t => {
        const cat = (t.kategorie || '').toLowerCase();
        if (cat === 'gemuese') {
            veggie.push(t);
        } else {
            meatSea.push(t);
        }
    });

    const addGroup = (title, list) => {
        if (!list.length) return;
        const groupWrapper = document.createElement('div');
        const headline = document.createElement('h3');
        headline.className = 'subtle';
        headline.textContent = title;

        const chips = document.createElement('div');
        chips.className = 'chips';

        list.forEach(t => {
            const label = document.createElement('label');
            label.className = 'chip';

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'topping';
            input.value = t.id;
            input.dataset.price = t.preis;

            label.appendChild(input);
            label.appendChild(document.createTextNode(' ' + formatWithPrice(t.bezeichnung, t.preis)));
            chips.appendChild(label);
        });

        groupWrapper.appendChild(headline);
        groupWrapper.appendChild(chips);
        container.appendChild(groupWrapper);
    };

    addGroup('Fleisch & Meeresfrüchte', meatSea);
    addGroup('Vegetarisch', veggie);
}

function getComponentById(list, id) {
    return list.find(item => String(item.id) === String(id));
}

function calculateConfiguratorNet() {
    if (!STATE.configComponents) return 0;

    const sizeSel = document.getElementById('size');
    const doughSel = document.getElementById('dough');
    const sauceSel = document.getElementById('sauce');

    const size = getComponentById(STATE.configComponents.groessen, sizeSel?.value);
    const dough = getComponentById(STATE.configComponents.teig, doughSel?.value);
    const sauce = getComponentById(STATE.configComponents.sosse, sauceSel?.value);

    let total = 0;
    total += size ? Number(size.preis) : 0;
    total += dough ? Number(dough.preis) : 0;
    total += sauce ? Number(sauce.preis) : 0;

    document.querySelectorAll('#cheese-options input.cheese:checked').forEach(el => {
        total += Number(el.dataset.price || 0);
    });

    document.querySelectorAll('#topping-groups input.topping:checked').forEach(el => {
        total += Number(el.dataset.price || 0);
    });

    return total;
}

function updateConfiguratorPrice() {
    const priceEl = document.getElementById('price');
    if (!priceEl) return;

    const qtyInput = document.getElementById('qty');
    const qty = Math.max(1, parseInt(qtyInput?.value || '1', 10));
    const perPizza = calculateConfiguratorNet();
    const total = perPizza * qty;

    if (qtyInput) qtyInput.value = qty;
    priceEl.textContent = euro(total);
}

function buildConfiguratorSummary() {
    if (!STATE.configComponents) return '';
    const size = getComponentById(STATE.configComponents.groessen, document.getElementById('size')?.value);
    const dough = getComponentById(STATE.configComponents.teig, document.getElementById('dough')?.value);
    const sauce = getComponentById(STATE.configComponents.sosse, document.getElementById('sauce')?.value);
    const cheeses = Array.from(document.querySelectorAll('#cheese-options input.cheese:checked')).map(el => getComponentById(STATE.configComponents.kaese, el.value)?.bezeichnung || el.value);
    const toppings = Array.from(document.querySelectorAll('#topping-groups input.topping:checked')).map(el => getComponentById(STATE.configComponents.belag, el.value)?.bezeichnung || el.value);
    const note = document.getElementById('note')?.value.trim();

    const parts = [
        size ? `Größe: ${formatName(size.bezeichnung)}` : null,
        dough ? `Teig: ${formatName(dough.bezeichnung)}` : null,
        sauce ? `Soße: ${formatName(sauce.bezeichnung)}` : null,
        cheeses.length ? `Käse: ${cheeses.map(formatName).join(', ')}` : null,
        toppings.length ? `Beläge: ${toppings.map(formatName).join(', ')}` : null,
        note ? `Notiz: ${note}` : null
    ].filter(Boolean);

    return parts.join(' | ');
}

async function initConfiguratorPage() {
    const addBtn = document.getElementById('add-to-cart');
    if (!addBtn) return; // wir sind nicht auf configurator.html

    function resetConfiguratorForm() {
        ['size', 'dough', 'sauce'].forEach(id => {
            const el = document.getElementById(id);
            if (el && el.options.length) {
                el.selectedIndex = 0;
            }
        });

        document.querySelectorAll('#cheese-options input.cheese, #topping-groups input.topping').forEach(cb => {
            cb.checked = false;
        });

        const qtyInput = document.getElementById('qty');
        if (qtyInput) qtyInput.value = 1;

        const noteEl = document.getElementById('note');
        if (noteEl) noteEl.value = '';

        updateConfiguratorPrice();
    }

    function addCurrentSelectionToCart(options = {}) {
        const qtyInput = document.getElementById('qty');
        const qty = Math.max(1, parseInt((options.qtyOverride ?? qtyInput?.value) || '1', 10));
        if (qtyInput) qtyInput.value = qty;

        const perPizza = calculateConfiguratorNet();
        const total = perPizza * qty;
        const summary = buildConfiguratorSummary();
        const baseLabel = (options.labelOverride || '').trim();
        const textLabel = baseLabel && summary
            ? `${baseLabel} – ${summary}`
            : (baseLabel || summary || 'Individuelle Pizza');

        const sizeEl = document.getElementById('size');
        const doughEl = document.getElementById('dough');
        const sauceEl = document.getElementById('sauce');
        const hasSelection = sizeEl?.value && doughEl?.value && sauceEl?.value;

        if (!hasSelection) {
            if (options.showAlert !== false) {
                alert('Bitte wähle zunächst deine Komponenten.');
            }
            return false;
        }

        const cheeses = Array.from(document.querySelectorAll('.cheese:checked')).map(ch => ({
            id: ch.value,
            bezeichnung: ch.parentElement.textContent.trim()
        }));

        const toppings = Array.from(document.querySelectorAll('.topping:checked')).map(top => ({
            id: top.value,
            bezeichnung: top.parentElement.textContent.trim()
        }));

        const note = document.getElementById('note')?.value.trim() || '';

        const newItem = {
            text: textLabel,
            qty,
            total,
            components: {
                sizeId: sizeEl.value,
                doughId: doughEl.value,
                sauceId: sauceEl.value,
                cheeses,
                toppings,
                note
            }
        };

        const existing = CART.find(item => componentsEqual(item.components, newItem.components));
        if (existing) {
            existing.qty += qty;
            existing.total += perPizza * qty;
        } else {
            CART.push(newItem);
        }
        saveCart();
        renderMiniCart();

        if (options.reset !== false) {
            resetConfiguratorForm();
        }
        return true;
    }

    function setCheckedValues(selector, values) {
        const set = new Set((values || []).map(v => String(v)));
        document.querySelectorAll(selector).forEach(cb => {
            cb.checked = set.has(String(cb.value));
        });
    }

    function applyConfiguratorSelectionsFromConfig(config) {
        if (!config) return false;

        const setSelectValue = (id, value) => {
            if (value === undefined || value === null) return;
            const el = document.getElementById(id);
            if (!el) return;
            const exists = Array.from(el.options).some(opt => String(opt.value) === String(value));
            if (exists) {
                el.value = String(value);
            }
        };

        setSelectValue('size', config.groesse);
        setSelectValue('dough', config.teig);
        setSelectValue('sauce', config.sosse);

        const cheeseValues = Array.isArray(config.kaese)
            ? config.kaese
            : (config.kaese || config.kaese === 0 ? [config.kaese] : []);
        const toppingValues = Array.isArray(config.belaege) ? config.belaege : [];

        setCheckedValues('.cheese', cheeseValues);
        setCheckedValues('.topping', toppingValues);

        updateConfiguratorPrice();
        return true;
    }

    function applyPendingPresetOnConfigurator() {
        const pending = readPendingPreset();
        if (!pending || !pending.config) return;

        const qtyInput = document.getElementById('qty');
        if (pending.qty && qtyInput) qtyInput.value = pending.qty;

        const applied = applyConfiguratorSelectionsFromConfig(pending.config);
        if (!applied) {
            clearPendingPreset();
            return;
        }

        updateConfiguratorPrice();
        const label = pending.title || 'Empfehlung';
        const added = addCurrentSelectionToCart({
            labelOverride: label,
            qtyOverride: pending.qty || 1,
            showAlert: false,
            reset: false
        });

        if (added) {
            clearPendingPreset();
        }
    }

    const priceEl = document.getElementById('price');

    try {
        const components = await fetchConfiguratorComponents();
        STATE.configComponents = components;

        renderSelectOptions('size', components.groessen || []);
        renderSelectOptions('dough', components.teig || []);
        renderSelectOptions('sauce', components.sosse || []);
        renderCheeseOptions(components.kaese || []);
        renderToppingGroups(components.belag || []);

        ['size', 'dough', 'sauce', 'qty'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('change', updateConfiguratorPrice);
            el.addEventListener('input', updateConfiguratorPrice);
        });

        document.getElementById('cheese-options')?.addEventListener('change', updateConfiguratorPrice);
        document.getElementById('topping-groups')?.addEventListener('change', updateConfiguratorPrice);

        addBtn.addEventListener('click', () => {
            addCurrentSelectionToCart();
        });

        updateConfiguratorPrice();
    } catch (err) {
        console.error('Konfigurator konnte nicht initialisiert werden:', err);
        if (priceEl) priceEl.textContent = 'Fehler';
        const noteEl = document.querySelector('.configurator');
        if (noteEl) {
            const msg = document.createElement('p');
            msg.className = 'error';
            msg.textContent = 'Konfigurator-Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.';
            noteEl.prepend(msg);
        }
    }
}

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
            <a href="#" id="daily-link" class="recommendation-link" aria-label="Pizza des Tages im Konfigurator öffnen">${p.bezeichnung}</a><br>
            ${p.beschreibung}<br>
            Preis: <strong>${euro(p.netto_preis)}</strong> zzgl. MwSt.
        `;

        const config = parseRecommendationConfig(p.konfiguration_json);
        bindRecommendationCard('daily-link', {
            title: p.bezeichnung,
            description: p.beschreibung,
            netPrice: p.netto_preis,
            config,
            source: 'daily'
        });
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
            <a href="#" id="season-link" class="recommendation-link" aria-label="Saisonpizza im Konfigurator öffnen">${p.bezeichnung}</a><br>
            ${p.beschreibung}<br>
            Preis: <strong>${euro(p.netto_preis)}</strong> zzgl. MwSt.
        `;

        const config = parseRecommendationConfig(p.konfiguration_json);
        bindRecommendationCard('season-link', {
            title: p.bezeichnung,
            description: p.beschreibung,
            netPrice: p.netto_preis,
            config,
            source: 'seasonal'
        });
    }
    load();
}

function parseRecommendationConfig(raw) {
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (err) {
        console.error('Empfehlungskonfiguration konnte nicht geparst werden:', err);
        return null;
    }
}

async function loadConfiguratorComponentsIfNeeded() {
    if (STATE.configComponents) return STATE.configComponents;
    try {
        const components = await fetchConfiguratorComponents();
        STATE.configComponents = components;
        return components;
    } catch (err) {
        console.error('Komponenten konnten nicht geladen werden:', err);
        return null;
    }
}

function buildSummaryFromConfig(config, components) {
    if (!config || !components) return '';

    const getComponentName = (list, id) => {
        const item = (list || []).find(x => String(x.id) === String(id));
        return item ? formatName(item.bezeichnung) : '';
    };

    const size = getComponentName(components.groessen, config.groesse);
    const dough = getComponentName(components.teig, config.teig);
    const sauce = getComponentName(components.sosse, config.sosse);

    const cheeseIds = Array.isArray(config.kaese) ? config.kaese : (config.kaese || config.kaese === 0 ? [config.kaese] : []);
    const cheeses = cheeseIds.map(id => getComponentName(components.kaese, id)).filter(Boolean);

    const toppingIds = config.belaege || [];
    const toppings = toppingIds.map(id => getComponentName(components.belag, id)).filter(Boolean);

    const parts = [
        size ? `Größe: ${size}` : null,
        dough ? `Teig: ${dough}` : null,
        sauce ? `Soße: ${sauce}` : null,
        cheeses.length ? `Käse: ${cheeses.join(', ')}` : null,
        toppings.length ? `Beläge: ${toppings.join(', ')}` : null
    ].filter(Boolean);

    return parts.join(' | ');
}

async function addRecommendationToCart(preset) {
    if (!preset || !preset.config) return false;

    const config = preset.config;
    const label = preset.title || 'Empfehlung';

    let components = STATE.configComponents;
    if (!components) {
        components = await loadConfiguratorComponentsIfNeeded();
    }

    let summary = '';
    if (components) {
        summary = buildSummaryFromConfig(config, components);
    }

    const textLabel = summary ? `${label} – ${summary}` : label;

    const cheeseIds = Array.isArray(config.kaese) ? config.kaese : (config.kaese || config.kaese === 0 ? [config.kaese] : []);
    const toppingIds = config.belaege || [];

    const cheeses = cheeseIds.map(id => ({
        id,
        bezeichnung: `Käse ${id}`
    }));

    const toppings = toppingIds.map(id => ({
        id,
        bezeichnung: `Belag ${id}`
    }));

    // Netto-Preis aus der DB verwenden; MwSt. wird erst im Checkout addiert
    const netTotal = preset.netPrice;

    const newItem = {
        text: textLabel,
        qty: 1,
        total: netTotal,
        components: {
            sizeId: config.groesse,
            doughId: config.teig,
            sauceId: config.sosse,
            cheeses,
            toppings,
            note: ''
        }
    };

    const existing = CART.find(item => componentsEqual(item.components, newItem.components));
    if (existing) {
        existing.qty += 1;
        existing.total += netTotal;
    } else {
        CART.push(newItem);
    }
    
    saveCart();
    renderMiniCart();

    window.location.href = 'configurator.html';
    return true;
}

function bindRecommendationCard(cardId, preset) {
    if (!preset || !preset.config) return;
    const card = document.getElementById(cardId);
    if (!card) return;

    const addToCart = (evt) => {
        if (evt) evt.preventDefault();
        addRecommendationToCart(preset);
    };

    card.addEventListener('click', addToCart);
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            addToCart();
        }
    });
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

    CART.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "mini-cart-item";
        li.innerHTML = `
            <div class="mini-cart-item-info">
                <span>${item.qty}× ${item.text}</span>
                <strong>${euro(item.total)}</strong>
            </div>
            <div class="mini-cart-item-actions">
                <button class="btn-icon" data-action="decrease" data-index="${index}" title="Menge verringern" aria-label="Menge verringern">−</button>
                <button class="btn-icon" data-action="increase" data-index="${index}" title="Menge erhöhen" aria-label="Menge erhöhen">+</button>
                <button class="btn-icon btn-icon-danger" data-action="remove" data-index="${index}" title="Entfernen" aria-label="Entfernen">×</button>
            </div>
        `;
        
        // Event-Handler für die Buttons
        li.querySelector('[data-action="decrease"]').addEventListener('click', () => {
            if (item.qty > 1) {
                const unitPrice = item.total / item.qty;
                item.qty--;
                item.total = unitPrice * item.qty;
                saveCart();
                renderMiniCart();
            }
        });
        
        li.querySelector('[data-action="increase"]').addEventListener('click', () => {
            const unitPrice = item.total / item.qty;
            item.qty++;
            item.total = unitPrice * item.qty;
            saveCart();
            renderMiniCart();
        });
        
        li.querySelector('[data-action="remove"]').addEventListener('click', () => {
            CART.splice(index, 1);
            saveCart();
            renderMiniCart();
        });
        
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
 * 5b. Checkout-Formular: Echtzeit-Validierung für Email & Telefon
 ****************************************************/
function initCheckoutFormValidation() {
    const emailInput = document.getElementById('co-email');
    const emailFeedback = document.getElementById('co-email-feedback');
    const phoneInput = document.getElementById('co-phone');
    const phoneFeedback = document.getElementById('co-phone-feedback');

    if (!emailInput || !emailFeedback || !phoneInput || !phoneFeedback) return;

    // Email-Validierung
    const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    emailInput.addEventListener('input', () => {
        const email = emailInput.value.trim();
        emailFeedback.className = 'email-feedback';
        emailFeedback.textContent = '';

        if (email.length === 0) {
            return;
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

    // Telefon-Validierung
    const mobileRegex = /^(\+49|0049|0)?\s*1[0-9]{1,3}\s*[0-9\s\-\/]{6,}$/;
    const landlineRegex = /^(\+49|0049|0)?\s*[2-9][0-9]{1,4}\s*[0-9\s\-\/]{6,}$/;

    phoneInput.addEventListener('input', () => {
        const phone = phoneInput.value.trim();
        phoneFeedback.className = 'phone-feedback';
        phoneFeedback.textContent = '';

        if (phone.length === 0) {
            return;
        }

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

        if (mobileRegex.test(phone)) {
            phoneFeedback.className = 'phone-feedback success';
            phoneFeedback.textContent = '✓ Gültige Mobilnummer erkannt';
            return;
        }

        if (landlineRegex.test(phone)) {
            phoneFeedback.className = 'phone-feedback success';
            phoneFeedback.textContent = '✓ Gültige Festnetznummer erkannt';
            return;
        }

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
 * 7. Bestellung abschließen (an Backend senden)
 ****************************************************/
async function completeOrder() {
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

    const orderData = {
        kunde: { name, street, zip, city, phone, email },
        items: cart,
        net: sumNet,
        shipping: shippingNet,
        vat: vatAmount,
        total: grossTotal,
        deliveryText,
        asap,
        deliveryDateTime: dtVal || null,
        orderNote: note
    };

    try {
        const response = await fetch(`${API_BASE}/api/bestellung`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (!response.ok || data.fehler) {
            console.error('Fehler bei der Bestellabsendung:', data);
            alert('Fehler beim Absenden der Bestellung: ' + (data.nachricht || 'Unbekannter Fehler'));
            return;
        }

        // Erfolgreich: Speichere die Zusammenfassung und leere den Warenkorb
        localStorage.setItem("lastOrderSummary", JSON.stringify(orderData));
        localStorage.removeItem("cart");
        window.location.href = "thankyou.html";
    } catch (err) {
        console.error('Netzwerkfehler beim Absenden der Bestellung:', err);
        alert('Netzwerkfehler beim Absenden der Bestellung. Bitte versuchen Sie es erneut.');
    }
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
    initConfiguratorPage();
    renderCartPage();
    protectCheckoutWhenCartEmpty();
    initCheckoutDatetimeLogic();
    initCheckoutFormValidation();
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

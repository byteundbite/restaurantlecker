# Byte&Bite — restaurantlecker

Dieses README fasst die Projektstruktur zusammen und beschreibt welche Frontend-Seiten an welche Backend-Services angebunden.

---

## Schnellstart

- Voraussetzungen: `node` (empfohlen Node 22.3.0), `npm`
- Backend starten:

```powershell
cd .\restaurantlecker\Backend
npm install
npm start
```

- Entwicklung mit `nodemon`:

```powershell
npm run dev
```

Frontend ist statisch und wird vom Express-Server unter `http://127.0.0.1:8000/` bereitgestellt.

---

## Wichtige Pfade (Übersicht)

- Root: Projektordner
  - `Backend/` – Node/Express Backend, DB, Services, DAOs
  - `frontend/` – HTML/CSS/JS Seiten und Assets

### Backend (wichtigste Dateien)

- `Backend/server.js` — Hauptserver: Middleware, statische Bereitstellung des Frontends, Bindung aller Services (z. B. `pizzaconfig`, `bestellung`, `contact`, u.v.m.). Legt bei Start die Tabelle `Kontakt` an, falls noch nicht vorhanden.
- `Backend/helper.js` — Hilfsfunktionen (Validierung, Datumsformatierung, etc.).
- `Backend/fileHelper.js` — Hilfsfunktionen für Datei-Uploads.
- `Backend/package.json` — Abhängigkeiten und Start-Skripte.
- `Backend/db/webanw2.sqlite` — SQLite Datenbank (wird vom Server verwendet).

DAO-Verzeichnis (`Backend/dao/`): Klassen für DB-Zugriff (z. B. `personDao.js`, `produktDao.js`, `contactDao.js`).

Service-Verzeichnis (`Backend/services/`): Express-Router für verschiedene API-Ressourcen (z. B. `bestellung.js`, `produkt.js`, `pizzaconfig.js`, `contact.js`, etc.).

### Frontend (wichtigste Dateien)

- `frontend/index.html` — Startseite; zeigt Pizza des Tages / Saisonpizza.
- `frontend/configurator.html` — Konfigurator, baut UI für Auswahl (Größe, Teig, Soße, Käse, Belag) und legt Artikel in LocalStorage Warenkorb.
- `frontend/contact.html` — Kontaktformular.
- `frontend/cart.html` — Warenkorb-Ansicht (lokal, ohne direkte Backend-Interaktion).
- `frontend/checkout.html` — Checkout-Formular; sendet Bestellung an Backend.
- `frontend/thankyou.html` — Danke-Seite; zeigt lokale Zusammenfassung.
- `frontend/script.js` — zentrale Frontend-Logik: lädt `/api/pizzaconfig/load`, verarbeitet Warenkorb, Kontaktformular, Checkout-Logik.
- `frontend/style.css` — Styles.

---

## Welche Frontend-Seiten sind mit dem Backend verbunden?

Die wichtigsten Verbindungen (Frontend → Backend):

- `index.html`
  - Verwendet `frontend/script.js` → ruft `GET /api/pizzaconfig/load` zum Laden der Konfigurations- und Produktdaten (für `#daily-special` und `#seasonal-special`).

- `configurator.html`
  - Die Selects und Checkboxen (`#size`, `#dough`, `#sauce`, `.cheese`, `.topping`) werden mit Daten aus `GET /api/pizzaconfig/load` befüllt.
  - Preis-/Warenkorb-Logik ist lokal (LocalStorage). Die Seite selbst ruft kein Write-Endpoint auf.

- `contact.html`
  - Formular `#contact-form` sendet `POST` an `/api/contact` (via `initContactForm()` in `frontend/script.js`).
  - Übertragene Felder: `name` (`#c-name`), `phone` (`#c-phone`), `email` (`#c-email`), `message` (`#c-msg`).
  - Backend schreibt Einträge in die DB-Tabelle `Kontakt`.

- `cart.html`
  - Nur Frontend/UI; zeigt LocalStorage Warenkorb; keine direkte API-Interaktion.

- `checkout.html`
  - Formular `#checkout-form` wird clientseitig geprüft und dann `POST /api/bestellung` aufgerufen (Payload wird in `frontend/script.js` erzeugt und enthält `bestellpositionen` aus LocalStorage sowie `zahlungsart`, optional `besteller`-Daten).

- `thankyou.html`, `about.html`, `legal.html`
  - Statisch / nur UI; `script.js` wird geladen, aber es gibt keine zusätzlichen API-POSTs auf diesen Seiten.

---

## Übersicht der derzeit im Backend gebundenen Services

`Backend/server.js` bindet beim Start die folgenden Services (jeweils als Router unter `/api`):

- `land` — (z. B. `/api/land/...`)
- `bestellung` — verwendet vom Checkout (`POST /api/bestellung`) (Frontend: `checkout.html`)
- `pizzaconfig` — liefert Konfigurationsdaten für Konfigurator/Index (`GET /api/pizzaconfig/load`) (Frontend: `index.html`, `configurator.html`)
- `contact` — neu: `POST /api/contact` (Frontend: `contact.html`)

Hinweis: Die Services sind unter `/api/<servicename>/...` erreichbar; die Implementierung (Methoden/URLs) steht in den jeweiligen Dateien unter `Backend/services/`.

---

## Tabelle `Kontakt` (DB)

Wird beim Serverstart geprüft/erstellt (siehe `server.js`). Schema (vereinfacht):

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `name` TEXT
- `telefon` TEXT
- `email` TEXT
- `nachricht` TEXT
- `erstellzeitpunkt` TEXT (SQL-Datetime-String)

Die DAO `Backend/dao/contactDao.js` bietet eine `create(...)`-Methode zum Einfügen.

---

## Beispielanfragen / Tests

- Kontakt absenden (PowerShell):

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/contact' -Method POST -ContentType 'application/json' -Body (@{name='Max Mustermann'; phone='+49 123'; email='max@example.com'; message='Testnachricht'} | ConvertTo-Json)
```

- Kontakt absenden (curl):

```bash
curl -X POST http://127.0.0.1:8000/api/contact -H "Content-Type: application/json" -d '{"name":"Max","phone":"123","email":"max@example.com","message":"Test"}'
```

- Pizza-Konfiguration laden:

```bash
curl http://127.0.0.1:8000/api/pizzaconfig/load
```

- Bestellung anlegen (Beispiel-Payload):

```bash
curl -X POST http://127.0.0.1:8000/api/bestellung -H "Content-Type: application/json" -d '{"zahlungsart":{"id":1},"bestellpositionen":[{"produkt":{"id":302},"menge":1}] }'
```

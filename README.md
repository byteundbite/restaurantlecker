# Restaurant Lecker – Pizzakonfigurator

Eine Full-Stack-Webanwendung für die Konfiguration und Bestellung von Pizzen mit lokalem Warenkorb (LocalStorage) und vollständiger Backend-Bestellabwicklung inkl. Datenbankpersistierung.

**Entwickelt von:** Maximilian Svabensky, Thomas Scharkowski, Jan Umblia  
**Stack:** Node.js (Express) Backend, vanilla HTML/CSS/JavaScript Frontend, SQLite Datenbank  
**Version:** 4.0 – Backend Version 4.5.0

---

## 📋 Inhaltsverzeichnis

1. [Schnellstart](#schnellstart)
2. [Projektstruktur](#projektstruktur)
3. [Backend](#backend)
4. [Frontend](#frontend)
5. [API-Übersicht](#api-übersicht)
6. [Datenbankschema](#datenbankschema)
7. [Entwicklung](#entwicklung)

---

## Schnellstart

### Voraussetzungen
- **Node.js** 22.3.0 oder höher
- **npm** (mit Node.js installiert)
- SQLite (automatisch über `better-sqlite3`)

### Backend starten

```powershell
cd .\Backend
npm install
npm start
```

Das Backend läuft dann unter `http://localhost:8000` und serviert gleichzeitig die Frontend-Dateien.

### Entwicklung mit automatischem Reload

```powershell
npm run dev
```

Dies verwendet `nodemon` zur Überwachung von Dateiänderungen.

---

## Projektstruktur

```
restaurantlecker/
├── Backend/
│   ├── server.js                  # Express Server & Haupteinstieg (inkl. TIMEZONE-Konstante)
│   ├── helper.js                  # Utility-Funktionen
│   ├── package.json               # Dependencies & Scripts
│   ├── db/
│   │   ├── byteundbite.sqlite    # SQLite Datenbank (wird beim Start angelegt)
│   │   ├── Create_Table_Statements.sql
│   │   └── Insert_Statements.sql
│   ├── services/                  # Express Router (API-Endpoints)
│   │   ├── konfigurator.js        # GET /api/konfigurator/*
│   │   ├── bestellung.js          # POST /api/bestellung (Bestellabwicklung)
│   │   ├── kontakt.js             # POST /api/kontakt
│   │   ├── tagespizza.js          # GET /api/tagespizza
│   │   └── saisonpizza.js         # GET /api/saisonpizza
│   └── dao/                       # Data Access Objects (DB-Abfragen)
│       ├── konfiguratorDao.js     # Pizza-Komponenten laden
│       ├── bestellungDao.js       # Bestellungen & Positionen speichern
│       ├── kontaktDao.js          # Kontaktanfragen verwalten
│       ├── tagespizzaDao.js       # Tages-Pizzas verwalten
│       └── saisonpizzaDao.js      # Saisonpizzas verwalten
├── frontend/
│   ├── index.html                 # Startseite (Tages- & Saisonpizza)
│   ├── configurator.html          # Pizza-Konfigurator
│   ├── contact.html               # Kontaktformular
│   ├── cart.html                  # Warenkorb-Übersicht
│   ├── checkout.html              # Bestellung abschließen
│   ├── thankyou.html              # Bestellbestätigung
│   ├── about.html                 # Über uns
│   ├── legal.html                 # Impressum / AGB
│   ├── script.js                  # Zentrale Frontend-Logik
│   ├── style.css                  # Styling
│   └── img/                        # Bilder & Assets
└── README.md                      # Diese Datei
```

---

## Backend

### Server-Struktur (`server.js`)

Die `server.js` ist der Einstiegspunkt und konfiguriert:

- **Express-Middleware**: CORS, Body Parser, File Upload, Morgan Logging
- **Statische Dateien**: Serviert Frontend-Dateien aus dem `frontend/` Ordner
- **Datenbank**: SQLite Verbindung zur `byteundbite.sqlite`
- **Service-Router**: Bindet alle Services unter dem Prefix `/api/` ein
- **Zeitzone**: Zentrale `TIMEZONE`-Konstante (`'Europe/Berlin'`) für alle Timestamps

Die Datenbank-Verbindung und Zeitzone werden in `app.locals` gespeichert und sind allen Services verfügbar:
- `app.locals.dbConnection` — SQLite Verbindung
- `app.locals.timezone` — Zeitzone für Bestellnummern und Timestamps

### Hilfsfunktionen (`helper.js`)

Enthält Utility-Funktionen für:
- Typ-Prüfungen (`isUndefined`, `isNull`, `isNumeric`, `isArray`, `isObject`)
- String-Validierungen (`isEmail`, `isPhoneNumber`, etc.)

### DAOs (Data Access Objects)

**Datenzugriff-Klassen** für strukturierten DB-Zugriff über prepared statements:

| DAO | Tabelle(n) | Hauptmethoden |
|-----|-----------|---------------|
| `KonfiguratorDao` | Groesse, Teig, Sosse, Belag, Kaese, Konfiguration | `loadAllGroessen()`, `loadAllTeig()`, `loadAllSosse()`, `loadAllBelag()`, `loadAllKaese()`, `createKonfiguration()` |
| `BestellungDao` | Bestellung, Bestellposition, Konfiguration | `createOrder()`, `getOrderById()`, `getOrdersByCustomerEmail()`, `generateBestellnummer()` |
| `TagespizzaDao` | TagesPizza, Konfiguration | `loadAll()`, `loadById()`, `loadByTag()` |
| `SaisonpizzaDao` | SaisonPizza, Konfiguration | `loadAll()`, `loadById()`, `loadBySaison()` |
| `KontaktDao` | Kontakt | `loadAll()`, `create()` |

### Services (API-Endpoints)

**Express Router** unter `/api/<servicename>/`:

#### `konfigurator.js`

```
GET  /api/konfigurator/komponenten   → Alle Komponenten (Größen, Teige, etc.)
GET  /api/konfigurator/groessen      → Alle Größen
GET  /api/konfigurator/teig          → Alle Teigvarianten
GET  /api/konfigurator/sosse         → Alle Saucen
GET  /api/konfigurator/belag         → Alle Beläge
GET  /api/konfigurator/kaese         → Alle Käsesorten
POST /api/konfigurator/konfiguration → Neue Konfiguration speichern (Admin)
```

#### `bestellung.js`

```
POST /api/bestellung                 → Neue Bestellung erstellen
GET  /api/bestellung/:orderId        → Bestelldetails abrufen
GET  /api/bestellung/kunde/:email    → Alle Bestellungen eines Kunden
```

**POST /api/bestellung Payload:**
```json
{
  "kunde": {
    "name": "Max Mustermann",
    "street": "Musterstraße 1",
    "zip": "12345",
    "city": "Berlin",
    "email": "max@example.com",
    "phone": "+49 123 456789"
  },
  "items": [
    {
      "text": "Größe: M | Teig: Klassisch | Soße: Tomaten",
      "qty": 2,
      "total": 25.00,
      "components": {
        "sizeId": "2",
        "doughId": "1",
        "sauceId": "1",
        "cheeses": [{"id": "1", "bezeichnung": "Mozzarella"}],
        "toppings": [{"id": "5", "bezeichnung": "Salami"}],
        "note": ""
      }
    }
  ],
  "orderNote": "Bitte klingeln",
  "asap": true,
  "deliveryDateTime": null,
  "net": 25.00,
  "shipping": 2.00,
  "vat": 5.13,
  "total": 32.13
}
```

#### `kontakt.js`

```
GET  /api/kontakt/alle               → Alle Kontaktanfragen (Admin)
POST /api/kontakt                    → Neue Kontaktanfrage (Anfrage-Validierung, DB-INSERT)
```

**POST Payload:**
```json
{
  "name": "Max Mustermann",
  "email": "max@example.com",
  "phone": "+49 123 456789",
  "message": "Ich hätte gerne..."
}
```

#### `tagespizza.js`

```
GET  /api/tagespizza/alle            → Alle Tagespizzas
GET  /api/tagespizza/gib/:id         → Tagespizza nach ID
GET  /api/tagespizza/tag/:tag        → Tagespizza nach Wochentag (z.B. Montag)
```

#### `saisonpizza.js`

```
GET  /api/saisonpizza/alle           → Alle Saisonpizzas
GET  /api/saisonpizza/gib/:id        → Saisonpizza nach ID
GET  /api/saisonpizza/saison/:saison → Saisonpizza nach Saison (Winter, Frühling, Sommer, Herbst)
```

---

## Frontend

### Seiten & ihre Backend-Verbindung

| Seite | Datei | Backend-Verbindung | Funktion |
|-------|-------|-------------------|----------|
| Startseite | `index.html` | `GET /api/tagespizza/tag/:tag`<br>`GET /api/saisonpizza/saison/:saison` | Zeigt Pizza des Tages & Saisonpizza |
| Konfigurator | `configurator.html` | `GET /api/konfigurator/komponenten` | UI für Pizza-Konfiguration mit Live-Preisberechnung;<br>Speichert Komponenten-IDs im LocalStorage |
| Kontakt | `contact.html` | `POST /api/kontakt` | Kontaktformular mit Echtzeit-Validierung (E-Mail, Telefon) |
| Warenkorb | `cart.html` | — | Warenkorb-Übersicht aus LocalStorage;<br>Mengen anpassen, Positionen entfernen |
| Checkout | `checkout.html` | `POST /api/bestellung` | Kundendaten erfassen & Bestellung absenden;<br>Items mit Komponenten-IDs an Backend |
| Danke | `thankyou.html` | — | Bestellbestätigung mit Zusammenfassung aus LocalStorage |
| Über uns | `about.html` | — | Statische Info-Seite |
| Impressum | `legal.html` | — | Statische Info-Seite |

### Script & Logik (`script.js`)

Zentrale JavaScript-Datei mit:

- **Initialisierung**: `initApp()` — Lädt Warenkorb, rendert Pizzas
- **Konfigurationsladung**: `fetchConfiguratorComponents()` — Ruft API auf, füllt Select-Optionen
- **Warenkorb-Management**: 
  - `addToCart()` — Speichert Pizza mit **Komponenten-IDs** (sizeId, doughId, sauceId, cheeses, toppings, note)
  - `loadCartFromStorage()`, `saveCart()` — LocalStorage-Verwaltung
  - `renderMiniCart()`, `renderCartPage()` — Warenkorb-Anzeige
- **Preisberechnung**: `calculateConfiguratorNet()` — Live-Berechnung basierend auf Komponentenpreisen
- **Validierung**: E-Mail und Telefonnummer mit Echtzeit-Feedback (Regex-Pattern)
- **Checkout**: `completeOrder()` — Validiert Kundendaten & sendet **komplette Bestellung** (inkl. Komponenten) an `/api/bestellung`
- **Kontaktformular**: `initContactForm()` — Feldvalidierung & Submit

**LocalStorage-Keys:**
- `cart` — JSON-Array der Bestellpositionen mit Komponenten
  ```json
  [
    {
      "text": "Größe: M | Teig: Klassisch | ...",
      "qty": 2,
      "total": 25.00,
      "components": {
        "sizeId": "2",
        "doughId": "1",
        "sauceId": "1",
        "cheeses": [...],
        "toppings": [...],
        "note": ""
      }
    }
  ]
  ```
- `lastOrderSummary` — Bestellzusammenfassung für Thank-You-Seite

### Styling (`style.css`)

Responsive Design mit modernem CSS. Unterstützt Mobile & Desktop.

---

## API-Übersicht

### Base URL
```
http://localhost:8000/api
```

### Response Format

Erfolgreiche Anfragen:
```json
{
  "fehler": false,
  "nachricht": "Erfolgreich",
  "data": { ... }
}
```

Fehlerhafte Anfragen:
```json
{
  "fehler": true,
  "nachricht": "Fehlermeldung"
}
```

---

## Datenbankschema

Die SQLite Datenbank `byteundbite.sqlite` muss vor dem ersten Start existieren. Schema und Beispieldaten können mit den SQL-Dateien initialisiert werden. Haupttabellen:

### Konfigurationskomponenten

```sql
CREATE TABLE Groesse (id INTEGER PRIMARY KEY, bezeichnung TEXT, preis REAL, beschreibung TEXT);
CREATE TABLE Teig (id INTEGER PRIMARY KEY, bezeichnung TEXT, preis REAL, beschreibung TEXT);
CREATE TABLE Sosse (id INTEGER PRIMARY KEY, bezeichnung TEXT, preis REAL, beschreibung TEXT);
CREATE TABLE Belag (id INTEGER PRIMARY KEY, bezeichnung TEXT, preis REAL, kategorie TEXT, beschreibung TEXT);
CREATE TABLE Kaese (id INTEGER PRIMARY KEY, bezeichnung TEXT, preis REAL, beschreibung TEXT);
```

### Pizza-Konfigurationen

```sql
CREATE TABLE Konfiguration (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  konfiguration_json TEXT NOT NULL,
  bezeichnung TEXT NOT NULL,
  beschreibung TEXT,
  netto_preis REAL NOT NULL
);
```

### Pizza-Vorlagen

```sql
CREATE TABLE TagesPizza (
  id INTEGER PRIMARY KEY,
  tag TEXT NOT NULL,
  konfiguration_id INTEGER NOT NULL,
  FOREIGN KEY (konfiguration_id) REFERENCES Konfiguration(id)
);

CREATE TABLE SaisonPizza (
  id INTEGER PRIMARY KEY,
  saison TEXT NOT NULL,
  konfiguration_id INTEGER NOT NULL,
  FOREIGN KEY (konfiguration_id) REFERENCES Konfiguration(id)
);
```

### Kontakte & Bestellungen

```sql
CREATE TABLE Kontakt (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  telefon TEXT,
  email TEXT NOT NULL,
  nachricht TEXT NOT NULL,
  erstellt_am TEXT
);

CREATE TABLE Bestellung (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bestellnummer TEXT UNIQUE,
  erstellt_am TEXT,
  kunde_name TEXT NOT NULL,
  kunde_strasse TEXT NOT NULL,
  kunde_plz TEXT NOT NULL,
  kunde_stadt TEXT NOT NULL,
  kunde_email TEXT NOT NULL,
  kunde_telefon TEXT,
  netto_preis REAL NOT NULL,
  lieferkosten REAL NOT NULL,
  mwst_betrag REAL NOT NULL,
  brutto_betrag REAL NOT NULL,
  lieferzeitpunkt TEXT,
  bemerkung TEXT
);

CREATE TABLE Bestellposition (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bestellung_id INTEGER NOT NULL,
  positionsnummer INTEGER NOT NULL,
  konfiguration_id INTEGER,
  config_json TEXT,
  netto_einzelpreis REAL NOT NULL,
  menge INTEGER NOT NULL,
  netto_gesamtpreis REAL NOT NULL,
  notizen TEXT,
  FOREIGN KEY (bestellung_id) REFERENCES Bestellung(id),
  FOREIGN KEY (konfiguration_id) REFERENCES Konfiguration(id)
);
```

Siehe [Backend/db/Create_Table_Statements.sql](Backend/db/Create_Table_Statements.sql) für das vollständige Schema.

---

## Entwicklung

### NPM-Scripts

```powershell
npm start      # Server starten
npm run dev    # Entwicklungsserver mit Autoreload (nodemon)
npm test       # Tests ausführen (noch nicht konfiguriert)
```

### Dependencies

- **express** (^4.19.2) — Web Framework
- **better-sqlite3** (^11.0.0) — SQLite-Datenbank
- **cors** (^2.8.5) — CORS-Middleware
- **body-parser** (^1.20.2) — Request-Body-Parsing
- **express-fileupload** (^1.5.0) — File-Upload-Handling
- **luxon** (^3.4.4) — Datum/Zeit-Verwaltung
- **md5** (^2.3.0) — MD5-Hashing
- **lodash** (^4.17.21) — Utility-Library
- **morgan** (^1.10.0) — HTTP-Request-Logging
- **jsonwebtoken** (^9.0.2) — JWT für zukünftige Authentifizierung

### Debugging

Alle Endpoints loggen über `console.log()`:
- Service-Aufrufe
- Datenbank-Operationen
- Fehler mit vollständiger Exception

Nutze `npm run dev` und beobachte die Konsole für detailliertes Logging.

### Code-Konventionen

- **Deutsch**: Variable, Funktionen, Kommentare sind auf Deutsch
- **camelCase**: für JavaScript-Variablen & Funktionen
- **CONST/ALL_CAPS**: für Konstanten (z.B. `TIMEZONE`)
- **Comments**: Block-Kommentare für Abschnitte, Inline-Kommentare für komplexe Logik

### Bestellungsprozess

Der Bestellungsprozess funktioniert wie folgt:

1. **Konfigurator**: Kunde wählt Komponenten (Größe, Teig, Soße, Käse, Beläge)
2. **LocalStorage**: Pizza wird mit **allen Komponenten-IDs** in den Warenkorb gelegt
3. **Checkout**: Kundendaten werden erfasst
4. **Backend**: `POST /api/bestellung` empfängt Kundendaten & Items mit Komponenten-IDs
5. **Datenbank**: Backend speichert Bestellung mit auto-generierter Bestellnummer (`YYYYMMDD-HHmmss-XXXX`)

### Zeitzone-Konfiguration

Die Zeitzone wird zentral in [Backend/server.js](Backend/server.js) definiert:

```javascript
const TIMEZONE = 'Europe/Berlin'; // CET/CEST
app.locals.timezone = TIMEZONE;
```

Diese wird verwendet für:
- **Bestellnummern-Generierung** (Format: `20251208-183045-7842`)
- **Timestamps** in der Datenbank
- **Lieferzeitpunkt-Formatierung**

Alle Zeitberechnungen nutzen `luxon.DateTime` mit der konfigurierten Zeitzone.

### Weitere technische Details

- **Frontend-Build**: Kein Build-Prozess nötig; alle Dateien werden direkt vom Server serviert
- **Datenbank-Init**: Die Datenbank muss manuell mit den SQL-Dateien initialisiert werden (siehe `Backend/db/`)
- **Error-Handling**: Fehler werden geloggt und als JSON-Response zurückgegeben
- **Warenkorb-Persistenz**: LocalStorage ermöglicht Warenkorb über Browser-Sessions hinweg

---

## Lizenz

ISC (mit Third-Party-Lizensen: Robert Kuti/webanw2backend auch ISC)

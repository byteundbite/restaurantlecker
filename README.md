# Restaurant Lecker – Pizzakonfigurator

Eine Full-Stack-Webanwendung für die Konfiguration und Bestellung von Pizzas mit lokalem Warenkorb und Backend-Bestellabwicklung.

**Entwickelt von:** Maximilian Svabensky, Thomas Scharkowski, Jan Umblia  
**Stack:** Node.js (Express) Backend, vanilla HTML/CSS/JavaScript Frontend, SQLite Datenbank  
**Version:** 3.5

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

Das Backend läuft dann unter `http://localhost:8000` und dient gleichzeitig die Frontend-Dateien.

### Entwicklung mit automatischem Reload

```powershell
npm run dev
```

Dies verwendet `nodemon` zur Überwachung von Dateieänderungen.

---

## Projektstruktur

```
restaurantlecker/
├── Backend/
│   ├── server.js                  # Express Server & Haupteinstieg
│   ├── helper.js                  # Utility-Funktionen
│   ├── package.json               # Dependencies & Scripts
│   ├── db/
│   │   ├── byteundbite.sqlite    # SQLite Datenbank (wird beim Start angelegt)
│   │   ├── Create_Table_Statements.sql
│   │   └── Insert_Statements.sql
│   ├── services/                  # Express Router (API-Endpoints)
│   │   ├── konfigurator.js        # GET /api/konfigurator/*
│   │   ├── kontakt.js             # POST /api/kontakt
│   │   ├── tagespizza.js          # GET /api/tagespizza
│   │   └── saisonpizza.js         # GET /api/saisonpizza
│   └── dao/                       # Data Access Objects (DB-Abfragen)
│       ├── konfiguratorDao.js
│       ├── kontaktDao.js
│       ├── tagespizzaDao.js
│       └── saisonpizzaDao.js
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
- **Statische Dateien**: Dient Frontend-Dateien aus dem `frontend/` Ordner
- **Datenbank**: SQLite Verbindung zur `byteundbite.sqlite`
- **Service-Router**: Bindet alle Services unter dem Prefix `/api/` ein

Die Datenbank-Verbindung wird in `app.locals.dbConnection` gespeichert und ist allen Services verfügbar.

### Hilfsfunktionen (`helper.js`)

Entält Utility-Funktionen für:
- Typ-Prüfungen (`isUndefined`, `isNull`, `isNumeric`, `isArray`, `isObject`)
- String-Validierungen (`isEmail`, `isPhoneNumber`, etc.)
- Datum/Zeit-Formatierung (mit `luxon`)
- Array/Object-Manipulationen

### DAOs (Data Access Objects)

**Datenzugriff-Klassen** für strukturierten DB-Zugriff über prepared statements:

| DAO | Tabelle(n) | Hauptmethoden |
|-----|-----------|---------------|
| `KonfiguratorDao` | Groesse, Teig, Sosse, Belag, Kaese | `loadAllGroessen()`, `loadAllTeig()`, `loadAllSosse()`, etc. |
| `TagespizzaDao` | TagespizzaDef | `loadAll()`, `loadById()`, `create()`, `update()` |
| `SaisonpizzaDao` | SaisonpizzaDef | `loadAll()`, `loadById()`, `create()`, `update()` |
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
  "phone": "+49 123 456789",  // optional
  "message": "Ich hätte gerne..."
}
```

#### `tagespizza.js`

```
GET  /api/tagespizza/alle            → Alle Tagespizzas
GET  /api/tagespizza/:id             → Tagespizza nach ID
POST /api/tagespizza                 → Neue Tagespizza (Admin)
PUT  /api/tagespizza/:id             → Tagespizza aktualisieren (Admin)
```

#### `saisonpizza.js`

```
GET  /api/saisonpizza/alle           → Alle Saisonpizzas
GET  /api/saisonpizza/:id            → Saisonpizza nach ID
POST /api/saisonpizza                → Neue Saisonpizza (Admin)
PUT  /api/saisonpizza/:id            → Saisonpizza aktualisieren (Admin)
```

---

## Frontend

### Seiten & ihre Backend-Verbindung

| Seite | Datei | Backend-Verbindung | Funktion |
|-------|-------|-------------------|----------|
| Startseite | `index.html` | `GET /api/konfigurator/komponenten`<br>`GET /api/tagespizza`<br>`GET /api/saisonpizza` | Zeigt Pizza des Tages & Saisonpizza |
| Konfigurator | `configurator.html` | `GET /api/konfigurator/komponenten` | UI für Pizza-Konfiguration; Warenkorb lokal (LocalStorage) |
| Kontakt | `contact.html` | `POST /api/kontakt` | Kontaktformular mit Validierung |
| Warenkorb | `cart.html` | — | Nur lokale Anzeige (LocalStorage) |
| Checkout | `checkout.html` | `POST /api/bestellung` | Bestellt Artikel aus LocalStorage |
| Danke | `thankyou.html` | — | Statische Bestätigungsseite |
| Über uns | `about.html` | — | Statische Info-Seite |
| Impressum | `legal.html` | — | Statische Info-Seite |

### Script & Logik (`script.js`)

Zentrale JavaScript-Datei mit:

- **Initialisierung**: `initApp()` — Lädt Warenkorb, rendert Pizzas
- **Konfigurationsladung**: Ruft API auf, füllt Select-Optionen
- **Warenkorb-Management**: `addToCart()`, `loadCartFromStorage()`, `saveCartToStorage()`
- **Validierung**: E-Mail und Telefonnummer mit Echtzeit-Feedback
- **Checkout**: Validiert und sendet Bestellung an Backend
- **Kontaktformular**: `initContactForm()` — Feldvalidierung & Submit

**LocalStorage-Keys:**
- `cart` — JSON-Array der Bestellpositionen
- `cartSummary` — Gesamtbetrag & Positionen

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
  "data": { /* Inhalt */ }
}
```

Fehlerhafte Anfragen:
```json
{
  "fehler": true,
  "nachricht": "Beschreibung des Fehlers"
}
```

### Häufige HTTP-Statuscodes

- **200**: OK — Anfrage erfolgreich
- **400**: Bad Request — Fehlerhafte Anfrage (Validierungsfehler, fehlende Felder)
- **404**: Not Found — Endpoint nicht gefunden
- **500**: Server Error — Interner Fehler

---

## Datenbankschema

Die SQLite Datenbank wird automatisch beim Start angelegt. Haupttabellen:

### Konfigurationskomponenten

```sql
CREATE TABLE Groesse (id INTEGER PRIMARY KEY, bezeichnung TEXT, preis REAL, beschreibung TEXT);
CREATE TABLE Teig (id INTEGER PRIMARY KEY, bezeichnung TEXT, preis REAL, beschreibung TEXT);
CREATE TABLE Sosse (id INTEGER PRIMARY KEY, bezeichnung TEXT, preis REAL, beschreibung TEXT);
CREATE TABLE Belag (id INTEGER PRIMARY KEY, bezeichnung TEXT, preis REAL, beschreibung TEXT);
CREATE TABLE Kaese (id INTEGER PRIMARY KEY, bezeichnung TEXT, preis REAL, beschreibung TEXT);
```

### Pizza-Vorlagen

```sql
CREATE TABLE TagespizzaDef (id INTEGER PRIMARY KEY, bezeichnung TEXT, beschreibung TEXT, preis REAL);
CREATE TABLE SaisonpizzaDef (id INTEGER PRIMARY KEY, bezeichnung TEXT, beschreibung TEXT, preis REAL);
```

### Kontakte & Bestellungen

```sql
CREATE TABLE Kontakt (id INTEGER PRIMARY KEY, name TEXT, phone TEXT, email TEXT, message TEXT, erstellt DATETIME);
```

Siehe `Backend/db/Create_Table_Statements.sql` für das vollständige Schema.

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
- **jsonwebtoken** (^9.0.2) — JWT für zukünftige Auth

### Debugging

Alle Endpoints loggen über `console.log()`:
- Service-Aufrufe
- Datenbank-Operationen
- Fehler mit vollständiger Exception

Nutze `npm run dev` und beobachte die Konsole für detailliertes Logging.

### Code-Konventionen

- **Deutsch**: Variable, Funktionen, Kommentare sind auf Deutsch
- **camelCase**: für JS-Variablen & Funktionen
- **CONST/ALL_CAPS**: selten, werden meist nicht verwendet
- **Comments**: Block-Kommentare für Abschnitte, Inline-Kommentare für komplexe Logik

---

## Weitere Hinweise

- **Frontend-Build**: Kein Build-Prozess nötig; alle Dateien werden direkt serviert
- **Datenbank-Init**: Die Tabellen werden beim ersten Server-Start angelegt, wenn sie nicht existieren
- **Dateistruktur**: Backend und Frontend sind voneinander unabhängig; der Server dient nur statische Dateien
- **Error-Handling**: Fehler werden geloggt und als JSON-Response gesendet

---

## Lizenz

ISC (mit Third-Party-Lizensen: Robert Kuti/webanw2backend auch ISC)


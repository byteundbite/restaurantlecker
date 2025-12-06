	-- =========================================================================
	-- Datenbankmodell für Restaurant Lecker 
	-- Create Table Statements
    -- Version: 2.0
	-- =========================================================================

	PRAGMA foreign_keys = ON;

	-- ========== 1) KONFIGURATOR-BAUSTEINE ==========
	CREATE TABLE IF NOT EXISTS Groesse (
		id INTEGER PRIMARY KEY,
		bezeichnung TEXT NOT NULL,
		preis REAL NOT NULL DEFAULT 0.0,
		beschreibung TEXT
	);

	CREATE TABLE IF NOT EXISTS Teig (
		id INTEGER PRIMARY KEY,
		bezeichnung TEXT NOT NULL,
		preis REAL NOT NULL DEFAULT 0.0,
		beschreibung TEXT
	);

	CREATE TABLE IF NOT EXISTS Sosse (
		id INTEGER PRIMARY KEY,
		bezeichnung TEXT NOT NULL,
		preis REAL NOT NULL DEFAULT 0.0,
		beschreibung TEXT
	);

	CREATE TABLE IF NOT EXISTS Kaese (
		id INTEGER PRIMARY KEY,
		bezeichnung TEXT NOT NULL,
		preis REAL NOT NULL DEFAULT 0.0,
		beschreibung TEXT
	);

	CREATE TABLE IF NOT EXISTS Belag (
		id INTEGER PRIMARY KEY,
		bezeichnung TEXT NOT NULL,
		preis REAL NOT NULL DEFAULT 0.0,
		kategorie TEXT,
		beschreibung TEXT
	);


	-- ========== 2) KONFIGURATIONEN ==========
	-- Konfigurationen speichern
	CREATE TABLE IF NOT EXISTS Konfiguration (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		konfiguration_json TEXT NOT NULL,
		bezeichnung TEXT NOT NULL,
		beschreibung TEXT,
		netto_preis REAL NOT NULL
	);

	-- tägliche Pizzen
	CREATE TABLE IF NOT EXISTS TagesPizza (
		id INTEGER PRIMARY KEY,
		tag TEXT NOT NULL,
		konfiguration_id INTEGER NOT NULL,


		FOREIGN KEY (konfiguration_id) REFERENCES Konfiguration(id)
	);

	-- Saisonpizzen
	CREATE TABLE IF NOT EXISTS SaisonPizza (
		id INTEGER PRIMARY KEY,
		saison TEXT NOT NULL,
		konfiguration_id INTEGER NOT NULL,


		FOREIGN KEY (konfiguration_id) REFERENCES Konfiguration(id)
	);


	-- ========== 3) BESTELLUNGEN UND POSITIONEN ==========
	CREATE TABLE IF NOT EXISTS Bestellung (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		erstellt_am TEXT,
		bestellnummer TEXT UNIQUE,

		kunde_name TEXT NOT NULL,
		kunde_strasse TEXT NOT NULL,
		kunde_plz TEXT NOT NULL,
		kunde_stadt TEXT NOT NULL,
		kunde_telefon TEXT,
		kunde_email TEXT NOT NULL,

		lieferzeitpunkt TEXT,
		bemerkung TEXT,
		netto_preis REAL NOT NULL,
		lieferkosten REAL NOT NULL,
		mwst_betrag REAL NOT NULL,
		brutto_betrag REAL NOT NULL
	);

	CREATE TABLE IF NOT EXISTS Bestellposition (
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

	
	-- ========== 4) KONTAKTANFRAGEN ==========
	CREATE TABLE IF NOT EXISTS Kontakt (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		telefon TEXT,
		email TEXT NOT NULL,
		nachricht TEXT NOT NULL,
		erstellt_am TEXT
	);


	-- =========================================================================
	-- Ende des Schemas
	-- =========================================================================
	
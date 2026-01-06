-- =========================================================================
-- Datenbankmodell für Restaurant Lecker 
-- Insert Statements - Beispieldaten
-- Version: 2.0
-- =========================================================================

-- ========== 1) KONFIGURATOR-BAUSTEINE ==========

-- Größen
INSERT INTO Groesse (id, bezeichnung, preis, beschreibung) VALUES
(1, 'klein', 3.50, 'Klein, 26cm'),
(2, 'mittel', 4.50, 'Mittel, 30cm'),
(3, 'groß', 5.50, 'Groß, 34cm');

-- Teigarten
INSERT INTO Teig (id, bezeichnung, preis, beschreibung) VALUES
(1, 'italienisch', 0.50, 'Italienisch - dünn & knusprig'),
(2, 'amerikanisch', 1.50, 'Amerikanisch - dick & fluffig'),
(3, 'glutenfrei', 2.50, 'Glutenfrei'),
(4, 'kaeserand', 2.00, 'Gefüllt mit Mozzarella');

-- Soßen
INSERT INTO Sosse (id, bezeichnung, preis, beschreibung) VALUES
(1, 'rot', 1.00, 'Klassische Tomatensauce'),
(2, 'weiss', 1.20, 'Cremige weiße Sauce'),
(3, 'bbq', 1.50, 'Würzig-rauchig'),
(4, 'pesto', 2.00, 'Frisches Basilikum-Pesto'),
(5, 'oel', 1.00, 'Mit mediterranen Kräutern');

-- Käsesorten
INSERT INTO Kaese (id, bezeichnung, preis, beschreibung) VALUES
(1, 'mozzarella', 1.50, 'Klassischer italienischer Käse'),
(2, 'gouda', 0.80, 'Milder holländischer Käse'),
(3, 'gorgonzola', 2.00, 'Kräftiger Blauschimmelkäse'),
(4, 'parmesan', 1.50, 'Gereifter Hartkäse'),
(5, 'feta', 1.50, 'Griechischer Schafskäse'),
(6, 'extra kaese', 2.00, 'Doppelte Portion Mozzarella');

-- Beläge
INSERT INTO Belag (id, bezeichnung, preis, kategorie, beschreibung) VALUES
-- Fleisch
(1, 'salami', 1.90, 'fleisch', 'Italienische Salami'),
(2, 'schinken', 1.80, 'fleisch', 'Gekochter Schinken'),
(3, 'thunfisch', 2.20, 'fleisch', 'In Olivenöl'),
(4, 'haehnchen', 2.20, 'fleisch', 'Gegrilltes Hähnchenfleisch'),
(5, 'hackfleisch', 2.00, 'fleisch', 'Gewürztes Rinderhack'),
(6, 'speck', 2.00, 'fleisch', 'Knuspriger Bacon'),
(7, 'peperoni', 1.90, 'fleisch', 'Scharfe Salamiwurst'),

-- Gemüse
(8, 'champignons', 1.00, 'gemuese', 'Frische Pilze'),
(9, 'paprika', 1.00, 'gemuese', 'Rot, gelb und grün'),
(10, 'zwiebeln', 0.80, 'gemuese', 'Frische rote Zwiebeln'),
(11, 'oliven', 1.20, 'gemuese', 'Schwarze Oliven'),
(12, 'mais', 0.80, 'gemuese', 'Süßer Zuckermais'),
(13, 'tomaten', 1.00, 'gemuese', 'Frische Kirschtomaten'),
(14, 'spinat', 1.30, 'gemuese', 'Frischer Blattspinat'),
(15, 'rucola', 1.30, 'gemuese', 'Würziger Rauke-Salat'),
(16, 'artischocken', 1.50, 'gemuese', 'Marinierte Artischockenherzen'),
(17, 'jalapenos', 1.20, 'gemuese', 'Scharfe grüne Chilis'),
(18, 'ananas', 1.00, 'gemuese', 'Süße Ananasscheiben'),
(19, 'brokkoli', 1.30, 'gemuese', 'Frischer grüner Brokkoli'),
(20, 'zucchini', 1.20, 'gemuese', 'Gegrillte Zucchinischeiben');

-- Sonstiges
INSERT INTO Belag (id, bezeichnung, preis, kategorie, beschreibung) VALUES
(21, 'ei', 1.00, 'sonstiges', 'Frisches Spiegelei'),
(22, 'kapern', 1.20, 'sonstiges', 'Mediterrane Kapern'),
(23, 'sardellen', 1.80, 'sonstiges', 'Eingelegte Anchovis'),
(24, 'frische kräuter', 0.80, 'sonstiges', 'Basilikum, Oregano'),
(25, 'knoblauch', 0.50, 'sonstiges', 'Frischer Knoblauch');


-- ========== 2) VORDEFINIERTE KONFIGURATIONEN ==========

-- Presets
INSERT INTO Konfiguration (id, konfiguration_json, bezeichnung, beschreibung, netto_preis) VALUES
(1, '{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[]}', 'Pizza Margherita', 'Der italienische Klassiker', 7.50),
(2, '{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[1,8]}', 'Pizza Salami', 'Mit italienischer Salami und Champignons', 9.50),
(3, '{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[2]}', 'Pizza Prosciutto', 'Mit gekochtem Schinken', 9.00),
(4, '{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[3,10]}', 'Pizza Tonno', 'Mit Thunfisch und Zwiebeln', 10.50),
(5, '{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[8,9,10,11]}', 'Pizza Vegetaria', 'Mit frischem Gemüse', 10.00),
(6, '{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[2,8,9,11]}', 'Pizza Capricciosa', 'Mit Schinken, Pilzen, Paprika und Oliven', 11.50),
(7, '{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[4,9,10,12]}', 'Pizza Chicken', 'Mit gegrilltem Hähnchen und Gemüse', 12.00),
(8, '{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[1,7,5,17]}', 'Pizza Diavola', 'Feurig scharf mit verschiedenem Fleisch', 12.50),
(9, '{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[2,18]}', 'Pizza Hawaii', 'Mit Schinken und Ananas', 10.00),
(10, '{"groesse":2,"teig":1,"sosse":4,"kaese":3,"belaege":[15,13,22]}', 'Pizza Gourmet', 'Mit Pesto, Gorgonzola und Rucola', 13.50);


-- ========== 3) TAGESPIZZEN ==========
INSERT INTO TagesPizza (id, tag, konfiguration_id) VALUES
(1, 'Montag', 1),
(2, 'Dienstag', 2),
(3, 'Mittwoch', 5),
(4, 'Donnerstag', 7),
(5, 'Freitag', 8),
(6, 'Samstag', 6),
(7, 'Sonntag', 10);


-- ========== 4) SAISONPIZZEN ==========
INSERT INTO SaisonPizza (id, saison, konfiguration_id) VALUES
(1, 'Winter', 5),
(2, 'Frühling', 9),
(3, 'Sommer', 6),
(4, 'Herbst', 8);

-- ========== 5) BEISPIEL-BESTELLUNGEN ==========

-- Bestellung 1
INSERT INTO Bestellung (id, erstellt_am, bestellnummer, kunde_name, kunde_strasse, kunde_plz, kunde_stadt, kunde_telefon, kunde_email, lieferzeitpunkt, bemerkung, netto_preis, lieferkosten, mwst_betrag, brutto_betrag) VALUES
(1, '2025-12-01 18:30:00', 'BNR-20251201-001', 'Max Mustermann', 'Musterstraße 12', '12345', 'Musterstadt', '0123456789', 'max@example.com', '2025-12-01 19:30:00', 'Bitte klingeln', 21.50, 3.00, 4.66, 29.16);

INSERT INTO Bestellposition (bestellung_id, positionsnummer, konfiguration_id, config_json, netto_einzelpreis, menge, netto_gesamtpreis, notizen) VALUES
(1, 1, 2, '{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[1,8]}', 9.50, 2, 19.00, NULL),
(1, 2, NULL, '{"groesse":1,"teig":1,"sosse":1,"kaese":1,"belaege":[10,9]}', 8.50, 1, 8.50, 'Extra Zwiebeln');

-- Bestellung 2
INSERT INTO Bestellung (id, erstellt_am, bestellnummer, kunde_name, kunde_strasse, kunde_plz, kunde_stadt, kunde_telefon, kunde_email, lieferzeitpunkt, bemerkung, netto_preis, lieferkosten, mwst_betrag, brutto_betrag) VALUES
(2, '2025-12-02 19:15:00', 'BNR-20251202-002', 'Anna Schmidt', 'Hauptstraße 45', '54321', 'Beispielstadt', '0987654321', 'anna@example.com', '2025-12-02 20:00:00', 'Bei Nachbarn abgeben falls nicht da', 35.00, 3.50, 7.32, 45.82);

INSERT INTO Bestellposition (bestellung_id, positionsnummer, konfiguration_id, config_json, netto_einzelpreis, menge, netto_gesamtpreis, notizen) VALUES
(2, 1, 7, '{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[4,9,10,12]}', 12.00, 1, 12.00, NULL),
(2, 2, 10, '{"groesse":2,"teig":1,"sosse":4,"kaese":3,"belaege":[15,13,22]}', 13.50, 1, 13.50, NULL),
(2, 3, 1, '{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[]}', 7.50, 1, 7.50, 'Ohne Oregano');

-- Bestellung 3
INSERT INTO Bestellung (id, erstellt_am, bestellnummer, kunde_name, kunde_strasse, kunde_plz, kunde_stadt, kunde_telefon, kunde_email, lieferzeitpunkt, bemerkung, netto_preis, lieferkosten, mwst_betrag, brutto_betrag) VALUES
(3, '2025-12-05 20:00:00', 'BNR-20251205-003', 'Peter Müller', 'Parkweg 7', '98765', 'Testdorf', '0555123456', 'peter@example.com', '2025-12-05 21:00:00', NULL, 24.50, 4.00, 5.42, 33.92);

INSERT INTO Bestellposition (bestellung_id, positionsnummer, konfiguration_id, config_json, netto_einzelpreis, menge, netto_gesamtpreis, notizen) VALUES
(3, 1, 8, '{"groesse":3,"teig":1,"sosse":1,"kaese":1,"belaege":[1,7,5,17]}', 18.50, 1, 18.50, 'Extra scharf'),
(3, 2, 5, '{"groesse":1,"teig":2,"sosse":1,"kaese":1,"belaege":[8,9,10,11]}', 12.00, 1, 12.00, 'Vollkornteig');


-- ========== 6) KONTAKTANFRAGEN ==========
INSERT INTO Kontakt (name, telefon, email, nachricht, erstellt_am) VALUES
('Lisa Weber', '0171234567', 'lisa@example.com', 'Ich hätte gerne Informationen zu Ihren Catering-Angeboten für eine Firmenfeier mit ca. 50 Personen.', '2025-12-01 10:30:00'),
('Tom Fischer', '0162345678', 'tom@example.com', 'Bieten Sie auch vegane Pizzen an? Welche Käsealternativen haben Sie?', '2025-12-03 14:20:00'),
('Sandra Becker', '0153456789', 'sandra@example.com', 'Kann man bei Ihnen auch Gutscheine kaufen?', '2025-12-04 16:45:00'),
('Michael Klein', NULL, 'michael@example.com', 'Ich bin mit meiner letzten Bestellung sehr zufrieden gewesen. Weiter so!', '2025-12-05 12:00:00');


-- =========================================================================
-- Ende der Insert Statements
-- =========================================================================

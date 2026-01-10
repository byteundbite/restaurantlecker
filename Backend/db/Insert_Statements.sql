-- =========================================================================
-- Datenbankmodell für Restaurant Lecker 
-- Insert Statements - Beispieldaten
-- =========================================================================

INSERT INTO Belag (id,bezeichnung,preis,kategorie,beschreibung) VALUES
	 (1,'salami',1.9,'fleisch','Italienische Salami'),
	 (2,'schinken',1.8,'fleisch','Gekochter Schinken'),
	 (3,'thunfisch',2.2,'fleisch','In Olivenöl'),
	 (4,'hähnchen',2.2,'fleisch','Gegrilltes Hähnchenfleisch'),
	 (5,'hackfleisch',2.0,'fleisch','Gewürztes Rinderhack'),
	 (6,'speck',2.0,'fleisch','Knuspriger Bacon'),
	 (7,'peperoni',1.9,'fleisch','Scharfe Salamiwurst'),
	 (8,'champignons',1.0,'gemuese','Frische Pilze'),
	 (9,'paprika',1.0,'gemuese','Rot, gelb und grün'),
	 (10,'zwiebeln',0.8,'gemuese','Frische rote Zwiebeln'),
     (11,'oliven',1.2,'gemuese','Schwarze Oliven'),
	 (12,'mais',0.8,'gemuese','Süßer Zuckermais'),
	 (13,'tomaten',1.0,'gemuese','Frische Kirschtomaten'),
	 (14,'spinat',1.3,'gemuese','Frischer Blattspinat'),
	 (15,'rucola',1.3,'gemuese','Würziger Rauke-Salat'),
	 (16,'artischocken',1.5,'gemuese','Marinierte Artischockenherzen'),
	 (17,'jalapenos',1.2,'gemuese','Scharfe grüne Chilis'),
	 (18,'ananas',1.0,'gemuese','Süße Ananasscheiben'),
	 (19,'brokkoli',1.3,'gemuese','Frischer grüner Brokkoli'),
	 (20,'zucchini',1.2,'gemuese','Gegrillte Zucchinischeiben'),
	 (21,'ei',1.0,'sonstiges','Frisches Spiegelei'),
	 (22,'kapern',1.2,'sonstiges','Mediterrane Kapern'),
	 (23,'sardellen',1.8,'sonstiges','Eingelegte Anchovis'),
	 (24,'frische Kräuter',0.8,'sonstiges','Basilikum, Oregano'),
	 (25,'knoblauch',0.5,'sonstiges','Frischer Knoblauch');

INSERT INTO Bestellposition (bestellung_id,positionsnummer,konfiguration_id,config_json,netto_einzelpreis,menge,netto_gesamtpreis,notizen) VALUES
	 (1,1,2,'{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[1,8]}',9.5,2,19.0,NULL),
	 (1,2,NULL,'{"groesse":1,"teig":1,"sosse":1,"kaese":1,"belaege":[10,9]}',8.5,1,8.5,'Extra Zwiebeln'),
	 (2,1,7,'{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[4,9,10,12]}',12.0,1,12.0,NULL),
	 (2,2,10,'{"groesse":2,"teig":1,"sosse":4,"kaese":3,"belaege":[15,13,22]}',13.5,1,13.5,NULL),
	 (2,3,1,'{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[]}',7.5,1,7.5,'Ohne Oregano'),
	 (3,1,8,'{"groesse":3,"teig":1,"sosse":1,"kaese":1,"belaege":[1,7,5,17]}',18.5,1,18.5,'Extra scharf'),
	 (3,2,5,'{"groesse":1,"teig":2,"sosse":1,"kaese":1,"belaege":[8,9,10,11]}',12.0,1,12.0,'Vollkornteig'),
	 (4,1,13,'{"sizeId":"2","doughId":"1","sauceId":"1","cheeses":[{"id":"1","bezeichnung":"Mozzarella (inkl.)"},{"id":"6","bezeichnung":"Extra kaese (+2.00 €)"}],"toppings":[{"id":"3","bezeichnung":"Thunfisch (+2.00 €)"},{"id":"7","bezeichnung":"Peperoni (+1.50 €)"},{"id":"12","bezeichnung":"Mais (+0.80 €)"},{"id":"17","bezeichnung":"Jalapenos (+1.20 €)"}],"note":"","qty":1,"displayText":"Größe: Mittel | Teig: Italienisch | Soße: Rot | Käse: Mozzarella, Extra kaese | Beläge: Thunfisch, Peperoni, Mais, Jalapenos"}',10.5,1,10.5,NULL),
	 (5,1,14,'{"sizeId":"3","doughId":"1","sauceId":"3","cheeses":[{"id":"1","bezeichnung":"Mozzarella (inkl.)"},{"id":"6","bezeichnung":"Extra kaese (+2.00 €)"}],"toppings":[{"id":"7","bezeichnung":"Peperoni (+1.50 €)"},{"id":"25","bezeichnung":"Knoblauch (+0.50 €)"},{"id":"12","bezeichnung":"Mais (+0.80 €)"},{"id":"14","bezeichnung":"Spinat (+1.50 €)"},{"id":"20","bezeichnung":"Zucchini (+1.30 €)"}],"note":"","qty":14,"displayText":"Größe: Groß | Teig: Italienisch | Soße: Bbq | Käse: Mozzarella, Extra kaese | Beläge: Peperoni, Knoblauch, Mais, Spinat, Zucchini"}',15.100000000000003,14,211.40000000000003,NULL),
	 (6,1,15,'{"sizeId":"1","doughId":"1","sauceId":"1","cheeses":[{"id":"1","bezeichnung":"Mozzarella (inkl.)"}],"toppings":[],"note":"","qty":1,"displayText":"Größe: Klein | Teig: Italienisch | Soße: Rot | Käse: Mozzarella"}',0.0,1,0.0,NULL),
	 (7,1,16,'{"sizeId":"1","doughId":"1","sauceId":"1","cheeses":[{"id":"1","bezeichnung":"Mozzarella (inkl.)"}],"toppings":[],"note":"","qty":1,"displayText":"Größe: Klein | Teig: Italienisch | Soße: Rot | Käse: Mozzarella"}',0.0,1,0.0,NULL),
	 (8,1,17,'{"sizeId":"1","doughId":"1","sauceId":"1","cheeses":[{"id":"1","bezeichnung":"Mozzarella (inkl.)"}],"toppings":[],"note":"","qty":1,"displayText":"Größe: Klein | Teig: Italienisch | Soße: Rot | Käse: Mozzarella"}',0.0,1,0.0,NULL),
	 (9,1,18,'{"sizeId":"1","doughId":"1","sauceId":"1","cheeses":[{"id":"1","bezeichnung":"Mozzarella (inkl.)"}],"toppings":[],"note":"","qty":1,"displayText":"Größe: Klein | Teig: Italienisch | Soße: Rot | Käse: Mozzarella"}',0.0,1,0.0,NULL),
	 (10,1,19,'{"sizeId":"1","doughId":"1","sauceId":"1","cheeses":[{"id":"1","bezeichnung":"Mozzarella (+1.50 €)"}],"toppings":[],"note":"","qty":1,"displayText":"Größe: Klein | Teig: Italienisch | Soße: Rot | Käse: Mozzarella"}',6.5,1,6.5,NULL),
	 (11,1,20,'{"sizeId":2,"doughId":1,"sauceId":1,"cheeses":[{"id":1,"bezeichnung":"Käse 1"}],"toppings":[{"id":2,"bezeichnung":"Belag 2"},{"id":8,"bezeichnung":"Belag 8"},{"id":9,"bezeichnung":"Belag 9"},{"id":11,"bezeichnung":"Belag 11"}],"note":"","qty":1,"displayText":"Pizza Capricciosa – Größe: Mittel | Teig: Italienisch | Soße: Rot | Käse: Mozzarella | Beläge: Schinken, Champignons, Paprika, Oliven"}',12.5,1,12.5,NULL);

INSERT INTO Bestellung (erstellt_am,bestellnummer,kunde_name,kunde_strasse,kunde_plz,kunde_stadt,kunde_telefon,kunde_email,lieferzeitpunkt,bemerkung,netto_preis,lieferkosten,mwst_betrag,brutto_betrag) VALUES
	 ('2025-12-01 18:30:00','BNR-20251201-001','Max Mustermann','Musterstraße 12','12345','Musterstadt','0123456789','max@example.com','2025-12-01 19:30:00','Bitte klingeln',21.5,3.0,4.66,29.16),
	 ('2025-12-02 19:15:00','BNR-20251202-002','Anna Schmidt','Hauptstraße 45','54321','Beispielstadt','0987654321','anna@example.com','2025-12-02 20:00:00','Bei Nachbarn abgeben falls nicht da',35.0,3.5,7.32,45.82),
	 ('2025-12-05 20:00:00','BNR-20251205-003','Peter Müller','Parkweg 7','98765','Testdorf','0555123456','peter@example.com','2025-12-05 21:00:00',NULL,24.5,4.0,5.42,33.92);

INSERT INTO Groesse (id,bezeichnung,preis,beschreibung) VALUES
	 (1,'klein',3.5,'Klein, 26cm'),
	 (2,'mittel',4.5,'Mittel, 30cm'),
	 (3,'groß',5.5,'Groß, 34cm');

INSERT INTO Kaese (id,bezeichnung,preis,beschreibung) VALUES
	 (1,'mozzarella',1.5,'Klassischer italienischer Käse'),
	 (2,'gouda',0.8,'Milder holländischer Käse'),
	 (3,'gorgonzola',2.0,'Kräftiger Blauschimmelkäse'),
	 (4,'parmesan',1.5,'Gereifter Hartkäse'),
	 (5,'feta',1.5,'Griechischer Schafskäse'),
	 (6,'extra Käse',2.0,'Doppelte Portion Mozzarella');

INSERT INTO Konfiguration (konfiguration_json,bezeichnung,beschreibung,netto_preis) VALUES
	 ('{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[]}','Pizza Margherita','Der italienische Klassiker',7.5),
	 ('{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[1,8]}','Pizza Salami','Mit italienischer Salami und Champignons',10.4),
	 ('{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[2]}','Pizza Prosciutto','Mit gekochtem Schinken',9.3),
	 ('{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[3,10]}','Pizza Tonno','Mit Thunfisch und Zwiebeln',10.5),
	 ('{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[8,9,10,11]}','Pizza Vegetaria','Mit frischem Gemüse',11.5),
	 ('{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[2,8,9,11]}','Pizza Capricciosa','Mit Schinken, Pilzen, Paprika und Oliven',12.5),
	 ('{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[4,9,10,12]}','Pizza Chicken','Mit gegrilltem Hähnchen und Gemüse',12.3),
	 ('{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[1,7,5,17]}','Pizza Diavola','Feurig scharf mit verschiedenem Fleisch',14.5),
	 ('{"groesse":2,"teig":1,"sosse":1,"kaese":1,"belaege":[2,18]}','Pizza Hawaii','Mit Schinken und Ananas',10.3),
	 ('{"groesse":2,"teig":1,"sosse":4,"kaese":3,"belaege":[15,13,22]}','Pizza Gourmet','Mit Pesto, Gorgonzola und Rucola',12.5);

INSERT INTO Kontakt (name,telefon,email,nachricht,erstellt_am) VALUES
	 ('Lisa Weber','0171234567','lisa@example.com','Ich hätte gerne Informationen zu Ihren Catering-Angeboten für eine Firmenfeier mit ca. 50 Personen.','2025-12-01 10:30:00'),
	 ('Tom Fischer','0162345678','tom@example.com','Bieten Sie auch vegane Pizzen an? Welche Käsealternativen haben Sie?','2025-12-03 14:20:00'),
	 ('Sandra Becker','0153456789','sandra@example.com','Kann man bei Ihnen auch Gutscheine kaufen?','2025-12-04 16:45:00'),
	 ('Michael Klein',NULL,'michael@example.com','Ich bin mit meiner letzten Bestellung sehr zufrieden gewesen. Weiter so!','2025-12-05 12:00:00');

INSERT INTO SaisonPizza (id,saison,konfiguration_id) VALUES
	 (1,'Winter',5),
	 (2,'Frühling',9),
	 (3,'Sommer',6),
	 (4,'Herbst',8);

INSERT INTO Sosse (id,bezeichnung,preis,beschreibung) VALUES
	 (1,'rot',1.0,'Klassische Tomatensauce'),
	 (2,'weiss',1.2,'Cremige weiße Sauce'),
	 (3,'BBQ',1.5,'Würzig-rauchig'),
	 (4,'Pesto',2.0,'Frisches Basilikum-Pesto'),
	 (5,'Öl',1.0,'Mit mediterranen Kräutern');

INSERT INTO TagesPizza (id,tag,konfiguration_id) VALUES
	 (1,'Montag',1),
	 (2,'Dienstag',2),
	 (3,'Mittwoch',5),
	 (4,'Donnerstag',7),
	 (5,'Freitag',8),
	 (6,'Samstag',6),
	 (7,'Sonntag',10);

INSERT INTO Teig (id,bezeichnung,preis,beschreibung) VALUES
	 (1,'italienisch',0.5,'Italienisch - dünn & knusprig'),
	 (2,'amerikanisch',1.5,'Amerikanisch - dick & fluffig'),
	 (3,'glutenfrei',2.5,'Glutenfrei'),
	 (4,'käserand',2.0,'Gefüllt mit Mozzarella');

-- =========================================================================
-- Ende der Insert Statements
-- =========================================================================
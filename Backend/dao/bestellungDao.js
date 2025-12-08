const helper = require('../helper.js');

class BestellungDao {

    constructor(dbConnection, timezone = 'Europe/Berlin') {
        this._conn = dbConnection;
        this._timezone = timezone;
    }

    getConnection() {
        return this._conn;
    }

    getTimezone() {
        return this._timezone;
    }

    /**
     * Generiert eine eindeutige Bestellnummer basierend auf der konfigurierten Zeitzone
     * Format: YYYYMMDD-HHmmss-XXXX
     * @returns {String} Bestellnummer
     */
    generateBestellnummer() {
        const now = new Date();
        
        // Formatiere das Datum/Uhrzeit basierend auf der Zeitzone
        const formatter = new Intl.DateTimeFormat('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: this._timezone
        });
        
        const parts = formatter.formatToParts(now);
        let year = '', month = '', day = '', hour = '', minute = '', second = '';
        
        parts.forEach(part => {
            if (part.type === 'year') year = part.value;
            if (part.type === 'month') month = part.value;
            if (part.type === 'day') day = part.value;
            if (part.type === 'hour') hour = part.value;
            if (part.type === 'minute') minute = part.value;
            if (part.type === 'second') second = part.value;
        });
        
        const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${year}${month}${day}-${hour}${minute}${second}-${randomSuffix}`;
    }

    /**
     * Erstellt eine neue Bestellung mit allen Bestellpositionen
     * @param {Object} kunde - Kundendaten (name, street, zip, city, email, phone)
     * @param {Array} items - Array von Bestellitems mit Komponenten
     * @param {String} orderNote - Anmerkung zur Bestellung
     * @param {Boolean} asap - Schnellstmögliche Lieferung?
     * @param {String} deliveryDateTime - Liefertermin (ISO 8601)
     * @param {Number} net - Nettosumme
     * @param {Number} shipping - Versandkosten
     * @param {Number} vat - MwSt-Betrag
     * @param {Number} total - Gesamtsumme
     * @returns {Object} {orderId, configIds}
     */
    createOrder(kunde, items, orderNote, asap, deliveryDateTime, net, shipping, vat, total) {
        // Validierungen
        if (!kunde || !kunde.name || !kunde.email) {
            throw new Error('Kundendaten sind unvollständig');
        }

        if (!Array.isArray(items) || items.length === 0) {
            throw new Error('Keine Artikel in der Bestellung');
        }

        // Berechne Lieferzeitpunkt basierend auf asap-Flag
        let lieferzeitpunkt = null;
        if (asap) {
            lieferzeitpunkt = 'Schnellstmögliche Lieferung';
        } else if (deliveryDateTime) {
            const dt = new Date(deliveryDateTime);
            lieferzeitpunkt = dt.toLocaleString('de-DE', { timeZone: this._timezone });
        }

        // Generiere eine eindeutige Bestellnummer
        const bestellnummer = this.generateBestellnummer();

        // Formatiere das aktuelle Datum/Uhrzeit mit der konfigurierten Zeitzone
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: this._timezone
        });
        
        const parts = formatter.formatToParts(now);
        let year = '', month = '', day = '', hour = '', minute = '', second = '';
        
        parts.forEach(part => {
            if (part.type === 'year') year = part.value;
            if (part.type === 'month') month = part.value;
            if (part.type === 'day') day = part.value;
            if (part.type === 'hour') hour = part.value;
            if (part.type === 'minute') minute = part.value;
            if (part.type === 'second') second = part.value;
        });
        
        const erstellt_am = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

        // Erstelle die Bestellung
        const bestellungSql = `
            INSERT INTO Bestellung (
                bestellnummer,
                erstellt_am,
                kunde_name,
                kunde_strasse,
                kunde_plz,
                kunde_stadt,
                kunde_email,
                kunde_telefon,
                netto_preis,
                lieferkosten,
                mwst_betrag,
                brutto_betrag,
                lieferzeitpunkt,
                bemerkung
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const bestellungStatement = this._conn.prepare(bestellungSql);
        const bestellungResult = bestellungStatement.run([
            bestellnummer,
            erstellt_am,
            kunde.name,
            kunde.street,
            kunde.zip,
            kunde.city,
            kunde.email,
            kunde.phone || null,
            Number(net),
            Number(shipping),
            Number(vat),
            Number(total),
            lieferzeitpunkt,
            orderNote || null
        ]);

        if (bestellungResult.changes !== 1) {
            throw new Error('Die Bestellung konnte nicht angelegt werden');
        }

        const orderId = bestellungResult.lastInsertRowid;
        const configIds = [];

        // Erstelle Bestellpositionen für jedes Item
        items.forEach((item, posIndex) => {
            if (!item.components) {
                throw new Error(`Item ${posIndex + 1}: Komponenten fehlen`);
            }

            const components = item.components;

            // Validiere erforderliche Komponenten
            if (!components.sizeId || !components.doughId || !components.sauceId) {
                throw new Error(
                    `Item ${posIndex + 1}: Ungültige Pizza-Konfiguration - Größe, Teig oder Soße fehlt`
                );
            }

            // Erstelle JSON-Repräsentation der Konfiguration
            const configJson = JSON.stringify({
                sizeId: components.sizeId,
                doughId: components.doughId,
                sauceId: components.sauceId,
                cheeses: components.cheeses || [],
                toppings: components.toppings || [],
                note: components.note || '',
                qty: item.qty,
                displayText: item.text
            });

            // Speichere die Konfiguration
            const konfigurationSql = `
                INSERT INTO Konfiguration (
                    konfiguration_json,
                    bezeichnung,
                    netto_preis
                ) VALUES (?, ?, ?)
            `;

            const konfigurationStatement = this._conn.prepare(konfigurationSql);
            const perPizzaPrice = item.total / item.qty;

            const konfigurationResult = konfigurationStatement.run([
                configJson,
                item.text || 'Individuelle Pizza',
                Number(perPizzaPrice)
            ]);

            if (konfigurationResult.changes !== 1) {
                throw new Error(`Item ${posIndex + 1}: Konfiguration konnte nicht gespeichert werden`);
            }

            configIds.push(konfigurationResult.lastInsertRowid);

            // Erstelle Bestellposition
            const positionSql = `
                INSERT INTO Bestellposition (
                    bestellung_id,
                    positionsnummer,
                    konfiguration_id,
                    config_json,
                    netto_einzelpreis,
                    menge,
                    netto_gesamtpreis,
                    notizen
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const positionStatement = this._conn.prepare(positionSql);
            positionStatement.run([
                orderId,
                posIndex + 1,
                konfigurationResult.lastInsertRowid,
                configJson,
                Number(perPizzaPrice),
                item.qty,
                Number(item.total),
                components.note || null
            ]);
        });

        return {
            orderId,
            bestellnummer,
            configIds
        };
    }

    /**
     * Lädt eine Bestellung mit ihren Positionen
     * @param {Number} orderId - Bestellungs-ID
     * @returns {Object} Bestellung mit Positionen
     */
    getOrderById(orderId) {
        const sql = `
            SELECT * FROM Bestellung WHERE id = ?
        `;

        const statement = this._conn.prepare(sql);
        const order = statement.get([orderId]);

        if (!order) {
            return null;
        }

        // Lade auch die Positionen
        const positionSql = `
            SELECT * FROM Bestellposition WHERE bestellung_id = ? ORDER BY positionsnummer
        `;

        const positionStatement = this._conn.prepare(positionSql);
        const positions = positionStatement.all([orderId]);

        return {
            ...order,
            positionen: positions || []
        };
    }

    /**
     * Lädt alle Bestellungen eines Kunden
     * @param {String} email - E-Mail des Kunden
     * @returns {Array} Array von Bestellungen
     */
    getOrdersByCustomerEmail(email) {
        const sql = `
            SELECT * FROM Bestellung WHERE kunde_email = ? ORDER BY erstellt_am DESC
        `;

        const statement = this._conn.prepare(sql);
        const orders = statement.all([email]);

        return helper.isArrayEmpty(orders) ? [] : orders;
    }

    /**
     * Aktualisiert den Status einer Bestellung
     * @param {Number} orderId - Bestellungs-ID
     * @param {String} status - Neuer Status
     */
    updateOrderStatus(orderId, status) {
        const sql = `
            UPDATE Bestellung SET bemerkung = ? WHERE id = ?
        `;

        const statement = this._conn.prepare(sql);
        const result = statement.run([status, orderId]);

        return result.changes === 1;
    }

    toString() {
        console.log('BestellungDao [_conn=' + this._conn + ']');
    }
}

module.exports = BestellungDao;

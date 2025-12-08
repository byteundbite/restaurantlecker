const helper = require('../helper.js');

class KonfiguratorDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    // Lädt alle Größen
    loadAllGroessen() {
        var sql = 'SELECT * FROM Groesse ORDER BY id';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result))
            return [];

        return result;
    }

    // Lädt alle Teigvarianten
    loadAllTeig() {
        var sql = 'SELECT * FROM Teig ORDER BY id';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result))
            return [];

        return result;
    }

    // Lädt alle Saucenarten
    loadAllSosse() {
        var sql = 'SELECT * FROM Sosse ORDER BY id';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result))
            return [];

        return result;
    }

    // Lädt alle Käsesorten
    loadAllKaese() {
        var sql = 'SELECT * FROM Kaese ORDER BY id';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result))
            return [];

        return result;
    }

    // Lädt alle Beläge
    loadAllBelag() {
        var sql = 'SELECT * FROM Belag ORDER BY id';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result))
            return [];

        return result;
    }

    // Lädt alle Komponenten des Konfigurators in einem Request
    loadAllComponents() {
        return {
            groessen: this.loadAllGroessen(),
            teig: this.loadAllTeig(),
            sosse: this.loadAllSosse(),
            kaese: this.loadAllKaese(),
            belag: this.loadAllBelag()
        };
    }

    // Legt eine neue Konfiguration an
    createKonfiguration(konfigurationJson, bezeichnung, beschreibung, netto_preis) {
        if (helper.isUndefined(konfigurationJson) || helper.isNull(konfigurationJson)) {
            throw new Error('konfigurationJson fehlt');
        }

        if (!bezeichnung || typeof bezeichnung !== 'string') {
            throw new Error('bezeichnung fehlt oder ist ungültig');
        }

        if (!helper.isNumeric(netto_preis)) {
            throw new Error('netto_preis fehlt oder ist keine Zahl');
        }

        const sql = 'INSERT INTO Konfiguration (konfiguration_json, bezeichnung, beschreibung, netto_preis) VALUES (?, ?, ?, ?)';
        const statement = this._conn.prepare(sql);

        const payloadJson = typeof konfigurationJson === 'string'
            ? konfigurationJson
            : JSON.stringify(konfigurationJson);

        const result = statement.run([payloadJson, bezeichnung, beschreibung || null, Number(netto_preis)]);

        if (result.changes !== 1) {
            throw new Error('Die Konfiguration konnte nicht angelegt werden');
        }

        return {
            id: result.lastInsertRowid,
            konfiguration_json: payloadJson,
            bezeichnung,
            beschreibung: beschreibung || null,
            netto_preis: Number(netto_preis)
        };
    }

    toString() {
        console.log('KonfiguratorDao [_conn=' + this._conn + ']');
    }
}

module.exports = KonfiguratorDao;

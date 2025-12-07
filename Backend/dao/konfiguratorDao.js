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

    toString() {
        console.log('KonfiguratorDao [_conn=' + this._conn + ']');
    }
}

module.exports = KonfiguratorDao;

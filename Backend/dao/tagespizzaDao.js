const helper = require('../helper.js');

class TagesPizzaDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadAll() {
        var sql = `
            SELECT 
                tp.id, 
                tp.tag, 
                tp.konfiguration_id,
                k.bezeichnung,
                k.beschreibung,
                k.netto_preis,
                k.konfiguration_json
            FROM TagesPizza tp
            LEFT JOIN Konfiguration k ON tp.konfiguration_id = k.id
        `;
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];
        
        return result;
    }

    loadByTag(tag) {
        var sql = `
            SELECT 
                tp.id, 
                tp.tag, 
                tp.konfiguration_id,
                k.bezeichnung,
                k.beschreibung,
                k.netto_preis,
                k.konfiguration_json
            FROM TagesPizza tp
            LEFT JOIN Konfiguration k ON tp.konfiguration_id = k.id
            WHERE LOWER(tp.tag) = LOWER(?)
        `;
        var statement = this._conn.prepare(sql);
        var result = statement.get(tag);

        if (helper.isUndefined(result)) 
            throw new Error('Keine TagesPizza für Tag=' + tag + ' gefunden');

        return result;
    }

    loadById(id) {
        var sql = `
            SELECT 
                tp.id, 
                tp.tag, 
                tp.konfiguration_id,
                k.bezeichnung,
                k.beschreibung,
                k.netto_preis,
                k.konfiguration_json
            FROM TagesPizza tp
            LEFT JOIN Konfiguration k ON tp.konfiguration_id = k.id
            WHERE tp.id = ?
        `;
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error('Keine TagesPizza mit id=' + id + ' gefunden');

        return result;
    }

    toString() {
        console.log('TagesPizzaDao [_conn=' + this._conn + ']');
    }
}

module.exports = TagesPizzaDao;

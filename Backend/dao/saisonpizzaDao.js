const helper = require('../helper.js');

class SaisonPizzaDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadAll() {
        var sql = `
            SELECT 
                sp.id, 
                sp.saison, 
                sp.konfiguration_id,
                k.bezeichnung,
                k.beschreibung,
                k.netto_preis,
                k.konfiguration_json
            FROM SaisonPizza sp
            LEFT JOIN Konfiguration k ON sp.konfiguration_id = k.id
        `;
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];
        
        return result;
    }

    loadBySaison(saison) {
        var sql = `
            SELECT 
                sp.id, 
                sp.saison, 
                sp.konfiguration_id,
                k.bezeichnung,
                k.beschreibung,
                k.netto_preis,
                k.konfiguration_json
            FROM SaisonPizza sp
            LEFT JOIN Konfiguration k ON sp.konfiguration_id = k.id
            WHERE LOWER(sp.saison) = LOWER(?)
        `;
        var statement = this._conn.prepare(sql);
        var result = statement.get(saison);

        if (helper.isUndefined(result)) 
            throw new Error('Keine SaisonPizza für Saison=' + saison + ' gefunden');

        return result;
    }

    loadById(id) {
        var sql = `
            SELECT 
                sp.id, 
                sp.saison, 
                sp.konfiguration_id,
                k.bezeichnung,
                k.beschreibung,
                k.netto_preis,
                k.konfiguration_json
            FROM SaisonPizza sp
            LEFT JOIN Konfiguration k ON sp.konfiguration_id = k.id
            WHERE sp.id = ?
        `;
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error('Keine SaisonPizza mit id=' + id + ' gefunden');

        return result;
    }

    toString() {
        console.log('SaisonPizzaDao [_conn=' + this._conn + ']');
    }
}

module.exports = SaisonPizzaDao;

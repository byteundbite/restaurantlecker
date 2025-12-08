const helper = require('../helper.js');

class KontaktDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadAll() {
        var sql = 'SELECT * FROM Kontakt';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result))
            return [];

        for (var i = 0; i < result.length; i++) {
            var createdAtRaw = result[i].erstellzeitpunkt || result[i].erstellt_am;
            var createdAt = helper.parseSQLDateTimeString(createdAtRaw);
            if (!helper.isNull(createdAt))
                result[i].erstellzeitpunkt = helper.formatToGermanDateTime(createdAt);
            delete result[i].erstellt_am;
        }

        return result;
    }

    create(name = '', phone = '', email = '', message = '', createdAt = null) {
        if (helper.isNull(createdAt) || helper.isUndefined(createdAt))
            createdAt = helper.getNow();

        var sql = 'INSERT INTO Kontakt (name,telefon,email,nachricht,erstellt_am) VALUES (?,?,?,?,?)';
        var statement = this._conn.prepare(sql);
        var params = [name, phone, email, message, helper.formatToSQLDateTime(createdAt)];
        var result = statement.run(params);

        if (result.changes != 1)
            throw new Error('KontaktDao: Konnte neuen Datensatz nicht einfügen. Data: ' + params);

        return {
            id: result.lastInsertRowid,
            name: name,
            telefon: phone,
            email: email,
            nachricht: message,
            erstellzeitpunkt: helper.formatToGermanDateTime(createdAt)
        };
    }

    toString() {
        console.log('KontaktDao [_conn=' + this._conn + ']');
    }
}

module.exports = KontaktDao;

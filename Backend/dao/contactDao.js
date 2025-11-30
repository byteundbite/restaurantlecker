const helper = require('../helper.js');

class ContactDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    create(name = '', phone = '', email = '', message = '', createdAt = null) {
        if (helper.isNull(createdAt) || helper.isUndefined(createdAt))
            createdAt = helper.getNow();

        var sql = 'INSERT INTO Kontakt (name,telefon,email,nachricht,erstellzeitpunkt) VALUES (?,?,?,?,?)';
        var statement = this._conn.prepare(sql);
        var params = [name, phone, email, message, helper.formatToSQLDateTime(createdAt)];
        var result = statement.run(params);

        if (result.changes != 1)
            throw new Error('Could not insert new Record. Data: ' + params);

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
        console.log('ContactDao [_conn=' + this._conn + ']');
    }
}

module.exports = ContactDao;

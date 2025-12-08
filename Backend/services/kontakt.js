const helper = require('../helper.js');
const KontaktDao = require('../dao/kontaktDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Kontakt');

// Alle Kontakt Einträge laden
serviceRouter.get('/kontakt/alle', function(request, response) {
    console.log('Service Kontakt: Client requested all contact records');

    const kontaktDao = new KontaktDao(request.app.locals.dbConnection);
    try {
        var arr = kontaktDao.loadAll();
        console.log('Service Kontakt: Records loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Kontakt: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

// Neuen Kontakt Eintrag anlegen
serviceRouter.post('/kontakt', function(request, response) {
    console.log('Service Kontakt: Anfrage zum Anlegen eines neuen Kontakts erhalten');

    var errorMsgs = [];
    if (helper.isUndefined(request.body.name) || request.body.name.trim() === '')
        errorMsgs.push('name fehlt');
    if (helper.isUndefined(request.body.email) || request.body.email.trim() === '')
        errorMsgs.push('email fehlt');
    else if (!helper.isEmail(request.body.email))
        errorMsgs.push('email hat ein falsches Format');
    if (helper.isUndefined(request.body.message) || request.body.message.trim() === '')
        errorMsgs.push('nachricht fehlt');

    if (errorMsgs.length > 0) {
        console.log('Service Kontakt: Anfrage fehlerhaft: ' + helper.concatArray(errorMsgs));
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const kontaktDao = new KontaktDao(request.app.locals.dbConnection);
    try {
        var obj = kontaktDao.create(
            request.body.name.trim(),
            (request.body.phone || '').trim(),
            request.body.email.trim(),
            request.body.message.trim()
        );
        console.log('Service Kontakt: Datensatz eingefügt');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Kontakt: Fehler beim Anlegen des neuen Datensatzes. Exception: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;

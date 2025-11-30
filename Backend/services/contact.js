const helper = require('../helper.js');
const ContactDao = require('../dao/contactDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Kontakt');

// Create new contact entry
serviceRouter.post('/contact', function(request, response) {
    console.log('Service Kontakt: Client requested creation of new contact entry');

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
        console.log('Service Kontakt: Creation not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const contactDao = new ContactDao(request.app.locals.dbConnection);
    try {
        var obj = contactDao.create(
            request.body.name.trim(),
            (request.body.phone || '').trim(),
            request.body.email.trim(),
            request.body.message.trim()
        );
        console.log('Service Kontakt: Record inserted');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Kontakt: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;

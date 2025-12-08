const helper = require('../helper.js');
const TagesPizzaDao = require('../dao/tagespizzaDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service TagesPizza');

// Debug-Endpoint: Alle TagesPizzen
serviceRouter.get('/tagespizza/test', function(request, response) {
    console.log('Service TagesPizza: TEST - Client requested all daily pizzas');

    const tagespizzaDao = new TagesPizzaDao(request.app.locals.dbConnection);
    try {
        var arr = tagespizzaDao.loadAll();
        console.log('Service TagesPizza: TEST - Records loaded, count=' + arr.length);
        response.status(200).json({ debug: 'test endpoint', count: arr.length, data: arr });
    } catch (ex) {
        console.error('Service TagesPizza: TEST - Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message, 'stack': ex.stack });
    }
});

// Alle TagesPizzen laden
serviceRouter.get('/tagespizza/alle', function(request, response) {
    console.log('Service TagesPizza: Client requested all daily pizzas');

    const tagespizzaDao = new TagesPizzaDao(request.app.locals.dbConnection);
    try {
        var arr = tagespizzaDao.loadAll();
        console.log('Service TagesPizza: Records loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service TagesPizza: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

// TagesPizza nach ID laden
serviceRouter.get('/tagespizza/gib/:id', function(request, response) {
    console.log('Service TagesPizza: Client requested one record, id=' + request.params.id);

    const tagespizzaDao = new TagesPizzaDao(request.app.locals.dbConnection);
    try {
        var obj = tagespizzaDao.loadById(request.params.id);
        console.log('Service TagesPizza: Record loaded');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service TagesPizza: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

// TagesPizza nach Wochentag laden
serviceRouter.get('/tagespizza/tag/:tag', function(request, response) {
    console.log('Service TagesPizza: Client requested pizza for day=' + request.params.tag);

    const tagespizzaDao = new TagesPizzaDao(request.app.locals.dbConnection);
    try {
        var obj = tagespizzaDao.loadByTag(request.params.tag);
        console.log('Service TagesPizza: Record loaded for day=' + request.params.tag);
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service TagesPizza: Error loading record by tag. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;

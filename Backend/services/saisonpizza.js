const helper = require('../helper.js');
const SaisonPizzaDao = require('../dao/saisonpizzaDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service SaisonPizza');

// Alle SaisonPizzen laden
serviceRouter.get('/saisonpizza/alle', function(request, response) {
    console.log('Service SaisonPizza: Client requested all seasonal pizzas');

    const saisonpizzaDao = new SaisonPizzaDao(request.app.locals.dbConnection);
    try {
        var arr = saisonpizzaDao.loadAll();
        console.log('Service SaisonPizza: Records loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service SaisonPizza: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

// SaisonPizza nach ID laden
serviceRouter.get('/saisonpizza/gib/:id', function(request, response) {
    console.log('Service SaisonPizza: Client requested one record, id=' + request.params.id);

    const saisonpizzaDao = new SaisonPizzaDao(request.app.locals.dbConnection);
    try {
        var obj = saisonpizzaDao.loadById(request.params.id);
        console.log('Service SaisonPizza: Record loaded');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service SaisonPizza: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

// SaisonPizza nach Saison laden
serviceRouter.get('/saisonpizza/saison/:saison', function(request, response) {
    console.log('Service SaisonPizza: Client requested pizza for season=' + request.params.saison);

    const saisonpizzaDao = new SaisonPizzaDao(request.app.locals.dbConnection);
    try {
        var obj = saisonpizzaDao.loadBySaison(request.params.saison);
        console.log('Service SaisonPizza: Record loaded for season=' + request.params.saison);
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service SaisonPizza: Error loading record by season. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;

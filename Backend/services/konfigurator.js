const helper = require('../helper.js');
const KonfiguratorDao = require('../dao/konfiguratorDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Konfigurator');

// Alle Konfigurator-Komponenten laden
serviceRouter.get('/konfigurator/komponenten', function(request, response) {
    console.log('Service Konfigurator: Client requested all configurator components');

    const konfiguratorDao = new KonfiguratorDao(request.app.locals.dbConnection);
    try {
        var obj = konfiguratorDao.loadAllComponents();
        console.log('Service Konfigurator: Components loaded successfully');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Konfigurator: Error loading components. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

// Alle Größen laden
serviceRouter.get('/konfigurator/groessen', function(request, response) {
    console.log('Service Konfigurator: Client requested all sizes');

    const konfiguratorDao = new KonfiguratorDao(request.app.locals.dbConnection);
    try {
        var arr = konfiguratorDao.loadAllGroessen();
        console.log('Service Konfigurator: Sizes loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Konfigurator: Error loading sizes. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

// Alle Teigvarianten laden
serviceRouter.get('/konfigurator/teig', function(request, response) {
    console.log('Service Konfigurator: Client requested all dough types');

    const konfiguratorDao = new KonfiguratorDao(request.app.locals.dbConnection);
    try {
        var arr = konfiguratorDao.loadAllTeig();
        console.log('Service Konfigurator: Dough types loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Konfigurator: Error loading dough types. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

// Alle Saucenarten laden
serviceRouter.get('/konfigurator/sosse', function(request, response) {
    console.log('Service Konfigurator: Client requested all sauces');

    const konfiguratorDao = new KonfiguratorDao(request.app.locals.dbConnection);
    try {
        var arr = konfiguratorDao.loadAllSosse();
        console.log('Service Konfigurator: Sauces loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Konfigurator: Error loading sauces. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

// Alle Käsesorten laden
serviceRouter.get('/konfigurator/kaese', function(request, response) {
    console.log('Service Konfigurator: Client requested all cheeses');

    const konfiguratorDao = new KonfiguratorDao(request.app.locals.dbConnection);
    try {
        var arr = konfiguratorDao.loadAllKaese();
        console.log('Service Konfigurator: Cheeses loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Konfigurator: Error loading cheeses. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

// Alle Beläge laden
serviceRouter.get('/konfigurator/belag', function(request, response) {
    console.log('Service Konfigurator: Client requested all toppings');

    const konfiguratorDao = new KonfiguratorDao(request.app.locals.dbConnection);
    try {
        var arr = konfiguratorDao.loadAllBelag();
        console.log('Service Konfigurator: Toppings loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Konfigurator: Error loading toppings. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

// Neue Konfiguration anlegen
serviceRouter.post('/konfigurator/konfiguration', function(request, response) {
    console.log('Service Konfigurator: Client requested to create a configuration');

    const body = request.body || {};
    const bezeichnung = body.bezeichnung;
    const beschreibung = body.beschreibung;
    const konfigurationJson = body.konfiguration || body.konfiguration_json;
    const nettoPreis = body.netto_preis;

    const konfiguratorDao = new KonfiguratorDao(request.app.locals.dbConnection);
    try {
        const obj = konfiguratorDao.createKonfiguration(konfigurationJson, bezeichnung, beschreibung, nettoPreis);
        console.log('Service Konfigurator: Configuration created with id=' + obj.id);
        response.status(201).json(obj);
    } catch (ex) {
        console.error('Service Konfigurator: Error creating configuration. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;

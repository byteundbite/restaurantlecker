const helper = require('../helper.js');
const BestellungDao = require('../dao/bestellungDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Bestellung');

/**
 * POST /api/bestellung
 * Erstelle eine neue Bestellung
 * 
 * Body:
 * {
 *   "kunde": { "name", "street", "zip", "city", "email", "phone" },
 *   "items": [ { "text", "qty", "total", "components": {...} } ],
 *   "orderNote": "...",
 *   "asap": true/false,
 *   "deliveryDateTime": "2025-12-10T14:00",
 *   "net": 25.00,
 *   "shipping": 2.00,
 *   "vat": 5.13,
 *   "total": 32.13
 * }
 */

serviceRouter.post('/bestellung', function(request, response) {
    console.log('Service Bestellung: Client requested to create order');

    const body = request.body || {};
    const kunde = body.kunde || {};
    const items = body.items || [];
    const orderNote = body.orderNote || '';
    const asap = body.asap || false;
    const deliveryDateTime = body.deliveryDateTime || null;
    const net = body.net || 0;
    const shipping = body.shipping || 0;
    const vat = body.vat || 0;
    const total = body.total || 0;

    const bestellungDao = new BestellungDao(request.app.locals.dbConnection, request.app.locals.timezone);

    try {
        // Validierungen
        if (!kunde.name || !kunde.street || !kunde.zip || !kunde.city || !kunde.email) {
            console.warn('Service Bestellung: Incomplete customer data');
            return response.status(400).json({
                fehler: true,
                nachricht: 'Kundendaten sind unvollständig (Name, Straße, PLZ, Stadt, E-Mail erforderlich)'
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            console.warn('Service Bestellung: Empty cart');
            return response.status(400).json({
                fehler: true,
                nachricht: 'Warenkorb ist leer'
            });
        }

        // Erstelle die Bestellung
        const orderResult = bestellungDao.createOrder(
            kunde,
            items,
            orderNote,
            asap,
            deliveryDateTime,
            net,
            shipping,
            vat,
            total
        );

        console.log('Service Bestellung: Order created successfully with id=' + orderResult.orderId + ' (' + orderResult.bestellnummer + ')');
        
        response.status(201).json({
            fehler: false,
            nachricht: 'Bestellung erfolgreich gespeichert',
            orderId: orderResult.orderId,
            bestellnummer: orderResult.bestellnummer,
            configIds: orderResult.configIds
        });

    } catch (ex) {
        console.error('Service Bestellung: Error creating order. Exception: ' + ex.message);
        response.status(400).json({
            fehler: true,
            nachricht: ex.message
        });
    }
});

/**
 * GET /api/bestellung/:orderId
 * Hole Bestelldetails
 */
serviceRouter.get('/bestellung/:orderId', function(request, response) {
    console.log('Service Bestellung: Client requested order details');

    const orderId = request.params.orderId;

    if (!helper.isNumeric(orderId)) {
        return response.status(400).json({
            fehler: true,
            nachricht: 'Ungültige Bestellungs-ID'
        });
    }

    const bestellungDao = new BestellungDao(request.app.locals.dbConnection, request.app.locals.timezone);

    try {
        const order = bestellungDao.getOrderById(orderId);

        if (!order) {
            return response.status(404).json({
                fehler: true,
                nachricht: 'Bestellung nicht gefunden'
            });
        }

        console.log('Service Bestellung: Order ' + orderId + ' retrieved successfully');
        response.status(200).json(order);

    } catch (ex) {
        console.error('Service Bestellung: Error retrieving order. Exception: ' + ex.message);
        response.status(400).json({
            fehler: true,
            nachricht: ex.message
        });
    }
});

/**
 * GET /api/bestellung/kunde/:email
 * Hole alle Bestellungen eines Kunden
 */
serviceRouter.get('/bestellung/kunde/:email', function(request, response) {
    console.log('Service Bestellung: Client requested orders for customer');

    const email = request.params.email;

    if (!email || email.length === 0) {
        return response.status(400).json({
            fehler: true,
            nachricht: 'E-Mail-Adresse erforderlich'
        });
    }

    const bestellungDao = new BestellungDao(request.app.locals.dbConnection, request.app.locals.timezone);

    try {
        const orders = bestellungDao.getOrdersByCustomerEmail(email);

        console.log('Service Bestellung: Retrieved ' + orders.length + ' orders for customer ' + email);
        response.status(200).json(orders);

    } catch (ex) {
        console.error('Service Bestellung: Error retrieving customer orders. Exception: ' + ex.message);
        response.status(400).json({
            fehler: true,
            nachricht: ex.message
        });
    }
});

module.exports = serviceRouter;

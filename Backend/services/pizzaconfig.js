const express = require("express");
var serviceRouter = express.Router();

const ProduktDao = require("../dao/produktDao.js");

console.log("- Service PizzaConfig");

serviceRouter.get("/pizza/config", function (request, response) {
    console.log("Service PizzaConfig: Client requested configuration data");

    const produktDao = new ProduktDao(request.app.locals.dbConnection);

    try {
        const produkte = produktDao.loadAll();

        // Struktur für JS / Frontend-Konfigurator
        const data = {
            size: {},
            dough: {},
            sauce: {},
            cheese: {},
            toppings: {},
            shippingFlat: 0
        };

        produkte.forEach((p) => {
            const cat = p.kategorie.bezeichnung;

            switch (cat) {
                case "Pizza Größe":
                    data.size[p.bezeichnung] = p.preis;
                    break;

                case "Pizza Teig":
                    data.dough[p.bezeichnung] = p.preis;
                    break;

                case "Pizza Soße":
                    data.sauce[p.bezeichnung] = p.preis;
                    break;

                case "Pizza Käse":
                    data.cheese[p.bezeichnung] = p.preis;
                    break;

                case "Pizza Belag":
                    data.toppings[p.bezeichnung] = p.preis;
                    break;

                case "Versand":
                    if (p.bezeichnung === "shippingFlat")
                        data.shippingFlat = p.preis;
                    break;
            }
        });

        console.log("Service PizzaConfig: OK - sending data");
        response.status(200).json(data);
    } catch (ex) {
        console.error("Service PizzaConfig: Error", ex.message);
        response.status(400).json({
            fehler: true,
            nachricht: ex.message,
        });
    }
});

module.exports = serviceRouter;

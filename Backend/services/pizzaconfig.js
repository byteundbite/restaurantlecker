// services/pizzaconfig.js
const express = require("express");
const router = express.Router();
const helper = require("../helper.js");

const ProduktDao = require("../dao/produktDao.js");
const ProduktkategorieDao = require("../dao/produktkategorieDao.js");

// Mapping für DB-Kategorie-Bezeichnungen -> Frontend-Schlüssel für scrript.js
const CATEGORY_MAP = {
    "Pizza Größe": "groesse",
    "Pizza Teig": "teig",
    "Pizza Soße": "sosse",
    "Pizza Käse": "kaese",
    "Pizza Belag": "belag",
    "Versandkosten": "versand",

    "Pizza des Tages": "produkt",
    "Saisonpizza": "produkt"
};

router.get("/pizzaconfig/load", (req, res) => {
    const db = req.app.locals.dbConnection;
    const produktDao = new ProduktDao(db);

    try {
        const allProducts = produktDao.loadAll();

        // produkt hinzugefügt – für script.js
        const grouped = {
            groesse: [],
            teig: [],
            sosse: [],
            kaese: [],
            belag: [],
            versand: [],
            produkt: []
        };

        for (const p of allProducts) {
            const catName = p.kategorie?.bezeichnung?.trim() || "";
            const key = CATEGORY_MAP[catName];

            if (key) {
                grouped[key].push({
                    id: p.id,
                    bezeichnung: p.bezeichnung,
                    beschreibung: p.beschreibung,
                    details: p.details,
                    kategorieId: p.kategorie.id,  //für daily/season detection
                    bruttopreis: p.bruttopreis !== undefined ? Number(p.bruttopreis) : null,
                    nettopreis: p.nettopreis !== undefined ? Number(p.nettopreis) : null,
                    rabatt: p.rabatt !== undefined ? Number(p.rabatt) : 0,
                    bilder: p.bilder || [],
                    mehrwertsteuer: p.mehrwertsteuer ? p.mehrwertsteuer.steuerSatz : null
                });
            }
        }

        res.json({
            erfolg: true,
            daten: grouped
        });

    } catch (err) {
        console.error("pizzaconfig/load error:", err);
        res.status(500).json({
            erfolg: false,
            fehler: err.message
        });
    }
});

module.exports = router;

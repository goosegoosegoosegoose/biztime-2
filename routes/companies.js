const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async (req, res) => {
    const result = await db.query(
        `SELECT code, name 
         FROM companies`
    );
    return res.json({companies: result.rows});
});

router.get("/:code", async (req, res, next) => {
    try {
        const ccode = req.params.code;
        const result = await db.query(
            `SELECT *
             FROM companies
             LEFT JOIN invoices
             ON companies.code = invoices.comp_code
             WHERE code=$1`, [ccode]
        );

        if (Object.keys(result.rows).length === 0){
            throw new ExpressError("Company not found", 404);
        };

        const { code, name, description } = result.rows[0]
        const invoices = []
        if (result.rows[0].id) {
            for ( let i = 0; i < Object.keys(result.rows).length; i++) {
                invoices.push({
                    id: result.rows[i].id,
                    amt: result.rows[i].amt,
                    paid: result.rows[i].paid,
                    add_date: result.rows[i].add_date,
                    paid_date: result.rows[i].paid_date
                })
            };
        };
        return res.send({company: {code, name, description, invoices}});
    } catch (e){
        return next(e);
    };
});

router.post("/", async (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0) {
            throw new ExpressError("Entries required", 404);
        };

        const { code, name, description } = req.body;

        const result = await db.query(
            `INSERT INTO companies (code, name, description)
             VALUES ($1, $2, $3)
             RETURNING code, name, description`, [code, name, description]
        );

        return res.status(201).json({company: result.rows[0]})
    } catch (e) {
        return next(e)
    };
});

router.patch("/:code", async (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0) {
            throw new ExpressError("Entries required", 404);
        };

        const code = req.params.code;
        const { name, description } = req.body;

        const result = await db.query(
            `UPDATE companies SET name=$1, description=$2
             WHERE code=$3
             RETURNING code, name, description`, [name, description, code] 
        );

        if (Object.keys(result.rows).length === 0){
            throw new ExpressError("Company not found", 404);
        };

        return res.status(200).json({company: result.rows[0]});
    } catch (e) {
        return next(e);
    };
});

router.delete("/:code", async (req, res, next) => {
    try {
        const code = req.params.code;
        
        const codeSelect = await db.query(
            `SELECT code
            FROM companies
            WHERE code=$1`, [code]
        );
        if (codeSelect.rows.length === 0){
            throw new ExpressError("Company not found", 404);
        };
        
        const result = await db.query(
            `DELETE FROM companies WHERE code=$1`, [code]
        );

        return res.json({status: "deleted"});
    } catch (e) {
        return next(e)
    }
});

module.exports = router;
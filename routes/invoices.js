const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async (req, res) => {
    const result = await db.query(
        `SELECT id, comp_code 
         FROM invoices`
    );
        
    return res.json({invoices: result.rows});
});

router.get("/:id", async (req, res, next) => {
    try {
        const iid = req.params.id;
        const result = await db.query(
            `SELECT *
             FROM invoices
             LEFT JOIN companies
             ON invoices.comp_code = companies.code
             WHERE id=$1`, [iid]
        );

        if (Object.keys(result.rows).length === 0){
            throw new ExpressError("Invoice not found", 404);
        };

        const { id, amt, paid, add_date, paid_date, code, name, description } = result.rows[0]

        return res.json({invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}});
    } catch (e){
        return next(e);
    };
});

router.post("/", async (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0) {
            throw new ExpressError("Entries required", 404);
        };

        const { comp_code, amt } = req.body;

        const result = await db.query(
            `INSERT INTO invoices (comp_code, amt)
             VALUES ($1, $2)
             RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]
        );

        return res.status(201).json({invoice: result.rows[0]})
    } catch (e) {
        return next(e)
    };
});

router.patch("/:id", async (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0) {
            throw new ExpressError("Entries required", 404);
        };

        const id = req.params.id;
        const { amt, paid } = req.body;
        let result;
        if (paid) {
            result = await db.query(
                `UPDATE invoices SET amt=$1, paid=$2, paid_date=CURRENT_DATE
                WHERE id=$3
                RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, paid, id] 
            )
        } else {
            result = await db.query(
                `UPDATE invoices SET amt=$1, paid=$2, paid_date=Null
                WHERE id=$3
                RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, paid, id] 
            )
        };

        if (Object.keys(result.rows).length === 0){
            throw new ExpressError("Company not found", 404);
        };

        return res.status(200).json({invoice: result.rows[0]});
    } catch (e) {
        return next(e);
    };
});

router.delete("/:id", async (req, res, next) => {
    try {
        const id = req.params.id;

        const idSelect = await db.query(
            `SELECT id
            FROM invoices
            WHERE id=$1`, [id]
        );
        if (idSelect.rows.length === 0){
            throw new ExpressError("Invoice not found", 404);
        };
    
        const result = await db.query(
            `DELETE FROM invoices WHERE id=$1`, [id]
        );

        return res.json({status: "deleted"});
    } catch (e) {
        return next(e)
    }
})

module.exports = router;
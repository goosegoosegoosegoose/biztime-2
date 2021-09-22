const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");
const slugify = require("slugify");

router.get("/", async (req, res) => {
    const result = await db.query(
        `SELECT i.name, STRING_AGG(c.code, ', ') AS comp_codes
        FROM industries AS i
        LEFT JOIN markets AS m
        ON i.code = m.ind_code
        LEFT JOIN companies AS c
        ON m.comp_code = c.code
        GROUP BY i.name`
    );

    return res.json({industries: result.rows});
});

router.post("/", async (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0) {
            throw new ExpressError("Entries required", 404);
        };

        const { name } = req.body;
        const code = slugify(name, {lower: true, strict: true});

        const result = await db.query(
            `INSERT INTO industries (code, name)
            VALUES ($1, $2)
            RETURNING code, name`, [code, name]
        );

        return res.status(201).json({industry: result.rows[0]});
    } catch (e) {
        return next(e)
    }
});

router.post("/:code", async (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0) {
            throw new ExpressError("Entries required", 404);
        };

        const ind_code = req.params.code;
        const { comp_code } = req.body;
        
        const result = await db.query(
            `INSERT INTO markets (comp_code, ind_code)
            VALUES ($1, $2)
            RETURNING comp_code, ind_code`, [comp_code, ind_code]
        );

        return res.json({market: result.rows[0]})
    } catch (e) {
        return next(e)
    }
})

module.exports = router;
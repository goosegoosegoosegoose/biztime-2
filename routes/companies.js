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
        const code = req.params.code;
        const result = await db.query(
            `SELECT *
             FROM companies
             WHERE code=$1`, [code]
        );

        if (Object.keys(result.rows).length === 0){
            throw new ExpressError("Company not found", 404);
        };

        return res.json({company: result.rows});
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
    const code = req.params.code;
    
    // const found = await db.query(
    //     `SELECT * 
    //     FROM companies
    //     WHERE code=$1
    //     RETURNING name`, [code]
    // );
    // if (Object.keys(found.rows).length === 0){
    //     throw new ExpressError("Company not found", 404);
    // };
    
    const result = await db.query(
        `DELETE FROM companies WHERE code=$1`, [code]
    );

    return res.json({status: "deleted"});
})
// why does assignment say to use put when we're not replacing everything
// how do i check for existence of code row? two awaits don't play nice

module.exports = router;
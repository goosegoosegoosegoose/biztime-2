process.env.NODE_ENV = "test";
const { text } = require("express");
const request = require("supertest");
const app = require("../app");
let db = require("../db");

let testCompany;
beforeEach(async() => {
    const company = await db.query(`
        INSERT INTO companies (code, name, description)
        VALUES ('fb', 'Facebook', 'test')
        RETURNING code, name, description
    `);
    const invoice = await db.query(`
        INSERT INTO invoices (id, comp_code, amt, paid, add_date, paid_date)
        VALUES ('1', 'fb', 200, false, CURRENT_DATE, null)
        RETURNING id, comp_code, amt, paid, add_date, paid_date
    `);
    testCompany = company.rows[0];
    testInvoice = invoice.rows[0];
});

afterEach(async() => {
    await db.query(`DELETE FROM companies CASCADE`)

});

afterAll(async() => {
    await db.end()
});

describe("GET /invoices", () => {
    test("Gets list of invoices", async () => {
        const  {id, comp_code} = testInvoice;
        const res = await request(app).get("/invoices");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({invoices: [{id, comp_code}]});
    })
});

describe("GET /invoices/:id", () => {
    test("GETs one invoice", async () => {
        const {id, amt, paid, paid_date} = testInvoice;
        const res = await request(app).get(`/invoices/${id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({invoice: {id, amt, paid, add_date: expect.any(String), paid_date, company: testCompany}})
    });

    test("Responds with 404 for invalid id", async () => {
        const res = await request(app).get("/invoices/1900000000");

        expect(res.statusCode).toBe(404);
    })
});

describe("POST /invoices", () => {
    test("Post new invoice", async () => {
        const test = {comp_code: testCompany.code, amt: 100}
        const res = await request(app)
            .post("/invoices")
            .send(test);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({invoice: {id: expect.any(Number), comp_code: test.comp_code, amt: test.amt, paid: false, add_date: expect.any(String), paid_date: null}});
    })
});

describe("PUT/PATCH /invoices/:id", () => {
    test("Change amount of invoice", async () => {
        const {id, comp_code, paid, add_date, paid_date} = testInvoice;
        const amt = 10;
        const res = await request(app)
            .patch(`/invoices/${id}`)
            .send({ amt });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({invoice: {id, comp_code, amt, paid, add_date: expect.any(String), paid_date}})
    });

    test("Responds with 404 for invalid id", async () => {
        const res = await request(app).patch("/invoices/190000000000");

        expect(res.statusCode).toBe(404)
    })  
});

describe("DELETE /invoice/:id", () => {
    test("Deletes the invoice", async () => {
        const { id } = testInvoice;
        const res = await request(app).delete(`/invoices/${id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: "deleted" })
    });

    test("Responds with 404 for invalid id", async () => {
        const res = await request(app).delete("/invoices/190000");

        expect(res.statusCode).toBe(404)
    })
});
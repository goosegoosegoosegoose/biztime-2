process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
let db = require("../db");
const slugify = require("slugify");

let testCompany;
beforeEach(async() => {
    const result = await db.query(`
        INSERT INTO companies (code, name, description)
        VALUES ('fb', 'Facebook', 'test')
        RETURNING code, name, description
    `);
    testCompany = result.rows[0];
});

afterEach(async() => {
    await db.query(`DELETE FROM companies`)
});

afterAll(async() => {
    await db.end()
});

describe("GET /companies", () => {
    test("Gets list of companies", async () => {
        const  {code, name} = testCompany;
        const res = await request(app).get("/companies");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({companies: [{code, name}]});
    })
});

describe("GET /companies/:code", () => {
    test("GETs one company", async () => {
        const {code, name, description} = testCompany;
        const res = await request(app).get(`/companies/${code}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company: {code, name, description, invoices: []}})
    })

    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).get("/companies/invalid");

        expect(res.statusCode).toBe(404);
    })
});

describe("POST /companies", () => {
    test("Post new company", async () => {
        const test = {name: "test TEST", description:"test"};
        const slug = slugify(test.name, {lower: true, strict: true});
        const res = await request(app)
            .post("/companies")
            .send(test);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({company: {code: slug, name: test.name, description: test.description}});
    })
});

describe("PUT/PATCH /companies/:code", () => {
    test("Change name of company", async () => {
        const {code, description} = testCompany;
        const name = "bookFace"
        const res = await request(app)
            .patch(`/companies/${code}`)
            .send({ name, description });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company: {code, name, description}})
    })

    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).patch("/companies/invalid");

        expect(res.statusCode).toBe(404)
    })  
});

describe("DELETE /companies/:code", () => {
    test("Deletes the company", async () => {
        const { code } = testCompany;
        const res = await request(app).delete(`/companies/${code}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: "deleted" })
    })

    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).delete("/companies/test");

        expect(res.statusCode).toBe(404)
    })
});
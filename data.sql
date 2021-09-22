\c biztime

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
  code text PRIMARY KEY,
  name text NOT NULL UNIQUE
);

CREATE TABLE markets (
  comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
  ind_code text NOT NULL REFERENCES industries ON DELETE CASCADE
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.'),
         ('boeing', 'Boeing', 'Airplanes and missiles'),
         ('walmart', 'Walmart', 'Food?'),
         ('cvs-health', 'CVS Health', 'Pills');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

INSERT INTO industries
  VALUES ('computer-hardware', 'Computer Hardware'),
         ('computer-software', 'Computer Software'),
         ('aerospace', 'Aerospace'),
         ('retail', 'Retail'),
         ('pharmaceuticals', 'Pharmaceuticals');

INSERT INTO markets
  VALUES ('apple', 'computer-hardware'),
         ('apple', 'computer-software'),
         ('apple', 'retail'),
         ('ibm', 'computer-software'),
         ('ibm', 'aerospace'),
         ('boeing', 'computer-software'),
         ('boeing', 'aerospace'),
         ('walmart', 'retail'),
         ('walmart', 'pharmaceuticals'),
         ('cvs-health', 'retail'),
         ('cvs-health', 'pharmaceuticals');


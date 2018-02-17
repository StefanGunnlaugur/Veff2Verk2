const express = require('express');
const json2csv = require('json2csv');
const { Client } = require('pg');

const router = express.Router();
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:ste123@localhost/examples';

async function fetchNotes() {
  const client = new Client({ connectionString });
  await client.connect();
  const result = await client.query('SELECT * FROM notes');
  await client.end();

  return result.rows;
}

function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/login');
}

router.get('/admin', ensureLoggedIn, async (req, res) => {
  const data = await fetchNotes();
  res.render('admin', { data });
});

router.get('/downloads', ensureLoggedIn, async (req, res) => {
  const myData = await fetchNotes();

  const field = ['id', 'dags', 'name', 'email', 'ssn', 'fjoldi'];
  try {
    const result = json2csv({ data: myData, fields: field });
    const filename = 'download.csv';
    res.setHeader('Content-Type', 'text/csv');
    res.set('Content-Disposition', `attachment; filename="${filename}"`);
    const s = result.replace(/,/g, ';');
    res.send(s);
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;

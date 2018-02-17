const express = require('express');
const { check, validationResult } = require('express-validator/check');

const { Client } = require('pg');

const xss = require('xss');

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:ste123@localhost/examples';
const router = express.Router();
router.use(express.urlencoded({ extended: true }));

async function addNote(name, email, ssn, count) {
  const client = new Client({ connectionString });
  await client.connect();
  await client.query('INSERT INTO notes (name, email, ssn, fjoldi) VALUES ($1, $2, $3, $4)', [name, email, ssn, count]);
  await client.end();
}

function form(req, res) {
  const data = {
    name: '', email: '', ssn: '', fjoldi: '',
  };
  res.render('form', { data });
}

router.get('/', form);

router.post(
  '/post',

  // Þetta er bara validation! Ekki sanitization
  check('name').isLength({ min: 1 }).withMessage('Nafn má ekki vera tómt'),
  check('email').isLength({ min: 1 }).withMessage('Netfang má ekki vera tómt'),
  check('email').isEmail().withMessage('Netfang verður að vera netfang'),
  check('ssn').isLength({ min: 1 }).withMessage('Kennitala má ekki vera tóm'),
  check('ssn').matches(/^[0-9]{6}-?[0-9]{4}$/).withMessage('Kennitala verður að vera á formi 000000-0000'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(i => i.msg);
      if (req.isAuthenticated()) {
        return res.render('form', {
          linkur: 'logout',
          notandi: `Innskráður sem ${req.user.username}`,
          skra: 'Útskrá',
          villur:
        `p>Villur:</p>
        <ul>
          <li>${errorMessages.join('</li><li>')}</li>
        </ul`,
        });
      }
      return res.render('form', {
        linkur: 'login',
        notandi: '',
        skra: 'Innskrá',
        villur:
      `p>Villur:</p>
      <ul>
        <li>${errorMessages.join('</li><li>')}</li>
      </ul`,
      });
    }

    const name = xss(req.body.name);
    const email = xss(req.body.email);
    const ssn = xss(req.body.ssn);
    const count = xss(req.body.fjoldi);

    await addNote(name, email, ssn, count);

    return res.render('thanks', {});
  },
);

module.exports = router;

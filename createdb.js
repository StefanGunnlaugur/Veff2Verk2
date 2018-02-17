const { Client } = require('pg');
const fs = require('fs');
const util = require('util');

const readFileAsync = util.promisify(fs.readFile);

const schemaFile = './schema.sql';
const connectionString = process.env.DATABASE_URL || 'postgres://:@localhost/notes';

async function create() {
  const data = await readFileAsync(schemaFile);

  const client = new Client({ connectionString });
  await client.connect();
  const result = await client.query(data.toString('utf-8')); //eslint-disable-line
  await client.end();

  console.info('Schema created');
}

create().catch((err) => {
  console.error(err);
});

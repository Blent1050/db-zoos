const express = require('express');
const helmet = require('helmet');
const knex = require('knex');

const knexConfig = {
  client: 'sqlite3',
  useNullAsDefault: true, //Needed for sqlite
  connection: {
    filename: './data/lambda.db3',
  },
};

const db = knex(knexConfig);

const server = express();

server.use(helmet());
server.use(express.json());

// endpoints here
server.get('/api/zoos', async (req, res) => {
  try {
    const zoos = await db('zoos');

    res.status(200).json(zoos);
  } catch (error) {
    res.status(500).json(error);
  }
});

server.get('/api/zoos/:id', async (req, res) => {
  try {
    const zoos = await db('zoos')
      .where({ id: req.params.id })
      .first();
    res.status(200).json(zoos);
  } catch (error) {
    res.status(500).json(error);
  }
});

server.post('/api/zoos', async (req, res) => {
  try {
    const [id] = await db('zoos').insert(req.body);

    const zoo = await db('zoos')
      .where({ id })
      .first();
    res.status(201).json(zoo);
  } catch (error) {
    const message = 'We ran into an issue';
    res.status(500).json({ message });
  }
});

//Update
server.put('/api/zoos/:id', async (req, res) => {
  try {
    const count = await db('zoos')
      .where({ id: req.params.id })
      .update(req.body);
    if (count) {
      const zoo = await db('zoos')
        .where({ id: req.params.id })
        .first();
      res.status(200).json(zoo);
    } else {
      res.status(404).json({ message: 'Record not found' });
    }
  } catch (error) {
    const message = errors[error.errno] || 'We ran into an issue';
    res.status(500).json({ message });
  }
});
//Delete
server.delete('/api/zoos/:id', async (req, res) => {
  try {
    const count = await db('zoos')
      .where({ id: req.params.id })
      .del();
    if (count) {
      res.status(200).end();
    } else {
      res.status(404).json({ message: 'Record not found' });
    }
  } catch (error) {
    const message = errors[error.errno] || 'We ran into an issue';
    res.status(500).json({ message });
  }
});
const port = 3300;
server.listen(port, function() {
  console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
});

const errors = {
  '19': 'Another record with that value exists',
};

const express = require('express');
const db = require('../db/init');
const router = express.Router();

router.get('/', async (req, res) => {
  const result = await db.query('SELECT * FROM images ORDER BY "createdAt" DESC');
  res.json(result.rows);
});
module.exports = router;
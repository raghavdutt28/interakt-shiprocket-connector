require('dotenv').config();
const express = require('express');
const { extractPayload } = require('./utils');
const { enqueueSend }    = require('./sender');

// Ensure campaign exists (non‑blocking)
require('./campaign').getCampaignId().catch(console.error);

const app = express();
app.use(express.json());

/**
 * Shiprocket‑Fastrr may POST **one** abandoned‑cart object
 * _or_ an **array** of objects (when it batches entries).
 * We normalise to an array and process each entry in parallel
 * (still rate‑limited by the p‑limit wrapper in sender.js).
 */
app.post('/webhook', async (req, res) => {
  try {
    const entries = Array.isArray(req.body) ? req.body : [req.body];

    await Promise.all(entries.map((raw) => {
      const payload = extractPayload(raw);
      return enqueueSend(payload);        // p‑limit inside
    }));

    res.status(200).json({ sent: entries.length });
  } catch (err) {
    console.error(err);
    res.status(500).send('error');
  }
});

app.listen(process.env.PORT || 8080, () =>
  console.log('▶  Webhook listening on :' + (process.env.PORT || 8080))
);
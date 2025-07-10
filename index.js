import dotenv from'dotenv';
dotenv.config();
import express from'express';
import { extractPayload } from './utils.js';
import { enqueueSend }    from './sender.js';
import {getCampaignId} from './campaign.js';
getCampaignId().catch(console.error);

const app = express();
app.use(express.json());


app.post('/webhook', async (req, res) => {
  try {
    const entries = Array.isArray(req.body) ? req.body : [req.body];

    await Promise.all(entries.map((raw) => {
      const payload = extractPayload(raw);
      return enqueueSend(payload);        
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
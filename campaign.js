const fs   = require('fs');
const fetch = require('node-fetch');

const ID_FILE = 'campaign-id.txt';
const AUTH_HEADER = 'Basic ' + process.env.INTERAKT_API_KEY;
const ROOT = 'https://api.interakt.ai/v1/public';

// Hard‑coded campaign name
async function createCampaign() {
  const body = {
    campaign_name: 'abandoned_30',   // ← fixed name
    campaign_type: 'PublicAPI',
    template_name: process.env.INTERAKT_TEMPLATE_NAME,
    language_code: process.env.INTERAKT_LANGUAGE || 'en'
  };

  const res = await fetch(`${ROOT}/create-campaign/`, {
    method: 'POST',
    headers: { Authorization: AUTH_HEADER, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`create-campaign ${res.status}: ${txt}`);
  }
  const { data } = await res.json();
  fs.writeFileSync(ID_FILE, data.campaign_id, 'utf8');
  console.log('▶  Created API campaign (abandoned_30):', data.campaign_id);
  return data.campaign_id;
}

module.exports.getCampaignId = async () => {
  if (fs.existsSync(ID_FILE)) return fs.readFileSync(ID_FILE, 'utf8').trim();
  return await createCampaign();
};
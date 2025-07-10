import fs from 'fs';
import fetch from 'node-fetch';

const ID_FILE = 'campaign-id.txt';
const AUTH_HEADER = 'Basic '+ process.env.INTERAKT_API_KEY;
const ROOT = 'https://api.interakt.ai/v1/public';


async function createCampaign() {
  const body = {
    campaign_name: 'abandoned_30',   
    campaign_type: 'PublicAPI',
    template_name: process.env.INTERAKT_TEMPLATE_NAME,
    language_code: process.env.INTERAKT_LANGUAGE || 'en'
  };
  console.log('Sending create-campaign payload:', body);


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

export const getCampaignId = async () => {
  if (fs.existsSync(ID_FILE)) return fs.readFileSync(ID_FILE, 'utf8').trim();
  return await createCampaign();
};
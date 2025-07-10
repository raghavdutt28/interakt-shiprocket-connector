import fetch  from 'node-fetch';
import pLimit from 'p-limit';
import { getCampaignId } from './campaign.js';

const API_URL    = 'https://api.interakt.ai/v1/public/message/';
const AUTH_HEADER = 'Basic ' + process.env.INTERAKT_API_KEY;
const RPM        = Number(process.env.INTERAKT_MAX_RPM || 280);
const limiter    = pLimit(RPM);

async function sendWhatsApp(evt) {
  const campaignId = await getCampaignId();

  const payload = {
    countryCode: evt.countryCode,
    phoneNumber: evt.phoneNumber,
    campaignId,
    type: 'Template',
    template: {
      name: process.env.INTERAKT_TEMPLATE_NAME,
      languageCode: process.env.INTERAKT_LANGUAGE,
      headerValues: [evt.headerImageUrl],
      bodyValues: [evt.name, evt.productName, evt.discount, evt.finalPrice],
      buttonValues: { '0': ["MYCART"],"1": [evt.cartUrl] }  
    }
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { Authorization: AUTH_HEADER, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Interakt ${res.status}: ${await res.text()}`);
}

export const enqueueSend = (evt) => limiter(() => sendWhatsApp(evt));
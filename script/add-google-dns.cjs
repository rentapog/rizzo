// Usage: node add-google-dns.js
// This script adds missing Google Workspace DNS records to your Cloudflare zone.
// It only adds records if they do not already exist.

const fetch = require('node-fetch');
require('dotenv').config();

const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const BASE = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`;

const GOOGLE_MX = [
  { priority: 1, value: 'ASPMX.L.GOOGLE.COM.' },
  { priority: 5, value: 'ALT1.ASPMX.L.GOOGLE.COM.' },
  { priority: 5, value: 'ALT2.ASPMX.L.GOOGLE.COM.' },
  { priority: 10, value: 'ALT3.ASPMX.L.GOOGLE.COM.' },
  { priority: 10, value: 'ALT4.ASPMX.L.GOOGLE.COM.' },
];
const SPF = 'v=spf1 include:_spf.google.com ~all';
const DMARC = 'v=DMARC1; p=none; rua=mailto:sales@rentapog.com';

async function getRecords() {
  const res = await fetch(BASE, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  const data = await res.json();
  return data.result;
}

async function addRecord(record) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(record),
  });
  return res.json();
}

(async () => {
  const records = await getRecords();
  // Add MX records
  for (const mx of GOOGLE_MX) {
    const exists = records.some(r => r.type === 'MX' && r.content === mx.value && r.priority === mx.priority);
    if (!exists) {
      console.log(`Adding MX: ${mx.value} (priority ${mx.priority})`);
      await addRecord({
        type: 'MX',
        name: '@',
        content: mx.value,
        priority: mx.priority,
        ttl: 3600,
      });
    }
  }
  // Add SPF TXT
  const spfExists = records.some(r => r.type === 'TXT' && r.name === '@' && r.content === SPF);
  if (!spfExists) {
    console.log('Adding SPF TXT');
    await addRecord({
      type: 'TXT',
      name: '@',
      content: SPF,
      ttl: 3600,
    });
  }
  // Add DMARC TXT
  const dmarcExists = records.some(r => r.type === 'TXT' && r.name === '_dmarc' && r.content === DMARC);
  if (!dmarcExists) {
    console.log('Adding DMARC TXT');
    await addRecord({
      type: 'TXT',
      name: '_dmarc',
      content: DMARC,
      ttl: 3600,
    });
  }
  console.log('Done. Only missing records were added.');
})();

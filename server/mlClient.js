const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const ML_URL = process.env.ML_URL || 'http://localhost:5005/predict';

async function predictPhishing(url) {
  try {
    const res = await fetch(ML_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    if (!res.ok) return { phishing: false, score: 0 };
    return await res.json();
  } catch (e) {
    return { phishing: false, score: 0 };
  }
}

module.exports = { predictPhishing };

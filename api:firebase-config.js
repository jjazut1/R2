// api/firebase-config.js

  export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.r2process.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end(); // Handle preflight requests
    }

    res.status(200).json({ message: 'CORS fixed!' });
}

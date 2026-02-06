const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

const VALID_KEYS = {
    'STARTER-123': { plan: 'STARTER', limit: 500 },
    'PRO-456': { plan: 'PRO', limit: 2000 },
    'AGENCY-789': { plan: 'AGENCY', limit: 10000 }
};

app.post('/validate', (req, res) => {
    const { key } = req.body;
    console.log(`Validation request for key: ${key}`);

    if (VALID_KEYS[key]) {
        res.json({
            success: true,
            plan: VALID_KEYS[key].plan,
            limit: VALID_KEYS[key].limit,
            expires: '2026-12-31'
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid license key'
        });
    }
});

app.listen(port, () => {
    console.log(`License Backend listening at http://localhost:${port}`);
});

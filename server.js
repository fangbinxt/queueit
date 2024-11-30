const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

// Configure CORS
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// Proxy endpoint
app.post('/api/proxy', async (req, res) => {
    const { url } = req.body;
    const startTime = Date.now();
    
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/json,*/*'
            }
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        const data = await response.text();

        res.json({
            success: response.ok,
            status: response.status,
            responseTime,
            timestamp: new Date().toISOString(),
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
}); 
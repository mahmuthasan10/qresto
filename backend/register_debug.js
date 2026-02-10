const http = require('http');

const data = JSON.stringify({
    name: "Demo Restaurant",
    email: "demo@qresto.com",
    password: "demo123",
    phone: "5551234567",
    latitude: 41.0082,
    longitude: 28.9784
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();

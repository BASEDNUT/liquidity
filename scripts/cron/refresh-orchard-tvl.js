#!/usr/bin/env node
// Hits the refresh endpoint to prime the Orchard TVL cache.
// Env: ORCHARD_REFRESH_URL (e.g., https://yourapp.vercel.app/api/orchard-tvl/refresh)
//      CRON_REFRESH_TOKEN

const https = require('https');
const url = require('url');

const endpoint = process.env.ORCHARD_REFRESH_URL;
const token = process.env.CRON_REFRESH_TOKEN;

if (!endpoint || !token) {
	console.error('Missing ORCHARD_REFRESH_URL or CRON_REFRESH_TOKEN');
	process.exit(1);
}

const { hostname, pathname, protocol, port } = url.parse(endpoint);
const opts = {
	hostname,
	port: port || (protocol === 'https:' ? 443 : 80),
	path: pathname,
	method: 'POST',
	headers: {
		'Authorization': `Bearer ${token}`,
		'Content-Type': 'application/json',
	},
};

const req = https.request(opts, (res) => {
	let body = '';
	res.on('data', (c) => (body += c));
	res.on('end', () => {
		if (res.statusCode >= 200 && res.statusCode < 300) {
			console.log('Refresh OK:', body);
			process.exit(0);
		} else {
			console.error(`Refresh failed ${res.statusCode}:`, body);
			process.exit(2);
		}
	});
});
req.on('error', (e) => {
	console.error('Request error:', e.message);
	process.exit(3);
});
req.end();

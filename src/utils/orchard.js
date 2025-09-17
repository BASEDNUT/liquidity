// Normalizes n8n/Airtable webhook outputs to a stable shape for the UI.
// Contract:
// Input may be:
// - An array with one Airtable record object containing fields like:
//     'Project Total TVL', 'Total Unique Assets (Project Level)', 'Total Unique Pools (Project Level)',
//     'Last Modified', 'Volume 24hrs (from Pools 2)', 'Price Change 24hrs (from Pools)'
// - Or an object already in the normalized shape
// Output shape:
//   { tvl, assets, pools, timestamp, volume24hTotal, priceChange24hAvg }

function safeNumber(n, d = 0) {
	const v = Number(n);
	return Number.isFinite(v) ? v : d;
}

function sum(arr) {
	if (!Array.isArray(arr)) return 0;
	return arr.reduce((a, b) => a + (Number.isFinite(Number(b)) ? Number(b) : 0), 0);
}

function avg(arr) {
	if (!Array.isArray(arr) || arr.length === 0) return 0;
	const nums = arr.map((x) => Number(x)).filter((x) => Number.isFinite(x));
	if (nums.length === 0) return 0;
	return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function normalizeFromAirtableRecord(rec) {
	const tvl = safeNumber(rec['Project Total TVL']);
	const assets = safeNumber(rec['Total Unique Assets (Project Level)']);
	const pools = safeNumber(rec['Total Unique Pools (Project Level)']);
	const timestamp = rec['Last Modified'] || rec.createdTime || new Date().toISOString();
	const vol24 = sum(rec['Volume 24hrs (from Pools 2)']);
	const priceAvg = avg(rec['Price Change 24hrs (from Pools)']);
	return { tvl, assets, pools, timestamp, volume24hTotal: vol24, priceChange24hAvg: priceAvg };
}

function pickFirst(arr) {
    return Array.isArray(arr) && arr.length > 0 ? arr[0] : undefined;
}

function extractAirtableRecord(payload) {
    // Try direct array from n8n: [ { json: { fields: {...} } } ]
    if (Array.isArray(payload) && payload.length) {
        const first = payload[0];
        if (first && typeof first === 'object') {
            if (first.json && typeof first.json === 'object') {
                if (first.json.fields && typeof first.json.fields === 'object') return first.json.fields;
                // Some nodes may map fields at json root
                if (first.json['Project Total TVL']) return first.json;
            }
            if (first.fields && typeof first.fields === 'object') return first.fields;
            // Direct record
            if (first['Project Total TVL']) return first;
        }
    }

    // Try wrapped shapes
    if (payload && typeof payload === 'object') {
        // { data: [...] }
        if (Array.isArray(payload.data)) {
            const e = extractAirtableRecord(payload.data);
            if (e) return e;
        }
        // { records: [ { fields: {...} } ] } or { records: [ directRecord ] }
        if (Array.isArray(payload.records)) {
            const r0 = pickFirst(payload.records);
            if (r0) {
                if (r0.fields && typeof r0.fields === 'object') return r0.fields;
                if (r0['Project Total TVL']) return r0;
            }
        }
        // { json: { fields: {...} } }
        if (payload.json && typeof payload.json === 'object') {
            if (payload.json.fields && typeof payload.json.fields === 'object') return payload.json.fields;
            if (payload.json['Project Total TVL']) return payload.json;
        }
        // { fields: {...} }
        if (payload.fields && typeof payload.fields === 'object') return payload.fields;
        // Direct record object
        if (payload['Project Total TVL']) return payload;
    }

    return null;
}

function normalizePayload(payload) {
	try {
		// Already normalized
		if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
			if (
				Object.prototype.hasOwnProperty.call(payload, 'tvl') &&
				Object.prototype.hasOwnProperty.call(payload, 'assets') &&
				Object.prototype.hasOwnProperty.call(payload, 'pools')
			) {
				const tvl = safeNumber(payload.tvl);
				const assets = safeNumber(payload.assets);
				const pools = safeNumber(payload.pools);
				const timestamp = payload.timestamp || new Date().toISOString();
				const volume24hTotal = safeNumber(payload.volume24hTotal);
				const priceChange24hAvg = safeNumber(payload.priceChange24hAvg);
				return { tvl, assets, pools, timestamp, volume24hTotal, priceChange24hAvg };
			}
		}

		// Extract from typical n8n/Airtable wrappers
		const rec = extractAirtableRecord(payload);
		if (rec) return normalizeFromAirtableRecord(rec);

		// Unknown shape: return zeroed structure with current timestamp
		return {
			tvl: 0,
			assets: 0,
			pools: 0,
			timestamp: new Date().toISOString(),
			volume24hTotal: 0,
			priceChange24hAvg: 0,
		};
	} catch (_) {
		return {
			tvl: 0,
			assets: 0,
			pools: 0,
			timestamp: new Date().toISOString(),
			volume24hTotal: 0,
			priceChange24hAvg: 0,
		};
	}
}

module.exports = { normalizePayload };

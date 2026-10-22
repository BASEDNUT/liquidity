import React from 'react';
import Link from 'next/link';
import { TokenMedal, NameRibbon, Twig } from './artwork/SpecimenGlyphs';
import styles from './Repair02.module.css';

// Field Guide specimen card for TOKENS (S126e) — same Repair 02 grammar as pool
// cards: kicker + serial, botanical artwork, facts row, actions. Replaces the old
// MUI TokenCard (replace, not augment).

const TYPE_BY_CATEGORY = {
  Root: 'ROOT',
  Ecosystem: 'BRANCH',
  Nested: 'SCION',
  External: 'SOIL',
};

function specimenType(token) {
  const tags = (token.tags || []).map((t) => t.toLowerCase());
  if (tags.includes('nft')) return 'COLLECTIBLE';
  if (tags.includes('graft')) return 'GRAFT';
  return TYPE_BY_CATEGORY[token.category] || 'BRANCH';
}

function priceParts(token) {
  // Ledger doctrine: GT > DS > CG > BAL, with class fallbacks.
  const fmt = (v) => {
    if (v == null || isNaN(v)) return null;
    return v >= 1 ? v.toFixed(4) : v.toFixed(6);
  };
  const parts = [];
  const md = token.marketData;
  if (md?.geckoTerminal?.price_usd != null) parts.push({ label: 'GT', value: fmt(md.geckoTerminal.price_usd) });
  if (md?.dexScreener?.priceUsd != null) parts.push({ label: 'DS', value: fmt(md.dexScreener.priceUsd) });
  if (md?.coinGecko?.price_usd != null) parts.push({ label: 'CG', value: fmt(md.coinGecko.price_usd) });
  if (md?.balancer?.bptPrice != null) parts.push({ label: 'BAL', value: fmt(md.balancer.bptPrice) });
  if (parts.length) return { parts, fallback: null };
  const name = (token.name || '').toLowerCase();
  const tags = (token.tags || []).map((t) => t.toLowerCase());
  let fallback;
  if (name === 'pnut' || tags.includes('index') || tags.includes('balancer')) fallback = 'Index (Balancer)';
  else if (tags.includes('bonding curve') || tags.includes('mintclub') || name === 'nutino' || name === 'salt') fallback = 'Bonding (MintClub)';
  else if (tags.includes('nft')) fallback = 'NFT (Mint Club)';
  else if (token.category === 'External') fallback = 'External asset';
  else fallback = '—';
  return { parts: [], fallback };
}

export default function TokenSpecimenCard({ token, index = 0 }) {
  const type = specimenType(token);
  const stagger = (index % 12) * 0.06;
  const floatDelay = (index % 7) * 0.65;
  const { parts, fallback } = priceParts(token);
  const priceText = fallback
    ? fallback
    : parts.map((p) => `$${p.value} (${p.label})`).join(' · ');
  const standard = (token.tags || []).slice(0, 2).join(' · ') || token.category || '—';
  const exchange = parts.length ? parts[0].label : (token.category === 'External' ? '—' : 'GT');
  const tradeHref = token.tradeLinks?.[0]?.url
    || token.pools?.[0]?.dexscreenerUrl
    || token.pools?.[0]?.url
    || `https://basescan.org/token/${token.address}`;
  return (
    <article
      className={`${styles['r02-card']} ${styles['r02-' + type.toLowerCase()] || ''}`}
      aria-label={`Specimen card for token ${token.name}`}
      style={{ animationDelay: `${stagger}s` }}
    >
      <div className={styles['r02-frame']}>
        <div className={styles['r02-kicker']}>
          <span>ORCHARD SPECIMEN · {type}</span>
          <span className={`${styles['r02-serial']} ${styles['r02-num']}`}>No. {String(index + 1).padStart(2, '0')}</span>
        </div>
        <h3>{token.name}</h3>
        <p className={styles['r02-flavor']}>{token.role}</p>
        <div className={styles['r02-art']} style={{ animationDelay: `${floatDelay}s` }}>
          <svg viewBox="0 0 460 145" className="r02-svg" role="img" aria-label={`${token.name} specimen artwork`} preserveAspectRatio="xMidYMid meet">
            <Twig x={230} y={110} scale={1.15} />
            <TokenMedal name={token.name} x={230} y={62} r={38} />
            <NameRibbon name={token.name} x={230} y={118} width={Math.max(72, token.name.length * 8 + 20)} />
          </svg>
        </div>
        <div className={styles['r02-facts']}>
          <div className={styles['r02-fact']}><small>Class</small><b>{token.category || '—'}</b></div>
          <div className={styles['r02-fact']}><small>Standard</small><b>{standard}</b></div>
          <div className={styles['r02-fact']}><small>Price</small><b>{priceText}</b></div>
          <div className={styles['r02-fact']}><small>Market</small><b>{exchange}</b></div>
        </div>
        <nav className={styles['r02-actions']} aria-label={`Actions for ${token.name}`}>
          <Link className={styles['r02-primary']} href={`/token/${token.id}`}>Full profile ↗</Link>
          <div className={styles['r02-secondary']}>
            <a href={tradeHref} target="_blank" rel="noopener noreferrer">Trade ↗</a>
            <a href={`https://basescan.org/token/${token.address}`} target="_blank" rel="noopener noreferrer">Contract ↗</a>
          </div>
        </nav>
      </div>
    </article>
  );
}

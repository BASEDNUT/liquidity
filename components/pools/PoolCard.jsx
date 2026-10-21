import React from 'react';
import PoolArtwork from './PoolArtwork';
import { STRUCTURE_LABELS, formatTVL } from '../../lib/pools/presentation';
import styles from './Repair02.module.css';

const TYPES = {concentrated:'BRANCH',pair:'BRANCH',bonding:'SCION',index:'WHORL',collectible:'COLLECTIBLE',graft:'GRAFT'};
export default function PoolCard({pool,index=0,marketData}) {
  // Live TVL preference: GeckoTerminal > DexScreener > MintClub (site ledger doctrine).
  const liveTvl = marketData?.geckoTerminal?.tvl ?? marketData?.dexScreener?.tvl ?? marketData?.mintClub?.tvl ?? null;
  const stagger = (index % 12) * 0.06;
  const floatDelay = (index % 7) * 0.65;
  return <article
    className={`${styles['r02-card']} ${styles['r02-'+pool.kind] || ''}`}
    aria-label={`${pool.name} on ${pool.platform}`}
    style={{ animationDelay: `${stagger}s` }}>
    <div className={styles['r02-frame']}>
      <div className={styles['r02-kicker']}><span>ORCHARD SPECIMEN · {TYPES[pool.kind]}</span><span className={`${styles['r02-serial']} ${styles['r02-num']}`}>No. {String(index+1).padStart(2,'0')}</span></div>
      <h3>{pool.name}</h3><p className={styles['r02-flavor']}>{pool.flavor}</p>
      <div style={{ animationDelay: `${floatDelay}s` }}><PoolArtwork pool={pool}/></div>
      <div className={styles['r02-facts']}>
        <div className={styles['r02-fact']}><small>Venue</small><b>{pool.platform}</b></div>
        <div className={styles['r02-fact']}><small>Structure</small><b>{STRUCTURE_LABELS[pool.kind]}</b></div>
        <div className={styles['r02-fact']}><small>Model</small><b><i className={`${styles['r02-dot']} ${styles[pool.status.toLowerCase()] || ''}`}/>{pool.status}</b></div>
        <div className={styles['r02-fact']}><small>TVL</small><b>{formatTVL(pool.tvl, liveTvl)}</b></div>
      </div>
      <nav className={styles['r02-actions']} aria-label={`Actions for ${pool.name}`}>
        <a className={styles['r02-primary']} href={pool.hrefs.pool} target="_blank" rel="noopener noreferrer">Explore pool ↗</a>
        <div className={styles['r02-secondary']}>
          <a href={pool.hrefs.contract} target="_blank" rel="noopener noreferrer">Contract ↗</a>
          <a href={pool.hrefs.explore} target="_blank" rel="noopener noreferrer">Chart ↗</a>
        </div>
      </nav>
    </div>
  </article>;
}

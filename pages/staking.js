import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Layout from '../components/Layout';

const StakingPage = () => {
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const saltAddress = '0x1EDe2AFC985F6D7aEb3F4c84B95A103c00D5dE81';

  const cardStyle = {
    background: 'linear-gradient(to bottom, rgba(205,127,50,0.05), #fff)',
    padding: '2rem',
    borderRadius: '1rem',
    border: '2px solid rgba(205,127,50,0.2)',
    transition: 'all 0.3s',
    boxSizing: 'border-box',
    overflow: 'hidden',
    wordWrap: 'break-word',
  };

  const activeBadge = {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#fff',
    background: 'linear-gradient(90deg, #CD7F32, #A67C52)',
    borderRadius: '9999px',
    marginLeft: '0.75rem',
    verticalAlign: 'middle',
    boxShadow: '0 2px 8px rgba(205,127,50,0.3)',
  };

  const btnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#CD7F32',
    color: '#fff',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    transition: 'background-color 0.3s ease',
    fontWeight: 700,
    fontSize: '1rem',
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <Layout>
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F3ED', fontFamily: 'Arial, sans-serif' }}>
        <Head>
          <title>Staking & Rewards | BASED NUT</title>
          <meta name="description" content="Stake NUT and MT on Mint Club to earn SALT, plus SALT airdrop history from the Great Nut War." />
        </Head>

        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '8rem 1.5rem 2rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#5D4037', marginBottom: '0.5rem' }}>
              🏰 Staking & Rewards
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'rgba(93,64,55,0.8)', maxWidth: '640px', margin: '0 auto', lineHeight: '1.6' }}>
              Stake your NUT or MT on Mint Club and earn SALT. Hold Orchard NFTs and taste the spoils of the Great Nut War.
            </p>
          </div>

          {/* ACTIVE STAKES */}
          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#5D4037', textAlign: 'center', marginBottom: '1rem' }}>
            🌱 Active Stakes
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>

            {/* Stake MT — Earn SALT */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#5D4037', flex: '1', marginRight: '1rem' }}>
                  Stake MT
                  <span style={activeBadge}>ACTIVE</span>
                </h3>
                <div style={{ width: '3rem', height: '3rem', backgroundColor: '#CD7F32', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem' }}>
                  🥜
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                Stake your MT and earn SALT as a reward. A live staking vault on Mint Club.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'rgba(93,64,55,0.7)' }}>Platform</span>
                  <span style={{ fontWeight: 'bold', color: '#5D4037' }}>Mint Club</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'rgba(93,64,55,0.7)' }}>Vault ID</span>
                  <span style={{ fontWeight: 'bold', color: '#5D4037' }}>217</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'rgba(93,64,55,0.7)' }}>Reward</span>
                  <span style={{ fontWeight: 'bold', color: '#A67C52' }}>SALT</span>
                </div>
              </div>
              <a href="https://mint.club/staking/base/217" target="_blank" rel="noopener noreferrer" className="button-effect" style={btnStyle}>
                Stake MT on Mint Club
              </a>
            </div>

            {/* Stake NUT — Earn SALT */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#5D4037', flex: '1', marginRight: '1rem' }}>
                  Stake NUT
                  <span style={activeBadge}>ACTIVE</span>
                </h3>
                <div style={{ width: '3rem', height: '3rem', backgroundColor: '#A67C52', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem' }}>
                  🌰
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                Stake your NUT and earn SALT as a reward. A live staking vault on Mint Club.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'rgba(93,64,55,0.7)' }}>Platform</span>
                  <span style={{ fontWeight: 'bold', color: '#5D4037' }}>Mint Club</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'rgba(93,64,55,0.7)' }}>Vault ID</span>
                  <span style={{ fontWeight: 'bold', color: '#5D4037' }}>69</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'rgba(93,64,55,0.7)' }}>Reward</span>
                  <span style={{ fontWeight: 'bold', color: '#A67C52' }}>SALT</span>
                </div>
              </div>
              <a href="https://mint.club/staking/base/69" target="_blank" rel="noopener noreferrer" className="button-effect" style={btnStyle}>
                Stake NUT on Mint Club
              </a>
            </div>

          </div>

          {/* SALT AIRDROP LORE */}
          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#5D4037', textAlign: 'center', marginBottom: '1rem' }}>
            🪂 Airdrop History
          </h2>
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#5D4037', flex: '1', marginRight: '1rem' }}>
                Based Nut War init NFT Airdrop
              </h3>
              <div style={{ width: '3rem', height: '3rem', backgroundColor: '#8B4513', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem' }}>
                ⚔️
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)', marginBottom: '1rem', lineHeight: '1.7' }}>
              SALT has been airdropped before — <strong>+1 million SALT tokens were distributed to all NFT holders</strong> as part of the Based Nut War event:
            </p>
            <ul style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)', marginBottom: '1.5rem', lineHeight: '1.7', paddingLeft: '1.25rem' }}>
              <li><strong>Generals</strong> got <strong>200 SALT</strong> per NFT</li>
              <li><strong>Soldiers</strong> got <strong>80 SALT</strong> per NFT</li>
            </ul>
            <p style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              This is how the Based Nut War armies were distributed. All of these on-chain events are part of the Great Nut War lore.
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(93,64,55,0.6)', display: 'block', marginBottom: '0.25rem' }}>SALT Contract Address</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <code style={{ fontSize: '0.75rem', color: '#5D4037', background: 'rgba(205,127,50,0.08)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {saltAddress}
                </code>
                <button
                  onClick={() => copyToClipboard(saltAddress, 'salt')}
                  style={{ cursor: 'pointer', border: '1px solid rgba(205,127,50,0.3)', background: 'rgba(205,127,50,0.05)', borderRadius: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#5D4037' }}
                >
                  {copied === 'salt' ? '✓' : 'Copy'}
                </button>
              </div>
            </div>
            <Link href="/great-nut-war" className="button-effect" style={{ ...btnStyle, backgroundColor: '#8B4513' }}>
              ⚔️ Relive the Great Nut War
            </Link>
          </div>

          {/* SNUT NOTE */}
          <div style={{ marginTop: '2rem', padding: '1.25rem 1.5rem', background: 'rgba(205,127,50,0.06)', borderRadius: '1rem', border: '1px solid rgba(205,127,50,0.2)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'rgba(93,64,55,0.85)', lineHeight: '1.6' }}>
              🧂 Looking for the staked yield token? Learn everything about <Link href="/token/snut" style={{ color: '#A67C52', fontWeight: 'bold' }}>SNUT</Link>.
            </p>
          </div>

          {/* Back to War */}
          <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
            <Link href="/great-nut-war" className="button-effect" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.75rem 1.5rem', backgroundColor: '#8B4513', color: '#fff', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '1rem', fontWeight: 'bold' }}>
              ⚔️ Back to Great Nut War
            </Link>
          </div>

          {/* Disclaimer */}
          <div style={{ marginTop: '1rem', padding: '1.5rem', background: 'rgba(255,235,238,0.5)', borderRadius: '1rem', border: '1px solid rgba(183,28,28,0.1)' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(93,64,55,0.6)', textAlign: 'center', lineHeight: '1.5' }}>
              ⚠️ <strong>WARNING:</strong> These are memetic assets with zero financial payload. All deployments fall under Operation: VIBES ONLY.
            </p>
          </div>
        </div>
      </div>
    <style jsx>{`
        .button-effect {
          transition: background 0.3s ease, transform 0.3s ease;
          width: 100%;
          max-width: 300px;
          margin: 0 auto;
          text-align: center;
          box-sizing: border-box;
          display: inline-flex;
        }
        .button-effect:hover {
          transform: translateY(-2px);
          animation: wiggle 0.4s ease-in-out;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(3deg); }
          40% { transform: rotate(-3deg); }
          60% { transform: rotate(2deg); }
          80% { transform: rotate(-2deg); }
        }
    `}</style>
    </Layout>
  );
};

export default StakingPage;

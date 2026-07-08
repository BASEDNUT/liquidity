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

  const concludedBadge = {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#fff',
    background: 'rgba(93,64,55,0.5)',
    borderRadius: '9999px',
    marginLeft: '0.75rem',
    verticalAlign: 'middle',
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
  };

  const btnConcluded = {
    ...btnStyle,
    backgroundColor: 'rgba(93,64,55,0.3)',
    cursor: 'default',
  };

  return (
    <Layout>
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F3ED', fontFamily: 'Arial, sans-serif' }}>
        <Head>
          <title>Staking & Vault | BASED NUT</title>
          <meta name="description" content="SALT Forge, concluded staking vault, and NFT airdrop history for the NUT ecosystem." />
        </Head>

        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '8rem 1.5rem 2rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#5D4037', marginBottom: '0.5rem' }}>
              🏰 Staking & Vault
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'rgba(93,64,55,0.8)', maxWidth: '600px', margin: '0 auto' }}>
              Mint SALT, review concluded vaults, and track airdrop history in the NUT ecosystem.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>

            {/* SALT Forge */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#5D4037', flex: '1', marginRight: '1rem' }}>
                  SALT Forge
                </h3>
                <div style={{ width: '3rem', height: '3rem', backgroundColor: '#CD7F32', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem' }}>
                  🌋
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)', marginBottom: '1rem', lineHeight: '1.5' }}>
                Forge SALT via the Mint Club bonding curve on Base. SALT is the savory seasoning token of the NUT ecosystem.
              </p>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(93,64,55,0.6)', display: 'block', marginBottom: '0.25rem' }}>Contract Address</span>
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
              <a href="https://mint.club/token/base/SALT" target="_blank" rel="noopener noreferrer" className="button-effect" style={btnStyle}>
                Mint SALT on Mint Club
              </a>
            </div>

            {/* First Staking Vault — CONCLUDED */}
            <div style={{ ...cardStyle, border: '2px solid rgba(93,64,55,0.3)', background: 'linear-gradient(to bottom, rgba(93,64,55,0.05), #fff)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#5D4037', flex: '1', marginRight: '1rem' }}>
                  First Staking Vault
                  <span style={concludedBadge}>CONCLUDED</span>
                </h3>
                <div style={{ width: '3rem', height: '3rem', backgroundColor: 'rgba(93,64,55,0.5)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem' }}>
                  🏦
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                The first Mint Club staking vault for the NUT ecosystem. This vault has concluded — all rewards have been distributed.
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
                  <span style={{ color: 'rgba(93,64,55,0.7)' }}>Status</span>
                  <span style={{ fontWeight: 'bold', color: 'rgba(93,64,55,0.6)' }}>Concluded</span>
                </div>
              </div>
              <a href="https://mint.club/staking/base/69" target="_blank" rel="noopener noreferrer" className="button-effect" style={btnStyle}>
                View Vault on Mint Club
              </a>
            </div>

            {/* NFT Airdrop — CONCLUDED */}
            <div style={{ ...cardStyle, border: '2px solid rgba(139,69,19,0.2)', background: 'linear-gradient(to bottom, rgba(139,69,19,0.05), #fff)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#5D4037', flex: '1', marginRight: '1rem' }}>
                  NFT Airdrop
                  <span style={concludedBadge}>CONCLUDED</span>
                </h3>
                <div style={{ width: '3rem', height: '3rem', backgroundColor: 'rgba(139,69,19,0.5)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem' }}>
                  🪂
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                NFT holders received airdropped tokens as rewards. This distribution has concluded — all eligible holders have been served.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'rgba(93,64,55,0.7)' }}>Recipients</span>
                  <span style={{ fontWeight: 'bold', color: '#5D4037' }}>NFT Holders</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'rgba(93,64,55,0.7)' }}>Collections</span>
                  <span style={{ fontWeight: 'bold', color: '#5D4037' }}>PNUTS, ALMD, SALMD, PNUTRMY</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'rgba(93,64,55,0.7)' }}>Status</span>
                  <span style={{ fontWeight: 'bold', color: 'rgba(93,64,55,0.6)' }}>Concluded</span>
                </div>
              </div>
            </div>

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

import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';

const tokens = [
  { emoji: '🥜', name: 'NUT', tag: 'Supply: 1', addr: '0xb8de15fb529d98c93c749de63c749d48d25a30df', color: '#CD7F32', desc: 'Anchor asset. All liquidity flows through NUT.' },
  { emoji: '⚡', name: 'SNUT', tag: 'Non-Escrow Rewards', addr: '0xac130701aa31c284c36609e2489f150f419ad7ad', color: '#B47E5B', desc: 'Supply: 100,000. Reward token with deflationary mechanics.' },
  { emoji: '🌰', name: 'pNUT', tag: 'Index basket', addr: '0x2a5757b60987ff10385de1d4d923792f6fdcff1', color: '#8B4513', desc: 'Basket of cbETH, cbBTC, NUT, SNUT. Drift = arb.' },
  { emoji: '🧂', name: 'SALT', tag: 'Nested bonded token', addr: '0x1EDe2AFC985F6D7aEb3F4c84B95A103c00D5dE81', color: '#A0522D', desc: 'Two-venue arb loop: Mint Club curve (NUT) ↔ Aerodrome pool (USDC).' },
];

const BuilderInfo = () => {
  return (
    <Layout>
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F3ED', fontFamily: 'Arial, sans-serif' }}>
        <Head>
          <title>Arb Bot | BASED NUT</title>
          <meta name="description" content="Arb bot builder guide for the BASED NUT ecosystem on Base chain." />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'TechArticle',
              name: 'BASED NUT Arb Bot',
              description: 'Arb bot builder guide for the BASED NUT ecosystem on Base chain.',
              inLanguage: 'en',
            })}}
          />
        </Head>

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem 2rem' }}>
          <div style={{
            display: 'inline-block',
            fontSize: '4rem',
            marginBottom: '1rem',
          }}>🔧</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#5D4037', marginBottom: '0.5rem' }}>
            Builder War Room
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(93,64,55,0.9)', maxWidth: '600px', margin: '0 auto' }}>
            Curve price ≠ pool price. That gap is yours.
          </p>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>

          {/* Tokens */}
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#5D4037', textAlign: 'center', marginBottom: '2rem' }}>
            Primitives
          </h2>
          <div className="builder-grid-2">
            {tokens.map(t => (
              <div key={t.name} style={{
                background: 'linear-gradient(to bottom, rgba(205,127,50,0.08), #fff)',
                padding: '2rem',
                borderRadius: '1rem',
                border: '2px solid rgba(205,127,50,0.2)',
                boxShadow: '0 5px 10px rgba(0,0,0,0.08)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: '3.5rem', height: '3.5rem',
                    backgroundColor: t.color,
                    borderRadius: '0.75rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.8rem',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                  }}>{t.emoji}</div>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#5D4037', margin: 0 }}>{t.name}</h3>
                    <span style={{
                      fontSize: '0.75rem', backgroundColor: t.color, color: '#fff',
                      padding: '0.15rem 0.6rem', borderRadius: '9999px',
                    }}>{t.tag}</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(93,64,55,0.9)', marginBottom: '0.5rem', lineHeight: '1.5' }}>{t.desc}</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(93,64,55,0.6)', fontFamily: 'monospace', wordBreak: 'break-all', margin: 0 }}>
                  <a href={`https://basescan.org/token/${t.addr}`} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#7D5A50', textDecoration: 'none' }}>{t.addr}</a>
                </p>
              </div>
            ))}
          </div>

          {/* Arb Surfaces */}
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#5D4037', textAlign: 'center', margin: '3rem 0 2rem' }}>
            Where the Edge Lives
          </h2>
          <div className="builder-grid-2">
            {/* Curve vs LP */}
            <div style={{
              background: 'linear-gradient(to bottom right, #FDE8B1, #FFF7E0)',
              padding: '2rem', borderRadius: '1rem',
              border: '2px solid rgba(205,127,50,0.3)',
              boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#5D4037', margin: 0 }}>Curve ↔ LP</h3>
                <div style={{
                  width: '3rem', height: '3rem', backgroundColor: '#CD7F32', borderRadius: '0.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                }}>⚔️</div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)', lineHeight: '1.6' }}>
                Primary edge. Mint on curve, sell on DEX. Or buy on DEX, redeem on curve.
                Spread covers fees + gas + slippage = profit.
              </p>
            </div>

            {/* Cross-pool */}
            <div style={{
              background: 'linear-gradient(to bottom right, #D4A373, #FFF7E0)',
              padding: '2rem', borderRadius: '1rem',
              border: '2px solid rgba(205,127,50,0.3)',
              boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#5D4037', margin: 0 }}>Cross-Pool</h3>
                <div style={{
                  width: '3rem', height: '3rem', backgroundColor: '#B47E5B', borderRadius: '0.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                }}>🔄</div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)', lineHeight: '1.6' }}>
                Uni V3 vs Aero vAMM. Incentives create imbalances. Backrun the flow.
              </p>
            </div>

            {/* pNUT drift */}
            <div style={{
              background: 'linear-gradient(to bottom right, #FFEBEE, #FFF7E0)',
              padding: '2rem', borderRadius: '1rem',
              border: '2px solid rgba(205,127,50,0.3)',
              boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#5D4037', margin: 0 }}>pNUT Drift</h3>
                <div style={{
                  width: '3rem', height: '3rem', backgroundColor: '#8B4513', borderRadius: '0.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                }}>📊</div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)', lineHeight: '1.6' }}>
                Market price drifts from basket value. Rebalance, unwrap, rewrap. Index arb.
              </p>
            </div>

            {/* SALT */}
            <div style={{
              background: 'linear-gradient(to bottom right, #E8D5B7, #FFF7E0)',
              padding: '2rem', borderRadius: '1rem',
              border: '2px solid rgba(205,127,50,0.3)',
              boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#5D4037', margin: 0 }}>SALT Loop</h3>
                <div style={{
                  width: '3rem', height: '3rem', backgroundColor: '#A0522D', borderRadius: '0.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                }}>🧂</div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)', lineHeight: '1.6' }}>
                Mint Club curve (NUT-priced) ↔ Aerodrome pool (USDC-priced). When those diverge, arb closes the gap. Cleanest two-venue loop in the ecosystem.
              </p>
            </div>
          </div>

          {/* SALT Arb Playbook */}
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#5D4037', textAlign: 'center', margin: '3rem 0 2rem' }}>
            🧂 SALT Arb Playbook
          </h2>
          <div className="builder-grid-2">
            {/* Route A */}
            <div style={{
              background: 'linear-gradient(to bottom, #E8D5B7, #fff)',
              padding: '2rem', borderRadius: '1rem',
              border: '2px solid rgba(205,127,50,0.3)', boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem', height: '3rem', backgroundColor: '#A0522D', borderRadius: '0.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                }}>🅰️</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#5D4037', margin: 0 }}>Aerodrome → Mint Club</h3>
              </div>
              <p style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#A0522D', marginBottom: '0.5rem' }}>Buy cheap on Aero, redeem to NUT on curve</p>
              <ol style={{ margin: 0, paddingLeft: '1.25rem', color: 'rgba(93,64,55,0.9)', fontSize: '0.85rem', lineHeight: '2' }}>
                <li>Buy SALT with USDC on Aerodrome when execution price &lt; curve-implied value</li>
                <li>Redeem SALT on Mint Club → receive NUT</li>
                <li>Optional: route NUT back to inventory or hedge</li>
              </ol>
            </div>
            {/* Route B */}
            <div style={{
              background: 'linear-gradient(to bottom, #FDE8B1, #fff)',
              padding: '2rem', borderRadius: '1rem',
              border: '2px solid rgba(205,127,50,0.3)', boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem', height: '3rem', backgroundColor: '#CD7F32', borderRadius: '0.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                }}>🅱️</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#5D4037', margin: 0 }}>Mint Club → Aerodrome</h3>
              </div>
              <p style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#A0522D', marginBottom: '0.5rem' }}>Mint cheap on curve, sell rich on Aero</p>
              <ol style={{ margin: 0, paddingLeft: '1.25rem', color: 'rgba(93,64,55,0.9)', fontSize: '0.85rem', lineHeight: '2' }}>
                <li>Mint SALT on Mint Club using NUT at curve price</li>
                <li>Sell SALT into USDC on Aerodrome when SALT/USDC &gt; curve-implied value</li>
                <li>Optional: recycle USDC into NUT exposure or hedge</li>
              </ol>
            </div>
          </div>
          <div style={{
            marginTop: '1.5rem', padding: '1.25rem 1.5rem',
            background: 'linear-gradient(to right, rgba(160,82,45,0.08), rgba(205,127,50,0.08))',
            borderRadius: '0.75rem', border: '1px solid rgba(160,82,45,0.2)',
          }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#5D4037', lineHeight: '1.6' }}>
              <strong>⚠️ Cross-denomination gotcha:</strong> The curve leg is <strong>NUT-priced</strong> and the pool leg is <strong>USDC-priced</strong>. Your bot must use a consistent NUT↔USDC reference (via liquid routes) to compare apples-to-apples. Always use <strong>expected execution</strong>, not spot.
            </p>
          </div>

          {/* SALT Flow Drivers */}
          <div style={{
            marginTop: '1.5rem', padding: '1.5rem 2rem',
            backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(5px)',
            borderRadius: '1rem', border: '2px solid rgba(205,127,50,0.2)',
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#5D4037', marginBottom: '1rem' }}>
              🔥 SALT Flow Drivers (why spreads appear)
            </h3>
            <div className="builder-grid-2" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem' }}>🎖️</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(93,64,55,0.9)', lineHeight: '1.6' }}>
                  <strong>Airdrop bursts:</strong> SALT was distributed to all NUT Army NFT holders (200/NFT for Generals, 80/NFT for Soldiers). These create non-organic sell/buy pressure — great for spreads.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem' }}>🏦</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(93,64,55,0.9)', lineHeight: '1.6' }}>
                  <strong>Staking vault rhythms:</strong> 7,420,420 SALT sent to the Stake NUT → Earn SALT vault. Predictable claim/emission cycles = time-based monitoring opportunities.
                </p>
              </div>
            </div>
          </div>

          {/* Venue Intel */}
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#5D4037', textAlign: 'center', margin: '3rem 0 2rem' }}>
            Venue Intel
          </h2>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(5px)',
            borderRadius: '1rem', border: '2px solid rgba(205,127,50,0.2)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)', padding: '2rem', overflow: 'hidden',
          }}>
            <div className="builder-grid-2" style={{ marginBottom: '2rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🏭</span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#5D4037', margin: 0 }}>Bonding Curve (Mint Club)</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(93,64,55,0.9)', lineHeight: '1.6', margin: 0 }}>
                  <strong>Read:</strong> mint/redeem quotes, supply, curve params<br />
                  <strong>Sim:</strong> callStatic mint/redeem<br />
                  <strong>Watch:</strong> curve fees, supply-sensitive slippage, bind to block<br />
                  <strong>SALT:</strong> NUT-denominated flat curve — get mint quote (NUT→SALT) and redeem quote (SALT→NUT)
                </p>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🦄</span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#5D4037', margin: 0 }}>Uniswap V3</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(93,64,55,0.9)', lineHeight: '1.6', margin: 0 }}>
                  <strong>Read:</strong> slot0, liquidity, tick depth, fee tier<br />
                  <strong>Sim:</strong> Quoter exactInput/exactOutput<br />
                  <strong>Watch:</strong> spot ≠ execution, tick cliffs, MEV
                </p>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🌊</span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#5D4037', margin: 0 }}>Aero vAMM</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(93,64,55,0.9)', lineHeight: '1.6', margin: 0 }}>
                  <strong>Read:</strong> reserves, fee, pair address<br />
                  <strong>Sim:</strong> getAmountsOut / callStatic<br />
                  <strong>Watch:</strong> reserve drift, fee-on-transfer tokens<br />
                  <strong>SALT:</strong> volatile SALT/USDC pool — quote expected execution (size-aware)
                </p>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>📐</span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#5D4037', margin: 0 }}>Reference Pricing</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(93,64,55,0.9)', lineHeight: '1.6', margin: 0 }}>
                  <strong>For SALT:</strong> maintain a NUT↔USDC reference so spread math is apples-to-apples<br />
                  <strong>Source:</strong> liquid NUT/WETH and WETH/USDC routes<br />
                  <strong>Trigger:</strong> spreads often appear around airdrop claims and staking vault emission cycles
                </p>
              </div>
            </div>
          </div>

          {/* Execution + Safety */}
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#5D4037', textAlign: 'center', margin: '3rem 0 2rem' }}>
            Execution Doctrine
          </h2>
          <div className="builder-grid-2">
            <div style={{
              background: 'linear-gradient(to bottom, rgba(205,127,50,0.05), #fff)',
              padding: '2rem', borderRadius: '1rem',
              border: '2px solid rgba(205,127,50,0.2)', boxShadow: '0 5px 10px rgba(0,0,0,0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem', height: '3rem', backgroundColor: '#CD7F32', borderRadius: '0.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                }}>⚡</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#5D4037', margin: 0 }}>Patterns</h3>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'rgba(93,64,55,0.9)', fontSize: '0.875rem', lineHeight: '2' }}>
                <li><strong>Atomic 2-leg:</strong> one tx, both legs, simulate first</li>
                <li><strong>Backrun:</strong> react to swaps, private submit, abort if state shifted</li>
                <li><strong>Inventory MM:</strong> small buffers, adaptive sizing, tight drawdown</li>
              </ul>
            </div>
            <div style={{
              background: 'linear-gradient(to bottom, #FFEBEE, #fff)',
              padding: '2rem', borderRadius: '1rem',
              border: '2px solid rgba(205,127,50,0.2)', boxShadow: '0 5px 10px rgba(0,0,0,0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem', height: '3rem', backgroundColor: '#B71C1C', borderRadius: '0.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#fff',
                }}>🛡️</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#5D4037', margin: 0 }}>Safety</h3>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'rgba(93,64,55,0.9)', fontSize: '0.875rem', lineHeight: '2' }}>
                <li>Never trade on spot — Quoter/callStatic only</li>
                <li>Edge = sellValue − buyCost − (fees + gas + slippage + MEV buffer)</li>
                <li>Block-bound quotes — re-quote on new block</li>
                <li>Kill switch, per-venue toggles, max slippage, max gas</li>
                <li>Repeated reverts = you are getting raced. Disable route.</li>
              </ul>
            </div>
          </div>

          {/* Agent Interface */}
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#5D4037', textAlign: 'center', margin: '3rem 0 2rem' }}>
            Recommended Agent Interface v1
          </h2>
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'rgba(93,64,55,0.7)', marginTop: '-1rem', marginBottom: '2rem' }}>
            Suggested event names and tasks for your bot framework. Not a live contract — a spec you can adopt.
          </p>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(5px)',
            borderRadius: '1rem', border: '2px solid rgba(205,127,50,0.2)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)', padding: '2rem',
          }}>
            <div className="builder-grid-2" style={{ marginBottom: '2rem' }}>
              {/* Events */}
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#5D4037', marginBottom: '1rem' }}>
                  📡 Suggested Events
                </h3>
                {[
                  { name: 'spread_hit', desc: 'Profitable spread found (any token)' },
                  { name: 'curve_quote_update', desc: 'Curve price moved (token field)' },
                  { name: 'pool_swap', desc: 'Swap on watched pool (incl. SALT/USDC)' },
                  { name: 'index_drift', desc: 'pNUT basket drift' },
                  { name: 'risk_trip', desc: 'Circuit breaker fired' },
                ].map(e => (
                  <div key={e.name} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0', borderBottom: '1px solid rgba(205,127,50,0.15)',
                  }}>
                    <code style={{ fontWeight: 'bold', color: '#5D4037' }}>{e.name}</code>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(93,64,55,0.7)' }}>{e.desc}</span>
                  </div>
                ))}
              </div>

              {/* Tasks */}
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#5D4037', marginBottom: '1rem' }}>
                  🔧 Suggested Tasks
                </h3>
                {[
                  { name: 'quote_routes', io: 'pair, sizes → ranked routes + edge' },
                  { name: 'build_tx', io: 'route, size, slippage → tx request' },
                  { name: 'simulate', io: 'tx, block → success, gas, deltas' },
                  { name: 'execute', io: 'tx, mode, maxGas → hash, status' },
                ].map(t => (
                  <div key={t.name} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0', borderBottom: '1px solid rgba(205,127,50,0.15)',
                  }}>
                    <code style={{ fontWeight: 'bold', color: '#5D4037' }}>{t.name}</code>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(93,64,55,0.7)' }}>{t.io}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested routes */}
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#5D4037', marginBottom: '0.75rem' }}>
              Suggested Route IDs
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
              {['mint_then_sell', 'buy_then_redeem', 'cross_pool', 'index_rebalance', 'salt_mint_then_sell', 'salt_buy_then_redeem'].map(r => (
                <code key={r} style={{
                  padding: '0.3rem 0.75rem', backgroundColor: 'rgba(160,82,45,0.1)',
                  borderRadius: '0.25rem', fontSize: '0.8rem', color: '#5D4037', fontWeight: 'bold',
                }}>{r}</code>
              ))}
            </div>

            {/* Webhook */}
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#5D4037', marginBottom: '0.75rem' }}>
              Example webhook payload
            </h3>
            <pre style={{
              padding: '1.5rem', borderRadius: '0.75rem',
              backgroundColor: '#3E2723', color: '#FDE8B1',
              fontSize: '0.8rem', fontFamily: 'Courier New, monospace',
              overflow: 'auto', lineHeight: '1.6', margin: 0,
            }}>{`{
  "event": "spread_hit",
  "token": "SALT",
  "pair": "SALT/USDC",
  "route": "salt_buy_then_redeem",
  "venues": ["AeroVAMM", "MintClub"],
  "spreadBps": 62,
  "block": 12345678,
  "quoteType": "expectedExecution",
  "units": { "inToken": "USDC", "outToken": "NUT" },
  "assumptions": { "maxSlippageBps": 50, "maxGasGwei": 25 }
}`}</pre>
          </div>

          {/* Classified Intel / Machine Spec */}
          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#5D4037', marginBottom: '1rem' }}>
              MACHINE SPEC // CLASSIFIED
            </h3>
            <p style={{ fontSize: '1rem', color: '#5D4037', marginBottom: '2rem' }}>
              Feed this to your agent, your parser, your pipeline. It knows what to do.
            </p>
          </div>
          <div style={{
            padding: '2rem', backgroundColor: '#FFF5E0',
            border: '3px double #8B4513', borderRadius: '0.75rem',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            fontFamily: 'Courier New, monospace', color: '#5D4037',
          }}>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>
              📄 <strong>SPEC v1.1.0 // BASED NUT // BASE CHAIN</strong>
            </p>
            <pre style={{
              padding: '1.5rem', borderRadius: '0.75rem',
              backgroundColor: '#3E2723', color: '#FDE8B1',
              fontSize: '0.75rem', fontFamily: 'Courier New, monospace',
              overflow: 'auto', lineHeight: '1.6', margin: 0,
            }}>{JSON.stringify({
              version: '1.1.0',
              ecosystem: 'BASED NUT',
              chain: 'Base',
              premise: 'Bonding-curve mint/redeem prices diverge from LP prices. Arb closes the gap.',
              tokens: [
                { name: 'NUT', address: '0xb8de15fb529d98c93c749de63c749d48d25a30df', supply: '1' },
                { name: 'SNUT', address: '0xac130701aa31c284c36609e2489f150f419ad7ad', role: 'non_escrow_rewards', supply: '100000' },
                { name: 'pNUT', address: '0x2a5757b60987ff10385de1d4d923792f6fdcff1', mechanism: 'index_basket', basket: ['cbETH', 'cbBTC', 'NUT', 'SNUT'] },
                { name: 'SALT', address: '0x1EDe2AFC985F6D7aEb3F4c84B95A103c00D5dE81', mechanism: 'nested_bonded_token', curve: 'NUT_denominated_flat', pool: 'SALT_USDC_aero_vAMM' },
              ],
              venues: ['BondingCurve', 'MintClub', 'UniV3', 'AeroVAMM'],
              routes: ['mint_then_sell', 'buy_then_redeem', 'cross_pool', 'index_rebalance', 'salt_mint_then_sell', 'salt_buy_then_redeem'],
              guardrails: ['maxSlippageBps', 'maxGasGwei', 'minProfit', 'maxNotional', 'killSwitch'],
              agent: {
                events: ['spread_hit', 'curve_quote_update', 'pool_swap', 'index_drift', 'risk_trip'],
                tasks: ['quote_routes', 'build_tx', 'simulate', 'execute'],
                eventFields: { token: 'NUT|SNUT|pNUT|SALT', route: 'string', quoteType: 'expectedExecution' },
              },
            }, null, 2)}</pre>
          </div>

          {/* Links */}
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#5D4037', textAlign: 'center', margin: '3rem 0 2rem' }}>
            Deploy from Here
          </h2>
          <div className="builder-grid-3">
            {[
              { label: 'DEX Screener', href: 'https://dexscreener.com/base/0xe3ce00e2ed742b142c15eedc208657dd22aa987e', emoji: '📈' },
              { label: 'NUT on Mint Club', href: 'https://mint.club/token/base/NUT', emoji: '🥜' },
              { label: 'SALT on Mint Club', href: 'https://mint.club/token/base/SALT', emoji: '🧂' },
              { label: 'SALT on Basescan', href: 'https://basescan.org/token/0x1EDe2AFC985F6D7aEb3F4c84B95A103c00D5dE81', emoji: '🔍' },
              { label: 'Docs: SALT', href: 'https://docs.basednut.com/based-nut/the-orchard/nested-nut-tokens/nut-army/salt', emoji: '📄' },
              { label: 'Join the Nut War', href: 'https://docs.basednut.com/based-nut/the-orchard/nested-nut-tokens/nut-army/join-the-nut-war', emoji: '⚔️' },
              { label: 'Great Nut War', href: '/great-nut-war', emoji: '🪖' },
              { label: 'Website', href: 'https://basednut.com', emoji: '🌐' },
              { label: 'X', href: 'https://x.com/BASEDNUT_', emoji: '𝕏' },
              { label: 'Telegram', href: 'https://t.me/basednutportal', emoji: '💬' },
              { label: 'GitHub', href: 'https://github.com/BASEDNUT', emoji: '🐙' },
              { label: 'Docs Home', href: 'https://docs.basednut.com', emoji: '📚' },
            ].map(l => (
              <a key={l.href} href={l.href} target={l.href.startsWith('/') ? '_self' : '_blank'} rel="noopener noreferrer"
                className="button-effect"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '1rem 1.5rem', backgroundColor: '#CD7F32', color: '#fff',
                  borderRadius: '0.5rem', textDecoration: 'none', fontSize: '1rem', fontWeight: 'bold',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
                }}>
                <span>{l.emoji}</span> {l.label}
              </a>
            ))}
          </div>

          <p style={{ marginTop: '3rem', textAlign: 'center', fontStyle: 'italic', color: 'rgba(93,64,55,0.9)' }}>
            "The gap between the curve and the pool belongs to whoever moves first."
          </p>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(93,64,55,0.5)', marginTop: '0.5rem' }}>
            SALT is the economic backbone of the Great Nut War. 🧂
          </p>
        </div>

        <style jsx>{`
          .button-effect {
            transition: background 0.3s ease, transform 0.3s ease;
          }
          .button-effect:hover {
            transform: translateY(-2px);
          }
          .builder-grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
          }
          .builder-grid-2 {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
          }
          @media (max-width: 768px) {
            .builder-grid-3,
            .builder-grid-2 {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default BuilderInfo;

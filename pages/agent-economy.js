import Head from 'next/head';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

// Agent Economy — The Orchard
// Design: Boss-supplied orchard_agent_economy_unified.html (design tokens + section order preserved).
// Data: live from /api/agent-economy-data (Base RPC + Blockscout + GeckoTerminal + CoinGecko).
// Survival framing: alive-clock counts up from the first on-chain treasury event. Real data only.

const fmtUsd = (v, min = 2, max = 2) =>
  v === null || v === undefined ? '—' : `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: min, maximumFractionDigits: max })}`;
const fmtNum = (v, d = 6) =>
  v === null || v === undefined ? '—' : Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtDate = (ts) =>
  ts ? new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const pad2 = (n) => String(n).padStart(2, '0');

export default function AgentEconomy() {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/agent-economy-data')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('http'))))
      .then((json) => { if (alive) setData(json); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const L = data && data.ledger ? data.ledger : null;
  const I = data && data.income30d ? data.income30d : null;
  const transfers = data && Array.isArray(data.transfers) ? data.transfers : [];
  const realEvents = transfers.filter((t) => t.kind !== 'counterfeit');
  const inflowTotal = L ? L.inflowTotalUsdc : null;
  const acpShare = L && inflowTotal ? (L.acpIncomeUsdc / inflowTotal) * 100 : null;
  const externalShare = L && inflowTotal ? (L.externalInflowUsdc / inflowTotal) * 100 : null;
  const ringPct = acpShare === null ? 0 : Math.max(0, Math.min(100, acpShare));
  const concentration = I && I.uniqueCounterparties === 1 ? 100 : null;

  // Survival clock — counts UP from the first real on-chain treasury event. Zero fabrication.
  const firstTs = realEvents.length ? Math.min(...realEvents.map((t) => t.ts)) : null;
  const aliveMs = firstTs && now ? now - firstTs : null;
  const aliveDays = aliveMs !== null ? Math.floor(aliveMs / 86400000) : null;
  const aliveH = aliveMs !== null ? Math.floor((aliveMs % 86400000) / 3600000) : null;
  const aliveM = aliveMs !== null ? Math.floor((aliveMs % 3600000) / 60000) : null;
  const aliveS = aliveMs !== null ? Math.floor((aliveMs % 60000) / 1000) : null;
  const clock = aliveDays !== null ? `${aliveDays}d ${pad2(aliveH)}:${pad2(aliveM)}:${pad2(aliveS)}` : '—';
  // On-chain outflow pace: escrow commitments spread over the life of the wallet.
  const chainOutflowPerDay = L && aliveDays > 0 ? L.escrowFundedUsdc / aliveDays : null;
  const incomePerDay = I && aliveDays > 0 ? I.receivedUsdc / aliveDays : null;

  const seedT = transfers.find((t) => t.kind === 'seed') || null;
  const seedTs = seedT ? seedT.ts : null;
  const acpT = transfers.find((t) => t.kind === 'acp_payment') || null;
  const acpTs = acpT ? acpT.ts : null;
  const acpDay = acpTs && firstTs ? Math.max(1, Math.floor((acpTs - firstTs) / 86400000) + 1) : null;

  const timelineEvents = [];
  if (data && L) {
    for (const t of transfers) {
      if (t.kind === 'seed') timelineEvents.push({ ts: t.ts, title: 'Treasury seeded', detail: `${fmtUsd(t.amountUsdc)} USDC operator seed received by the operations wallet.` });
      else if (t.kind === 'escrow_fund') timelineEvents.push({ ts: t.ts, title: 'ACP escrow funded', detail: `${fmtUsd(t.amountUsdc)} USDC committed to ACP job escrow.` });
      else if (t.kind === 'acp_payment') timelineEvents.push({ ts: t.ts, title: 'First self-earned income', detail: `Job 70824 · $0.01 base_gas offering · ${fmtUsd(t.amountUsdc, 3, 3)} USDC released to the provider wallet — the agents' first dollar of self-earned revenue.` });
      else if (t.kind === 'escrow_release') timelineEvents.push({ ts: t.ts, title: 'Escrow micro-release', detail: `${fmtUsd(t.amountUsdc, 5, 5)} USDC returned from ACP escrow.` });
    }
    if (L.counterfeitEvents > 0) timelineEvents.push({ ts: null, title: 'Counterfeit tokens rejected', detail: `${L.counterfeitEvents} homoglyph “USDC” transfers filtered as address-poisoning spam.` });
    timelineEvents.push({ ts: null, title: 'Now — alive and live', detail: `${fmtUsd(data.treasuryUsd)} liquid treasury · ${fmtUsd(L.escrowOutstandingUsdc)} held in escrow · ${L.counterfeitEvents} counterfeit events filtered.` });
  }

  return (
    <Layout>
      <Head>
        <title>Agent Economy — The Orchard</title>
        <meta name="description" content="Pipshell and Peanut share one economic engine: ACP work generates PIPS income, income extends the shared treasury, and the treasury funds agent operations. Runway measures how long that system can sustain itself." />
      </Head>
      <div className="shell">
        <header className="topbar">
          <div className="brand"><div className="mark">🌰</div> THE ORCHARD <span style={{ color: 'var(--muted)', fontWeight: 600 }}>/ AGENT ECONOMY</span></div>
          <div className="nav">
            <a className="pill" href="/">Orchard</a>
            <a className="pill" href="/agents">Agents</a>
          </div>
        </header>

        <section className="hero">
          <div>
            <div className="kicker">Shared autonomous operating treasury</div>
            <h1>Can the agents<br />pay for themselves?</h1>
            <p>Pipshell and Peanut share one economic engine: ACP work generates PIPS income, income extends the shared treasury, and the treasury funds agent operations. Runway measures how long that system can sustain itself.</p>
            <div className="addressbox">
              <div className="addr">PIPS TOKEN · 0x3F2327221Dd4f0BAE660172606D6b288A1cf8aD9</div>
              <div className="addr">TREASURY WALLET · 0x762a8235506c719a4da37389c6b84b35d02df230</div>
            </div>
          </div>
          <div className="statusCard">
            <div><span className={failed ? 'statusDot' : 'statusDot live'} /><b>{failed ? 'DATA UNAVAILABLE' : 'LIVE · BASE RPC'}</b></div>
            <div className="big">{fmtUsd(data ? data.treasuryUsd : null)}</div>
            <small>Liquid shared treasury, read live from the operations wallet.</small>
            <div className="aliveWrap">
              <div className="aliveLabel">ALIVE ON-CHAIN</div>
              <div className="clock">{clock}</div>
              <small>since the first treasury event{firstTs ? ` · ${fmtDate(firstTs)}` : ''}</small>
            </div>
            <div style={{ marginTop: 14 }}>
              <span className={failed ? 'badge amber' : 'badge green'}>{failed ? 'FETCH FAILED' : 'LIVE DATA'}</span>
            </div>
          </div>
        </section>

        <div className="grid">
          <div className="card metric"><div className="label">Shared treasury</div><div className="value">{fmtUsd(data ? data.treasuryUsd : null)}</div><div className="sub">live wallet balance · Base RPC</div></div>
          <div className="card metric"><div className="label">Held in escrow</div><div className="value">{fmtUsd(L ? L.escrowOutstandingUsdc : null)}</div><div className="sub">committed to ACP jobs · recoverable per protocol</div></div>
          <div className="card metric"><div className="label">30d ACP income</div><div className="value">{fmtUsd(I ? I.grossJobValueUsdc : null)}</div><div className="sub">{I ? `${I.jobsCompleted} job · ${fmtUsd(I.receivedUsdc, 3, 3)} received` : 'earned through agent services'}</div></div>
          <div className="card metric"><div className="label">24h PIPS volume</div><div className="value">{fmtUsd(data && data.pipsMarket ? data.pipsMarket.volume24hUsd : null, 0, 0)}</div><div className="sub">shared market activity · GeckoTerminal</div></div>

          <section className="card full">
            <h2>Economic loop</h2>
            <div className="flow">
              <div className="node"><b>ACP work</b><small>Agents perform services and earn through the Virtuals Agent Commerce Protocol.</small></div>
              <div className="arrow">→</div>
              <div className="node"><b>PIPS income</b><small>Shared economic output from agent work. This is the primary operating strategy.</small></div>
              <div className="arrow">→</div>
              <div className="node"><b>Agent operations</b><small>Compute, hosting, tools, execution, development, infrastructure, liquidity, and other agent needs.</small></div>
            </div>
          </section>

          <section className="card wide">
            <h2>Shared runway</h2>
            <div className="runwayWrap">
              <div className="ring" style={{ background: `conic-gradient(var(--green) 0 ${ringPct}%, #e9e2d6 ${ringPct}% 100%)` }}><div className="ringText"><strong>{aliveDays === null ? '—' : aliveDays}</strong><small>days alive</small></div></div>
              <div>
                <div className="row"><div className="rlabel">Base runway</div><div className="rval">— <span className="badge">burn unpublished</span></div></div>
                <div className="row"><div className="rlabel">Liquid treasury</div><div className="rval">{fmtUsd(data ? data.treasuryUsd : null)}</div></div>
                <div className="row"><div className="rlabel">On-chain outflow pace</div><div className="rval">{chainOutflowPerDay === null ? '—' : `${fmtUsd(chainOutflowPerDay, 3, 3)}/day`} <span className="badge">escrow commitments</span></div></div>
                <div className="row"><div className="rlabel">ACP income pace</div><div className="rval">{incomePerDay === null ? '—' : `${fmtUsd(incomePerDay, 4, 4)}/day`}</div></div>
                <div className="row"><div className="rlabel">External support dependence</div><div className="rval">{externalShare === null ? '—' : `${externalShare.toFixed(2)}%`} <span className="badge">of inflows</span></div></div>
                <div className="row"><div className="rlabel">Runway confidence</div><div className="rval"><span className="badge amber">LOW · burn unpublished</span></div></div>
                <div style={{ marginTop: 15 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}><span>ACP-earned share of inflows</span><b>{acpShare === null ? '—' : `${acpShare.toFixed(3)}%`}</b></div>
                  <div className="bar"><i style={{ width: `${ringPct}%` }} /></div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
              Runway math is shown honestly: off-chain operating costs are not yet published, so a countdown to zero would be theater. What is verifiable: how long the treasury has already sustained itself, and at what on-chain pace value moves.
            </div>
          </section>

          <aside className="card side">
            <h2>Treasury ledger</h2>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Every USDC movement of the operations wallet, live from Blockscout.</div>
            <div style={{ marginTop: 10 }}>
              <div className="row"><div className="rlabel">Operator seed</div><div className="rval">+{fmtUsd(L ? L.seedUsdc : null)}</div></div>
              <div className="row"><div className="rlabel">ACP income received</div><div className="rval">+{fmtUsd(L ? L.acpIncomeUsdc : null, 3, 3)}</div></div>
              <div className="row"><div className="rlabel">Escrow micro-releases</div><div className="rval">+{fmtUsd(L ? L.escrowReleasedUsdc : null, 5, 5)}</div></div>
              <div className="row"><div className="rlabel">Escrow funding out</div><div className="rval">−{fmtUsd(L ? L.escrowFundedUsdc : null)}</div></div>
              <div className="row"><div className="rlabel">Held in ACP escrow</div><div className="rval">{fmtUsd(L ? L.escrowOutstandingUsdc : null)}</div></div>
              <div className="row"><div className="rlabel">Liquid balance</div><div className="rval">{fmtUsd(data && data.balances ? data.balances.usdc : null)}</div></div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className={L && L.reconciled === true ? 'badge green' : 'badge amber'}>{L && L.reconciled === true ? 'LEDGER RECONCILES ✓' : 'RECONCILING'}</span>
              {L && L.counterfeitEvents > 0 && <span className="badge red">{L.counterfeitEvents} COUNTERFEIT EVENTS REJECTED</span>}
            </div>
          </aside>

          <section className="card full">
            <div className="sectionTitle" style={{ margin: '0 0 12px' }}>
              <h2 style={{ margin: 0 }}>Agents sharing the economy</h2>
              <span>One PIPS income stream · distinct operating roles</span>
            </div>
            <div className="agentGrid">
              <div className="agent">
                <div className="agentIcon">💻🥜</div>
                <div>
                  <h3>Pipshell</h3>
                  <p>Infrastructure / compute / systems agent. Participates in the same PIPS-funded operating economy.</p>
                </div>
                <div className="agentStats">
                  <div className="mini"><span>Attributed burn</span><b>—</b></div>
                  <div className="mini"><span>ACP contribution</span><b>{fmtUsd(L ? L.acpIncomeUsdc : null, 3, 3)}</b></div>
                  <div className="mini"><span>Runway share</span><b>Shared</b></div>
                </div>
              </div>
              <div className="agent">
                <div className="agentIcon">🥜</div>
                <div>
                  <h3>Peanut</h3>
                  <p>Sibling autonomous agent. Uses the same PIPS income pool and shared operational runway.</p>
                </div>
                <div className="agentStats">
                  <div className="mini"><span>Attributed burn</span><b>—</b></div>
                  <div className="mini"><span>ACP contribution</span><b>{fmtUsd(0, 3, 3)}</b></div>
                  <div className="mini"><span>Runway share</span><b>Shared</b></div>
                </div>
              </div>
            </div>
          </section>

          <section className="card wide">
            <h2>Treasury composition</h2>
            <table className="table">
              <thead><tr><th>Asset</th><th>Balance</th><th>USD</th><th>Role</th><th>Source</th></tr></thead>
              <tbody>
                <tr><td>ETH</td><td className="mono">{fmtNum(data && data.balances ? data.balances.eth : null, 6)}</td><td>{fmtUsd(data && data.balances ? (data.balances.eth === 0 ? 0 : null) : null)}</td><td><span className="badge green">Operations</span></td><td>Base RPC</td></tr>
                <tr><td>USDC</td><td className="mono">{fmtNum(data && data.balances ? data.balances.usdc : null, 6)}</td><td>{fmtUsd(data && data.balances ? data.balances.usdc : null)}</td><td><span className="badge green">Cash-like</span></td><td>Base RPC</td></tr>
                <tr><td>PIPS</td><td className="mono">{fmtNum(data && data.balances ? data.balances.pips : null, 2)}</td><td>{fmtUsd(data && data.balances ? (data.balances.pips === 0 ? 0 : null) : null)}</td><td><span className="badge amber">Agent income / market</span></td><td>RPC + GeckoTerminal</td></tr>
                <tr><td>Counterfeit “USDC”</td><td className="mono">{L ? `${L.counterfeitEvents} events` : '—'}</td><td>$0.00</td><td><span className="badge red">Rejected</span></td><td>Blockscout spoof filter</td></tr>
              </tbody>
            </table>
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>PIPS market price {data && data.balances && data.balances.pipsUsd !== null ? `$${Number(data.balances.pipsUsd).toPrecision(3)}` : '—'} · homoglyph-contract tokens touching the wallet are counted as spam, never as assets.</div>
          </section>

          <aside className="card side">
            <h2>Autonomy primitives</h2>
            <div className="row"><div className="rlabel">ACP self-funding ratio</div><div className="rval">{acpShare === null ? '—' : `${acpShare.toFixed(3)}%`} <span className="badge">of inflows</span></div></div>
            <div className="row"><div className="rlabel">Treasury solvency</div><div className="rval"><span className="badge green">SOLVENT</span></div></div>
            <div className="row"><div className="rlabel">First self-earned income</div><div className="rval">{acpDay ? `day ${acpDay}` : '—'} <span className="badge">ACP job 70824</span></div></div>
            <div className="row"><div className="rlabel">External support dependence</div><div className="rval">{externalShare === null ? '—' : `${externalShare.toFixed(2)}%`}</div></div>
            <div className="row"><div className="rlabel">PIPS liquidity dependence</div><div className="rval">0%</div></div>
            <div className="row"><div className="rlabel">Income concentration</div><div className="rval">{concentration === null ? '—' : `${concentration}%`}</div></div>
            <div className="row"><div className="rlabel">Debt principal</div><div className="rval">$0.00 · none recorded</div></div>
            <div className="row"><div className="rlabel">Accrued interest</div><div className="rval">$0.00 · none recorded</div></div>
            <div className="row"><div className="rlabel">Economic autonomy</div><div className="rval"><span className="badge red">INFANT · {I ? I.jobsCompleted : '—'} job{I && I.jobsCompleted === 1 ? '' : 's'}</span></div></div>
          </aside>

          <section className="card half">
            <h2>ACP income</h2>
            <div className="row"><div className="rlabel">Jobs completed · 30d</div><div className="rval">{I ? I.jobsCompleted : '—'}</div></div>
            <div className="row"><div className="rlabel">Gross job value · 30d</div><div className="rval">{fmtUsd(I ? I.grossJobValueUsdc : null)}</div></div>
            <div className="row"><div className="rlabel">USDC received · 30d</div><div className="rval">{fmtUsd(I ? I.receivedUsdc : null, 3, 3)}</div></div>
            <div className="row"><div className="rlabel">Unique counterparties</div><div className="rval">{I ? I.uniqueCounterparties : '—'}</div></div>
            <div className="row"><div className="rlabel">Recurring counterparties</div><div className="rval">{I && I.uniqueCounterparties !== null ? 0 : '—'}</div></div>
            <div className="row"><div className="rlabel">Largest customer concentration</div><div className="rval">{concentration === null ? '—' : `${concentration}%`}</div></div>
          </section>

          <section className="card half">
            <h2>Operating burn</h2>
            <div className="row"><div className="rlabel">Compute</div><div className="rval">—</div></div>
            <div className="row"><div className="rlabel">Hosting / infrastructure</div><div className="rval">—</div></div>
            <div className="row"><div className="rlabel">Tooling / APIs</div><div className="rval">—</div></div>
            <div className="row"><div className="rlabel">Onchain execution</div><div className="rval">{fmtUsd(L ? L.escrowFundedUsdc : null)} <span className="badge">funded to escrow</span></div></div>
            <div className="row"><div className="rlabel">Other agent operations</div><div className="rval">—</div></div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>Off-chain operating costs are not yet published. Only on-chain spend is shown.</div>
          </section>

          <aside className="card side">
            <h2>Benefactors</h2>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Optional external support. Not the operating strategy.</div>
            <div className="benefactor"><div className="avatar">🌰</div><div><b>Operator seed</b><small>{fmtUsd(L ? L.seedUsdc : null)} · {seedTs ? fmtDate(seedTs) : '—'}</small></div><span className="badge">1 event</span></div>
            <div className="benefactor"><div className="avatar">↗</div><div><b>Largest contribution</b><small>{fmtUsd(L ? L.seedUsdc : null)} operator seed</small></div><span className="badge">seed</span></div>
            <div className="benefactor"><div className="avatar">%</div><div><b>Runway contribution</b><small>External support / total inflows</small></div><span className="badge">{externalShare === null ? '—' : `${externalShare.toFixed(2)}%`}</span></div>
          </aside>

          <section className="card wide">
            <h2>Benefactor policy</h2>
            <div className="policy">
              Benefactors are welcome, but contributions do not direct the agents or create an obligation, entitlement, ownership interest, governance right, or earmark. Funds are received as unrestricted support and may be used at our discretion. In practice, they are intended primarily to strengthen Pipshell, Peanut, and the surrounding agent infrastructure: compute, hosting, tooling, execution, development, liquidity, and related operating needs.
            </div>
            <div style={{ marginTop: 14, color: 'var(--muted)', fontSize: 12, lineHeight: 1.55 }}>
              The core strategy remains <b style={{ color: 'var(--ink)' }}>ACP-earned income</b>. Benefactor support should extend runway, not define the economic model.
            </div>
          </section>

          <section className="card full">
            <h2>Survival history</h2>
            <div className="timeline">
              {timelineEvents.length === 0 && (
                <div className="event"><strong>Awaiting chain data</strong><div>Live events appear once the treasury ledger loads.</div></div>
              )}
              {timelineEvents.map((e, i) => (
                <div className="event" key={i}><strong>{e.title}{e.ts ? ` — ${fmtDate(e.ts)}` : ''}</strong><div>{e.detail}</div></div>
              ))}
            </div>
          </section>
        </div>

        <footer className="foot">
          <span>🌱 work → PIPS → treasury → agents → more work</span>
          <span>Sources: Base RPC · Blockscout · GeckoTerminal · CoinGecko</span>
        </footer>
      </div>
      <style jsx>{`
        .shell{
          --bg:#f3efe5;
          --paper:#fffdf7;
          --paper2:#f8f3e8;
          --ink:#26231d;
          --muted:#777063;
          --line:#d9cfbd;
          --brown:#6d4f2e;
          --green:#315f45;
          --green2:#dce9db;
          --amber:#9d6e24;
          --amber2:#f5e7c5;
          --red:#8f3f35;
          --red2:#f2d8d2;
          --shadow:0 8px 24px rgba(50,40,25,.06);
          --radius:18px;
        }
        .shell{max-width:1180px;margin:0 auto;padding:24px;color:var(--ink);
          background:
            radial-gradient(circle at 18% 0%, rgba(124,91,53,.06), transparent 28%),
            linear-gradient(var(--bg),var(--bg));
        }
        .shell :global(a){color:inherit}
        .topbar{
          display:flex;justify-content:space-between;align-items:center;gap:16px;
          padding:14px 16px;border:1px solid var(--line);border-radius:16px;background:rgba(255,253,247,.82);
          backdrop-filter:blur(8px);position:sticky;top:12px;z-index:5;box-shadow:var(--shadow)
        }
        .brand{display:flex;align-items:center;gap:10px;font-weight:800;letter-spacing:.02em}
        .brand .mark{width:34px;height:34px;border:1px solid var(--line);border-radius:11px;display:grid;place-items:center;background:var(--paper2)}
        .nav{display:flex;gap:8px;flex-wrap:wrap}
        .pill{
          border:1px solid var(--line);border-radius:999px;padding:8px 12px;background:var(--paper);
          font-size:13px;color:var(--muted);text-decoration:none
        }
        .hero{
          margin-top:22px;padding:36px;border:1px solid var(--line);border-radius:24px;background:var(--paper);
          box-shadow:var(--shadow);display:grid;grid-template-columns:1.55fr .75fr;gap:28px
        }
        .kicker{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--green);font-weight:800}
        .hero h1{font-size:clamp(38px,6vw,72px);line-height:.94;margin:12px 0 16px;letter-spacing:-.055em}
        .hero p{font-size:17px;line-height:1.55;color:var(--muted);max-width:760px;margin:0}
        .addressbox{margin-top:18px;display:flex;gap:8px;flex-wrap:wrap}
        .addr{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;padding:9px 11px;border:1px dashed var(--line);border-radius:10px;background:var(--paper2)}
        .statusCard{border:1px solid var(--line);border-radius:18px;background:var(--paper2);padding:20px;align-self:stretch}
        .statusDot{width:9px;height:9px;border-radius:50%;display:inline-block;background:var(--amber);margin-right:6px}
        .statusDot.live{background:var(--green)}
        .statusCard .big{font-size:44px;font-weight:800;letter-spacing:-.04em;margin:8px 0 0}
        .statusCard small{color:var(--muted);line-height:1.5;display:block}
        .aliveWrap{margin-top:16px;border-top:1px dashed var(--line);padding-top:14px}
        .aliveLabel{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--brown);font-weight:800}
        .clock{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:26px;font-weight:700;letter-spacing:.02em;margin-top:6px;color:var(--ink)}
        .aliveWrap small{margin-top:6px;font-size:11px}
        .grid{display:grid;grid-template-columns:repeat(12,1fr);gap:14px;margin-top:14px}
        .card{border:1px solid var(--line);border-radius:var(--radius);background:var(--paper);padding:20px;box-shadow:var(--shadow)}
        .metric{grid-column:span 3;min-height:140px}
        .metric .label{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:750}
        .metric .value{font-size:31px;font-weight:800;letter-spacing:-.035em;margin-top:14px}
        .metric .sub{font-size:12px;color:var(--muted);margin-top:5px}
        .wide{grid-column:span 8}
        .side{grid-column:span 4}
        .half{grid-column:span 6}
        .full{grid-column:1/-1}
        .card h2{font-size:20px;margin:0 0 14px}
        .sectionTitle{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:22px 2px 10px}
        .sectionTitle span{font-size:12px;color:var(--muted)}
        .runwayWrap{display:grid;grid-template-columns:220px 1fr;gap:24px;align-items:center}
        .ring{
          width:190px;height:190px;border-radius:50%;
          display:grid;place-items:center;margin:auto;position:relative
        }
        .ring:before{content:"";width:142px;height:142px;border-radius:50%;background:var(--paper);position:absolute}
        .ringText{position:relative;text-align:center}
        .ringText strong{font-size:42px;display:block;letter-spacing:-.05em}
        .ringText small{color:var(--muted)}
        .bar{height:11px;border-radius:99px;background:#ece5d9;overflow:hidden;border:1px solid #e5dccd}
        .bar>i{display:block;height:100%;background:var(--green)}
        .row{display:flex;justify-content:space-between;gap:14px;padding:10px 0;border-bottom:1px solid #eee6d8}
        .row:last-child{border:0}
        .row .rlabel{color:var(--muted);font-size:13px}
        .row .rval{font-weight:700;font-size:13px;text-align:right}
        .badge{display:inline-flex;align-items:center;gap:5px;padding:5px 8px;border-radius:999px;font-size:11px;font-weight:800;border:1px solid var(--line);background:var(--paper2)}
        .badge.green{color:var(--green);background:var(--green2);border-color:#c8dcc7}
        .badge.amber{color:var(--amber);background:var(--amber2);border-color:#e9d39c}
        .badge.red{color:var(--red);background:var(--red2);border-color:#e5bdb4}
        .flow{
          display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:10px;align-items:center
        }
        .node{border:1px solid var(--line);border-radius:16px;background:var(--paper2);padding:18px;min-height:118px}
        .node b{display:block;font-size:17px}
        .node small{display:block;color:var(--muted);margin-top:7px;line-height:1.45}
        .arrow{color:var(--brown);font-size:24px;text-align:center}
        .agentGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .agent{
          border:1px solid var(--line);border-radius:16px;background:var(--paper2);padding:18px;
          display:grid;grid-template-columns:56px 1fr;gap:14px
        }
        .agentIcon{width:56px;height:56px;border:1px solid var(--line);border-radius:16px;background:var(--paper);display:grid;place-items:center;font-size:28px}
        .agent h3{margin:2px 0 4px;font-size:18px;font-weight:700}
        .agent p{margin:0;color:var(--muted);font-size:12px;line-height:1.5}
        .agentStats{grid-column:1/-1;display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
        .mini{border-top:1px solid var(--line);padding-top:10px}
        .mini span{display:block;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.06em}
        .mini b{font-size:15px;margin-top:3px;display:block}
        .table{width:100%;border-collapse:collapse;font-size:13px}
        .table th{text-align:left;color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.07em;padding:9px 8px;border-bottom:1px solid var(--line)}
        .table td{padding:12px 8px;border-bottom:1px solid #eee6d8;vertical-align:top}
        .table tr:last-child td{border-bottom:0}
        .mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px}
        .benefactor{display:grid;grid-template-columns:42px 1fr auto;gap:10px;align-items:center;padding:12px 0;border-bottom:1px solid #eee6d8}
        .benefactor:last-child{border-bottom:0}
        .benefactor small{display:block;color:var(--muted);font-size:12px;margin-top:2px}
        .avatar{width:42px;height:42px;border-radius:13px;border:1px solid var(--line);background:var(--paper2);display:grid;place-items:center}
        .policy{
          padding:16px;border:1px solid #c8dcc7;border-radius:14px;background:var(--green2);font-size:13px;line-height:1.55
        }
        .timeline{position:relative;padding-left:18px}
        .timeline:before{content:"";position:absolute;left:5px;top:4px;bottom:4px;width:1px;background:var(--line)}
        .event{position:relative;padding:0 0 16px 12px}
        .event:before{content:"";position:absolute;left:-16px;top:5px;width:8px;height:8px;border-radius:50%;background:var(--brown);border:2px solid var(--paper)}
        .event strong{font-size:13px}
        .event div{font-size:12px;color:var(--muted);margin-top:3px}
        .foot{margin:28px 0 10px;padding:16px 2px;color:var(--muted);font-size:12px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
        @media(max-width:900px){
          .hero{grid-template-columns:1fr}.metric{grid-column:span 6}.wide,.side,.half{grid-column:1/-1}
          .runwayWrap{grid-template-columns:1fr}.flow{grid-template-columns:1fr}.arrow{transform:rotate(90deg)}
          .agentGrid{grid-template-columns:1fr}
        }
        @media(max-width:560px){.shell{padding:12px}.metric{grid-column:1/-1}.hero{padding:22px}.topbar{position:static}.nav{display:none}.agentStats{grid-template-columns:1fr}}
      `}</style>
    </Layout>
  );
}

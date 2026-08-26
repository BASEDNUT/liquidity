import Head from 'next/head';
import Layout from '../../components/Layout';

// /rwa landing — The Nut RWA Stack.
// Navigation/ontology page from Boss's existing-rwa-page-additions.md.
// Shows the states a nut passes through to become a real-world asset.

const STACK = [
  { href: '/rwa/nuts-production', step: 'LAND / BIOLOGY', title: 'NUTS PRODUCTION', desc: 'crop output · plus the NUT ATLAS — where it grows, mapped' },
  { href: '/rwa/nut-atlas', step: 'GEOGRAPHY', title: 'NUT ATLAS', desc: 'states · territories · harvest ledger' },
  { href: '/rwa/orchard-economics', step: 'COST', title: 'ORCHARD ECONOMICS', desc: 'cost · yield · balance sheet · insurance' },
  { href: '/rwa/nut-inventory-infrastructure', step: 'CUSTODY', title: 'INVENTORY & INFRASTRUCTURE', desc: 'stocks · processing · custody · warehouses' },
  { href: '/rwa/nut-trade-flows', step: 'MOVEMENT', title: 'NUT TRADE FLOWS', desc: 'corridors · border value · destinations' },
  { href: '/rwa/nut-demand', step: 'USE', title: 'NUT DEMAND', desc: 'domestic use · consumption · off-take' },
  { href: '/rwa/nut-inflation', step: 'PRICE', title: 'NUT INFLATION', desc: 'producer price · border value · retail · hedging' },
];
const CROSS = [
  { href: '/rwa/nut-stocks', title: 'NUT STOCKS', desc: 'public capital layer' },
  { href: '/rwa/carbon-debt', title: 'CARBON DEBT', desc: 'environmental / externality layer' },
];

export default function RwaIndex() {
  return (
    <Layout>
      <Head>
        <title>The Nut RWA Stack — BASED NUT</title>
        <meta name="description" content="A nut becomes a real-world asset through several states: land, economics, custody, trade, demand, and price. The RWA section maps them all." />
      </Head>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#FFF6E9 0%,#F6E7D3 100%)', padding: '64px 16px 96px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ letterSpacing: 2, fontSize: 12, fontWeight: 800, color: '#8A623F', textTransform: 'uppercase', margin: 0 }}>BASED NUT · Real-World Assets</p>
          <h1 style={{ fontFamily: 'inherit', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, color: '#4A2E1A', margin: '12px 0 8px' }}>The Nut RWA Stack</h1>
          <p style={{ color: '#5D3A1A', fontSize: '1.05rem', maxWidth: 640, lineHeight: 1.6, margin: '0 0 40px' }}>
            A nut becomes a real-world asset through several different states. Land and trees produce the crop.
            Harvest turns biological output into inventory. Handlers and warehouses create custody. Trade connects
            inventory to markets. Demand removes it from supply. Prices determine clearing value. Capital finances
            the system; insurance and environmental liabilities modify its risk.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {STACK.map((s, i) => (
              <a key={s.href} href={s.href} style={{ textDecoration: 'none', display: 'flex', alignItems: 'stretch', background: '#FFFDF8', border: '1px solid #E4D2B8', borderTopLeftRadius: i === 0 ? 14 : 0, borderTopRightRadius: i === 0 ? 14 : 0, borderBottomLeftRadius: i === STACK.length - 1 ? 14 : 0, borderBottomRightRadius: i === STACK.length - 1 ? 14 : 0, marginBottom: i === STACK.length - 1 ? 0 : -1, overflow: 'hidden', transition: 'transform .2s ease, box-shadow .2s ease' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(74,46,26,.12)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ minWidth: 120, background: 'linear-gradient(160deg,#7D5A50,#4A2E1A)', color: '#FFF6E9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 12px', fontWeight: 800, fontSize: 12, letterSpacing: 1.5, textAlign: 'center' }}>{s.step}{i < STACK.length - 1 && <span style={{ fontSize: 18, marginTop: 8, opacity: 0.7 }}>↓</span>}</div>
                <div style={{ padding: '18px 22px', flex: 1 }}>
                  <div style={{ fontWeight: 900, color: '#4A2E1A', fontSize: '1.05rem' }}>{s.title}</div>
                  <div style={{ color: '#8A623F', fontSize: '0.9rem', marginTop: 2 }}>{s.desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px', color: '#A67C52', fontWeight: 900 }}>→</div>
              </a>
            ))}
          </div>
          <p style={{ letterSpacing: 2, fontSize: 12, fontWeight: 800, color: '#8A623F', textTransform: 'uppercase', margin: '40px 0 12px' }}>Cross-cutting layers</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>
            {CROSS.map((c) => (
              <a key={c.href} href={c.href} style={{ textDecoration: 'none', background: '#FFFDF8', border: '1px solid #E4D2B8', borderRadius: 14, padding: '18px 22px', display: 'block' }}>
                <div style={{ fontWeight: 900, color: '#4A2E1A' }}>{c.title} <span style={{ color: '#A67C52' }}>→</span></div>
                <div style={{ color: '#8A623F', fontSize: '0.9rem', marginTop: 2 }}>{c.desc}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

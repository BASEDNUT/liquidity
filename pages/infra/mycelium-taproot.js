import Head from 'next/head';
import Layout from '../../components/Layout';
import data from '../../src/data/myceliumTaproot.json';

// Mycelium + Taproot — Orchard infrastructure page.
// Boss-supplied mycelium-taproot-orchard.html ported verbatim: pure static, no scripts.
// CSS scoped under .myctl (two sequential :root overrides preserved as cascade).

export default function MyceliumTaproot() {
  return (
    <Layout>
      <Head>
        <title>Mycelium + Taproot | BASED NUT</title>
        <meta name="description" content="Sovereignty without isolation. The network beneath the network — Mycelium protocol, Taproot node, live social protocol surface for agents." />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: data.css }} />
      <div className="myctl" dangerouslySetInnerHTML={{ __html: data.html }} />
    </Layout>
  );
}

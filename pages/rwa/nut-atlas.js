import Head from 'next/head';
import { useEffect } from 'react';
import Layout from '../../components/Layout';
import data from '../../src/data/nutAtlas.json';

// SHOW ME THE NUTS — USA + Territories nut atlas.
// Boss-supplied based-nut-usa-territories-nut-atlas-v2.html ported verbatim.
// The atlas is an ES module: it dynamically imports d3 + topojson + us-atlas from CDN
// and renders SVG maps, with a graceful fallback if the geographic layer cannot load.
// CSS scoped under .atlas (light + prefers-color-scheme:dark themes preserved).

export default function NutAtlas() {
  useEffect(() => {
    const s = document.createElement('script');
    s.type = 'module';
    s.textContent = data.script;
    document.body.appendChild(s);
    return () => {
      s.remove();
    };
  }, []);

  return (
    <Layout>
      <Head>
        <title>SHOW ME THE NUTS — USA + Territories</title>
        <meta name="description" content="The nut map — 2025 harvest ledger, state production, territories, growers on the ground, and wild mast density across the USA." />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: data.css }} />
      <div className="atlas" dangerouslySetInnerHTML={{ __html: data.html }} />
    </Layout>
  );
}

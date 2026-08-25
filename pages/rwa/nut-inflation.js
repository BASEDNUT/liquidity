import Head from 'next/head';
import { useEffect } from 'react';
import Layout from '../../components/Layout';
import data from '../../src/data/nutStandard.json';

// The Nut Standard — Orchard RWA page.
// Boss-supplied orchard_nut_inflation.html ported 100% verbatim:
// markup, script, and design untouched; CSS scoped under .nutstd to live inside site chrome.
// Data is static, cited, and local-only (no network calls).

export default function NutInflation() {
  useEffect(() => {
    try {
      new Function(data.script)();
    } catch (e) {
      console.error('[nut-standard] init failed', e);
    }
  }, []);

  return (
    <Layout>
      <Head>
        <title>The Nut Standard — Orchard</title>
        <meta name="description" content="The Nut Standard — a standalone Orchard page measuring dollars, CPI, gold, bitcoin, productive acres, farm enterprises, and land in nuts." />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: data.css }} />
      <div className="nutstd" dangerouslySetInnerHTML={{ __html: data.html }} />
    </Layout>
  );
}

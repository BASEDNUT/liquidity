import Head from 'next/head';
import { useEffect } from 'react';
import Layout from '../../components/Layout';
import data from '../../src/data/nutStocks.json';

// NUT Equities — Orchard RWA page.
// Boss-supplied index(7).html ported verbatim: markup, filter script, and design untouched.
// CSS scoped under .nutstocks; data is static, cited (issuer filings, USDA), local-only.

export default function NutStocks() {
  useEffect(() => {
    try {
      new Function(data.script)();
    } catch (e) {
      console.error('[nut-stocks] init failed', e);
    }
  }, []);

  return (
    <Layout>
      <Head>
        <title>NUT Equities — Global Nut Stocks</title>
        <meta name="description" content="Nuts, publicly traded. Growers, farmland, processors, brands and small caps across the global nut economy — with filings and market sources." />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: data.css }} />
      <div className="nutstocks" dangerouslySetInnerHTML={{ __html: data.html }} />
    </Layout>
  );
}

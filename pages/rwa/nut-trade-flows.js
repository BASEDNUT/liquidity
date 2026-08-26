import Head from 'next/head';
import { useEffect } from 'react';
import Layout from '../../components/Layout';
import data from '../../src/data/nutTradeFlows.json';

// NUT Trade Flows — Orchard RWA page.
// Boss-supplied nut-trade-flows-final.html ported verbatim: markup, chart script, design untouched.
// CSS scoped under .nutflows; data is static, cited (USDA FAS + WITS/UN Comtrade), local-only.

export default function NutTradeFlows() {
  useEffect(() => {
    try {
      new Function(data.script)();
    } catch (e) {
      console.error('[nut-trade-flows] init failed', e);
    }
  }, []);

  return (
    <Layout>
      <Head>
        <title>NUT Trade Flows — BASED NUT RWA</title>
        <meta name="description" content="Nut trade is the circulation layer. 2024 almond and pistachio trade corridors, global exporters, and demand hubs using USDA FAS and UN Comtrade/WITS data." />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: data.css }} />
      <div className="nutflows" dangerouslySetInnerHTML={{ __html: data.html }} />
    </Layout>
  );
}

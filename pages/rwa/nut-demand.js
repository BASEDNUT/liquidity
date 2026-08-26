import Head from 'next/head';
import Layout from '../../components/Layout';
import data from '../../src/data/nutDemand.json';

// Nut Demand — Orchard RWA page.
// Boss-supplied nut-demand.html ported verbatim: markup + design untouched.
// CSS scoped under .nutdem; static, cited (USDA ERS + FAS), local-only.

export default function NutDemand() {
  return (
    <Layout>
      <Head>
        <title>Nut Demand — BASED NUT RWA</title>
        <meta name="description" content="Where the crop disappears into use. Per-capita consumption, domestic disappearance, and the demand equation behind tree nuts." />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: data.css }} />
      <div className="nutdem" dangerouslySetInnerHTML={{ __html: data.html }} />
    </Layout>
  );
}

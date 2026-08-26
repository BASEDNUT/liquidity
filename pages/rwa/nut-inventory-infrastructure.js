import Head from 'next/head';
import Layout from '../../components/Layout';
import data from '../../src/data/nutInventory.json';

// Nut Inventory & Infrastructure — Orchard RWA page.
// Boss-supplied nut-inventory-infrastructure.html ported verbatim: markup + design untouched.
// CSS scoped under .nutinv; static, cited (USDA NASS Cold Storage), local-only.

export default function NutInventoryInfrastructure() {
  return (
    <Layout>
      <Head>
        <title>Nut Inventory & Infrastructure — BASED NUT RWA</title>
        <meta name="description" content="Inventory is the collateral layer. Cold storage stocks, processing custody, and the public-data boundary from orchard to warehouse." />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: data.css }} />
      <div className="nutinv" dangerouslySetInnerHTML={{ __html: data.html }} />
    </Layout>
  );
}

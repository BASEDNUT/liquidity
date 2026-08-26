import Head from 'next/head';
import Layout from '../../components/Layout';
import data from '../../src/data/orchardEconomics.json';

// Orchard Economics — Orchard RWA page.
// Boss-supplied orchard-economics.html ported verbatim: markup + design untouched.
// CSS scoped under .orchec; static, cited, local-only (no network calls).

export default function OrchardEconomics() {
  return (
    <Layout>
      <Head>
        <title>Orchard Economics — BASED NUT RWA</title>
        <meta name="description" content="An orchard is a capital project that grows. Establishment cost, yield, balance sheet, and insurance from UC Cooperative Extension sample costs." />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: data.css }} />
      <div className="orchec" dangerouslySetInnerHTML={{ __html: data.html }} />
    </Layout>
  );
}

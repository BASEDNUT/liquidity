import Head from 'next/head';
import { useEffect } from 'react';
import data from '../src/data/wnut.json';

// wNUT — Wrapped NUT Observatory.
// Boss-supplied wnut.html scaffold ported verbatim: markup, chart script, dark design untouched.
// CSS scoped under .wnut; standalone dark surface with its own topbar (way-home to / and /token/nut).
// Live data via /api/wnut-data (Base RPC + Moralis event tape).

export default function WNut() {
  useEffect(() => {
    try {
      new Function(data.script)();
    } catch (e) {
      console.error('[wnut] init failed', e);
    }
  }, []);

  return (
    <>
      <Head>
        <title>wNUT — Wrapped NUT Observatory | BASED NUT</title>
        <meta name="description" content="wNUT live wrapper-state observatory for BASED NUT on Base. Outstanding supply, underlying backing, wrap/unwrap flows, distribution, holders, and verified markets." />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: data.css }} />
      <div className="wnut" dangerouslySetInnerHTML={{ __html: data.html }} />
    </>
  );
}

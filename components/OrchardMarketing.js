import React from "react";
import OrchardBoard from "./OrchardBoard";

// Orchard marketing layer — ported from Boss-supplied based-nut-orchard-v15 index.html (S84).
// Appended AFTER our hero + cards (trees first). v15 chrome stripped: topbar nav,
// explorer cards, footer, JS. The v15 tree-canopy hero opens the layer (Boss request). OUR live OrchardBoard sits at his "Under the bark" ledger slot.
// Plant CTA repointed to /pair-your-token. Docs references wired. CSS scoped under
// .orchard-marketing — no :root/body/html leakage into the MUI site theme.
// Copy is verbatim v15; sections render via dangerouslySetInnerHTML (static SVG-heavy HTML).
export default function OrchardMarketing({ tokens = [], pools = [], marketData = null }) {
  const PART_H = `<section class="hero"><div class="skygrain"></div><span class="nut n1"></span><span class="nut n2"></span><span class="nut n3"></span><span class="nut n4"></span><div class="hero-inner"><div class="kicker">Base mainnet · one root below the canopy</div><h1>THE ORCHARD<span>BASED NUT</span></h1><div class="hero-copy">Every forest starts with one nut.<br/><strong>This forest only gets one.</strong></div><div class="hero-note">1 NUT · 10¹⁸ attoNUTs · everything else is structure</div></div><div class="canopy"><div class="tree t1"><div class="trunk"></div><div class="crown"></div></div><div class="tree t2"><div class="trunk"></div><div class="crown"></div></div><div class="tree t3"><div class="trunk"></div><div class="crown"></div></div><div class="tree t4"><div class="trunk"></div><div class="crown"></div></div><div class="tree t5"><div class="trunk"></div><div class="crown"></div></div><div class="hill"></div></div></section>`;
  const PART_A = `<section class="advanced-intro" id="field-notes">
<div class="intro-card">
<div class="eyebrow">How it fits together</div>
<h2>Five layers, one Orchard.</h2><p class="lead">The cards above are the trees. This part is how they fit together — from the one root token up to the whole network. See it live in the <a href="/atlas" style="color:#4f6f42;font-weight:800;text-decoration:underline">Orchard Atlas</a> and <a href="/atlas/data" style="color:#4f6f42;font-weight:800;text-decoration:underline">Atlas Data</a>.</p>
<div class="five-layers">
<div class="layer"><small>01 / root asset</small> <strong>NUT</strong><p>The root token. Supply = 1, forever.</p></div>
<div class="layer"><small>02 / wrapped form</small> <strong>wNUT</strong><p>Wrapped NUT. Same asset, converts 1:1, used by the multi-asset pools below.</p></div>
<div class="layer"><small>03 / structures</small> <strong>Branches · Grafts · Whorls</strong><p>The pools themselves: two-token pairs, wNUT-rooted trios, multi-asset baskets.</p></div>
<div class="layer"><small>04 / groves</small> <strong>Groupings</strong><p>Pools collected by role or history. One pool can sit in several groves.</p></div>
<div class="layer"><small>05 / Orchard</small> <strong>the whole system</strong><p>All of the assets, pools and groves together form the Orchard.</p></div>
</div>

</div>
</section>

<section class="scale-section" id="two-scales">
<div class="scale-inner">
  <div class="scale-head">
    <div>
      <div class="eyebrow">Field note · 001 / two forms</div>
      <h2>NUT comes in two forms.</h2>    </div>
    <p>NUT exists in two interchangeable forms: <a href="/token/nut" style="color:#4f6f42;font-weight:800;text-decoration:underline">NUT</a> itself and <a href="/token/wnut" style="color:#4f6f42;font-weight:800;text-decoration:underline">wrapped NUT (wNUT)</a>. They convert 1:1 at any time. Some Balancer pools use wNUT instead of NUT — the six pools shown below. Pools holding NUT form the NUT scale; pools holding wNUT form the wNUT scale.</p>
  </div>

  <div class="scale-story">

    <article class="scale-stage">
      <div class="scale-stage-head">
        <div><small>Exhibit A · NUT scale</small><h3>Markets that touch the root directly.</h3></div>
        <p>Every line below means the corresponding structure contains NUT itself. Parallel venues can share the same counter-asset without becoming one market.</p>
      </div>
      <div class="scale-stage-visual">
        <svg viewBox="0 0 1000 420" role="img" aria-label="NUT-rooted direct market structures">
          <defs><filter id="v15rootshadow"><feDropShadow dx="0" dy="7" stdDeviation="8" flood-color="#563925" flood-opacity=".13"/></filter></defs>

          <circle cx="500" cy="210" r="64" class="v15-root" filter="url(#v15rootshadow)"/>
          <text x="500" y="205" text-anchor="middle" class="v15-label-light">NUT</text>
          <text x="500" y="228" text-anchor="middle" class="v15-sub-light">ROOT ASSET</text>

          <path d="M446 176 L257 94 M436 210 L170 210 M446 244 L257 327 M554 176 L743 94 M564 210 L830 210 M554 244 L743 327" class="v15-root-edge"/>

          <circle cx="230" cy="82" r="41" class="v15-node"/>
          <text x="230" y="79" text-anchor="middle" class="v15-label">WETH</text>
          <text x="230" y="101" text-anchor="middle" class="v15-sub">parallel venues</text>

          <circle cx="138" cy="210" r="36" class="v15-node"/>
          <text x="138" y="215" text-anchor="middle" class="v15-label">AERO</text>

          <circle cx="230" cy="340" r="39" class="v15-node"/>
          <text x="230" y="345" text-anchor="middle" class="v15-label">cbBTC</text>

          <circle cx="770" cy="82" r="39" class="v15-node"/>
          <text x="770" y="87" text-anchor="middle" class="v15-label">SNUT</text>

          <circle cx="862" cy="210" r="36" class="v15-node"/>
          <text x="862" y="215" text-anchor="middle" class="v15-label">SALT</text>

          <circle cx="770" cy="340" r="42" class="v15-node"/>
          <text x="770" y="345" text-anchor="middle" class="v15-label">NUTINO</text>

          <text x="500" y="387" text-anchor="middle" class="v15-sub">DIRECT NUT MEMBERSHIP · ROOT-SCALE STRUCTURES</text>
        </svg>
      </div>
      <div class="scale-stage-foot">
        <span><strong>NUT scale = NUT sits inside the pool.</strong></span><span>WETH · AERO · cbBTC · SNUT · SALT · NUTINO</span>
      </div>
    </article>

    <div class="wrapper-exhibit" aria-label="Exact NUT to wNUT wrapper transition">
      <div class="wrapper-state"><small>root state</small> <strong>NUT</strong></div>
      <div class="wrapper-core">
        <div class="wrapper-line"></div>
        <strong>1 : 1 wrapper rail</strong>
        <span>wrap / unwrap at any time · same asset, two forms</span>
        <div class="wrapper-line"></div>
      </div>
      <div class="wrapper-state"><small>wrapped form</small> <strong>wNUT</strong></div>
    </div>

    <article class="scale-stage">
      <div class="scale-stage-head">
        <div><small>Exhibit B · wNUT scale</small><h3>Six Balancer pools hold wNUT.</h3></div>
        <p>Each spoke is one Balancer pool: wNUT plus two external tokens — gtINF = wNUT + VVV + DIEM, gtBTC = wNUT + cbBTC + tBTC, and so on. Six pools, one shared ingredient.</p>
      </div>
      <div class="scale-stage-visual">
        <svg viewBox="0 0 1000 500" role="img" aria-label="wNUT-rooted Sunflower Twin Grafts">
          <defs><filter id="v15stockshadow"><feDropShadow dx="0" dy="7" stdDeviation="9" flood-color="#46583b" flood-opacity=".13"/></filter></defs>

          <circle cx="500" cy="250" r="67" class="v15-rootstock" filter="url(#v15stockshadow)"/>
          <text x="500" y="245" text-anchor="middle" class="v15-label" style="font-size:18px">wNUT</text>
          <text x="500" y="268" text-anchor="middle" class="v15-sub">wNUT FORM</text>

          <path d="M455 203 L302 104 M500 183 L500 75 M545 203 L698 104 M567 250 L818 250 M545 297 L698 396 M455 297 L302 396" class="v15-graft-edge"/>

          <rect x="206" y="67" width="192" height="73" rx="22" class="v15-graft-box"/>
          <text x="302" y="94" text-anchor="middle" class="v15-graft-title">gtBTC</text>
          <text x="302" y="116" text-anchor="middle" class="v15-graft-pair">cbBTC · tBTC</text>

          <rect x="404" y="32" width="192" height="73" rx="22" class="v15-graft-box"/>
          <text x="500" y="59" text-anchor="middle" class="v15-graft-title">gtINF</text>
          <text x="500" y="81" text-anchor="middle" class="v15-graft-pair">VVV · DIEM</text>

          <rect x="602" y="67" width="192" height="73" rx="22" class="v15-graft-box"/>
          <text x="698" y="94" text-anchor="middle" class="v15-graft-title">gtAGT</text>
          <text x="698" y="116" text-anchor="middle" class="v15-graft-pair">VIRTUAL · MOR</text>

          <rect x="722" y="214" width="192" height="73" rx="22" class="v15-graft-box"/>
          <text x="818" y="241" text-anchor="middle" class="v15-graft-title">gtETH</text>
          <text x="818" y="263" text-anchor="middle" class="v15-graft-pair">cbETH · wstETH</text>

          <rect x="602" y="360" width="192" height="73" rx="22" class="v15-graft-box"/>
          <text x="698" y="387" text-anchor="middle" class="v15-graft-title">gtFX</text>
          <text x="698" y="409" text-anchor="middle" class="v15-graft-pair">USDC · EURC</text>

          <rect x="206" y="360" width="192" height="73" rx="22" class="v15-graft-box"/>
          <text x="302" y="387" text-anchor="middle" class="v15-graft-title">gtSIL</text>
          <text x="302" y="409" text-anchor="middle" class="v15-graft-pair">NVDAc · AAPLc</text>

          <text x="500" y="474" text-anchor="middle" class="v15-sub">SIX POOLS · SHARED wNUT · DISTINCT STRUCTURES</text>
        </svg>
      </div>
      <div class="scale-stage-foot">
        <span><strong>wNUT 20% · each external token 40%</strong> — the weights each pool uses</span>
      </div>
    </article>

    <div class="whorl-handoff">
      <div class="glyph">🥜</div>
      <div>
        <strong>Whorls do not belong on either rooted diagram.</strong>
        <p>pNUT, mNUT and nNUT are unrooted multi-asset structures. A Whorl may contain NUT or wNUT as an equal constituent and therefore touch one scale, but that does not turn the constituent into a distinguished rootstock.</p>
      </div>
      <a href="#whorl-family">See the Whorl family ↓</a>
    </div>

  </div>
</div>
</section>

<section class="structure-section">
<div class="structure-head"><div class="eyebrow">Field note · 002 / structures</div><h2>Three pool structures.</h2><p>A two-token pair (Branch), a wNUT-rooted trio (Graft), and a rootless multi-asset basket (Whorl) follow different math, routes and failure modes.</p></div>
<div class="structure-grid">
<article class="structure-card"><div class="structure-visual"><svg role="img" viewbox="0 0 360 360"><circle class="spec-root2" cx="92" cy="175" r="38"></circle><circle class="spec-node2" cx="268" cy="175" r="38"></circle><path class="spec-edge2" d="M130 175 L230 175"></path><path class="spec-edge2 dash" d="M130 160 C168 135 201 135 230 160"></path><path class="spec-edge2 dash" d="M130 190 C168 215 201 215 230 190"></path><text fill="#fff3da" font-size="12" font-weight="900" text-anchor="middle" x="92" y="180">NUT</text><text class="spec-label2" text-anchor="middle" x="268" y="180">WETH</text><text class="spec-small2" text-anchor="middle" x="180" y="128">MULTIPLICITY: SAME PAIR, MANY VENUES</text></svg></div><div class="structure-copy"><small>Branch / two assets</small><h3>Two assets, one pool.</h3><p>One pool with two assets. Example: NUT / WETH — live on <a href="/pool/nut-weth-uniswap-v3" style="color:#4f6f42;font-weight:800;text-decoration:underline">Uniswap V3</a> and <a href="/pool/nut-weth-uniswap-v2" style="color:#4f6f42;font-weight:800;text-decoration:underline">V2</a>.</p></div></article>
<article class="structure-card"><div class="structure-visual"><svg role="img" viewbox="0 0 360 360"><circle class="spec-rootstock2" cx="180" cy="226" r="42"></circle><circle class="spec-node2" cx="98" cy="130" r="34"></circle><circle class="spec-node2" cx="262" cy="130" r="34"></circle><path class="spec-edge2" d="M155 196 L116 158"></path><path class="spec-edge2" d="M205 196 L244 158"></path><path class="spec-edge2 dash" d="M132 130 C163 107 197 107 228 130"></path><text class="spec-label2" text-anchor="middle" x="180" y="222">wNUT</text><text class="spec-small2" text-anchor="middle" x="180" y="238">wNUT · 20%</text><text class="spec-label2" text-anchor="middle" x="98" y="135">S₁</text><text class="spec-label2" text-anchor="middle" x="262" y="135">S₂</text><text class="spec-small2" text-anchor="middle" x="180" y="291">wNUT 20% · TWO EXTERNAL 40% EACH</text></svg></div><div class="structure-copy"><small>Graft / rooted trio</small><h3>Three assets, wNUT inside.</h3><p>One pool with wNUT plus two external assets. Example: gtBTC = wNUT / cbBTC / tBTC at 20/40/40 — <a href="/sunflower-grove" style="color:#4f6f42;font-weight:800;text-decoration:underline">live Balancer pools</a>.</p></div></article>
<article class="structure-card"><div class="structure-visual"><svg role="img" viewbox="0 0 360 360"><path class="peanut-shell" d="M52 178 C52 119 93 84 145 88 C174 90 193 104 210 122 C226 105 245 96 275 98 C326 101 340 141 322 180 C305 216 274 234 240 234 C223 234 212 230 200 224 C188 240 171 249 148 250 C95 253 52 224 52 178Z"></path><path class="peanut-rib" d="M88 116 C119 98 153 100 183 119"></path><path class="peanut-rib" d="M239 122 C265 107 294 112 312 132"></path><circle class="spec-node2" cx="187" cy="112" r="26"></circle><circle class="spec-node2" cx="258" cy="169" r="26"></circle><circle class="spec-node2" cx="187" cy="226" r="26"></circle><circle class="spec-node2" cx="116" cy="169" r="26"></circle><path class="spec-edge2" d="M204 128 L241 152"></path><path class="spec-edge2" d="M241 186 L204 210"></path><path class="spec-edge2" d="M170 210 L133 186"></path><path class="spec-edge2" d="M133 152 L170 128"></path><path class="spec-edge2" d="M187 138 L187 198"></path><path class="spec-edge2" d="M142 169 L232 169"></path><text class="spec-label2" text-anchor="middle" x="187" y="116">wNUT</text><text class="spec-label2" text-anchor="middle" x="258" y="173">SNUT</text><text class="spec-label2" text-anchor="middle" x="187" y="230">cbETH</text><text class="spec-label2" text-anchor="middle" x="116" y="173">cbBTC</text><text class="spec-small2" text-anchor="middle" x="187" y="291">ONE 4-ASSET POOL · NO PRIVILEGED ASSET</text></svg></div><div class="structure-copy"><small>Whorl / multi-asset basket</small><h3>Three or more, no root.</h3><p>One pool with three or more peer assets; no designated root. Example: pNUT = wNUT / SNUT / cbETH / cbBTC at 25% each — <a href="/token/pnut" style="color:#4f6f42;font-weight:800;text-decoration:underline">live Balancer pool</a>.</p></div></article>
</div>
<div class="grove-not-structure"><strong>A grove groups related structures.</strong> <span>One pool can belong to several groves at once — by economics, function, mechanism or history.</span></div>
</section>

<section class="soil-section">
<div class="field-grid">
<div class="copy"><div class="eyebrow">Field note · 003 / soil &amp; scions</div><h2>Foreign assets enter as soil.</h2><p class="lead">Assets that were not created by Based NUT are called soil.</p><p>Examples: ETH, BTC, stablecoins, AI tokens, tokenized stocks. When paired with NUT or wNUT they provide external liquidity to the Orchard. The two external assets inside a Graft pool are called <strong>scions</strong> — twelve verified scions across six pools.</p><div class="aside">Inference · Agents · Ether · Bitcoin · FX · Silicon.</div></div>
<div class="soil-display"><div class="surface-label">BASE / FOREIGN MATTER BELOW</div><svg role="img" viewbox="0 0 620 460"><circle cx="310" cy="78" fill="#e7ecd8" r="41" stroke="#5f774c" stroke-width="2"></circle><text class="top-text" text-anchor="middle" x="310" y="83">wNUT</text><path class="rootpath" d="M310 119 C310 150 310 170 310 198"></path><path class="rootpath" d="M310 198 C270 235 205 268 113 329"></path><path class="rootpath" d="M310 198 C293 264 274 319 255 396"></path><path class="rootpath" d="M310 198 C350 244 419 281 510 337"></path><path class="rootpath fine" d="M306 216 C246 227 188 235 88 268"></path><path class="rootpath fine" d="M314 215 C377 226 442 238 552 264"></path><g><polygon class="mineral-node" points="63,245 92,228 120,247 114,277 84,287 59,268"></polygon><text class="mineral-text" text-anchor="middle" x="90" y="259">VVV</text><polygon class="mineral-node" points="96,319 129,306 157,329 149,363 116,371 90,348"></polygon><text class="mineral-text" text-anchor="middle" x="124" y="343">DIEM</text><polygon class="mineral-node" points="223,374 257,359 287,380 279,414 245,426 218,404"></polygon><text class="mineral-text" text-anchor="middle" x="252" y="397">cbBTC</text><polygon class="mineral-node" points="388,380 420,365 449,386 442,419 409,430 383,409"></polygon><text class="mineral-text" text-anchor="middle" x="416" y="402">tBTC</text><polygon class="mineral-node" points="464,319 496,305 525,328 518,361 483,371 457,349"></polygon><text class="mineral-text" text-anchor="middle" x="491" y="342">USDC</text><polygon class="mineral-node" points="516,238 547,223 576,244 568,278 534,287 507,264"></polygon><text class="mineral-text" text-anchor="middle" x="542" y="258">EURC</text></g><text class="mineral-text" opacity=".78" text-anchor="middle" x="310" y="446">+ VIRTUAL · MOR · cbETH · wstETH · NVDAc · AAPLc</text></svg></div>
</div>
</section>

<section class="projection-section">
<div class="projection-inner">
<div class="projection-head"><div><div class="eyebrow">Field note · 004 / groves</div><h2>Groves group the pools.</h2></div><p>A grove is a collection of related pools. Three are named: <strong>Sunflower</strong> (six similarly designed graft pools), <strong>Heirloom</strong> (the historically important originals), <strong>Polyforest</strong> (routes across different market mechanisms).</p></div>

<div class="projection-grid">
<article class="projection sun"><div class="glyph">🌻</div><small>standardized planting</small><h3>Sunflower Grove</h3><p>Six Balancer pools, each holding wNUT plus two external assets — inference, agents, ether, bitcoin, FX and tokenized equities. Together they form the Sunflower Grove.</p><div class="metric"><strong>6</strong> live Twin Grafts · 20/40/40</div><div class="snapshot-warning"><strong>LIVE</strong> · six grafts · experiment-scale liquidity</div></article>
<article class="projection heirloom"><div class="glyph">🏺</div><small>historical structures</small><h3>Heirloom Grove</h3><p>The original pairs, the original pNUT V2 Quad, the current V3 Whorl, and MintClub curves — live and retired structures kept together because history matters.</p><div class="metric">foundational structures · <strong>heritage</strong></div><div class="snapshot-warning"><strong>HERITAGE</strong> · foundational and retired structures retained</div></article>
<article class="projection poly"><div class="glyph">🌲</div><small>routes across different market types</small><h3>Polyforest Grove</h3><p>Routes that pass through several market types — Balancer, Aerodrome, bonding curves. We group these mixed routes under the Polyforest Grove.</p><div class="metric"><strong>219</strong> rings · 32 wrapper-dependent</div><div class="snapshot-warning">Atlas census snapshot · <strong>2026-08-28</strong></div><div class="snapshot-warning"><strong>SNAPSHOT</strong> · cycle census requires recomputation as registry changes</div></article>
</div>
</div>
</section>

<section class="physics-section" id="cultivation">
<div class="physics-inner">
<div class="section-head">
<div><div class="eyebrow">Field note · 005 / market types</div><h2>Every venue has its own math.</h2></div>
<p>The Orchard uses several kinds of markets. Each prices and manages liquidity differently.</p>
</div>
<div class="mechanism-grid">
<article class="mechanism"><div class="micon">⌖</div><small>Concentrated</small><h3>Uni V3 / Slipstream / CL</h3><p>Liquidity providers choose price ranges, so liquidity is deeper in some ranges than others.</p><div class="law">ticks · sqrtPrice · fee tier</div></article>
<article class="mechanism"><div class="micon">×</div><small>Constant product</small><h3>Uni V2 / Aerodrome vAMM</h3><p>Two-token pools where price changes as the reserve ratio changes.</p><div class="law">x · y = k</div></article>
<article class="mechanism"><div class="micon">◉</div><small>Weighted</small><h3>Balancer V2 / V3</h3><p>Multi-asset pools where each asset has a target weight. The grafts and whorls live here.</p><div class="law">weights are part of the form</div></article>
<article class="mechanism"><div class="micon">↔</div><small>Adaptive range</small><h3>reCLAMM</h3><p>A concentrated pool whose range can move over time. range moves over time · NUT/SALT + PIPS/USDC live</p><div class="law">range state matters</div></article>
<article class="mechanism"><div class="micon">⌁</div><small>Bonding curve</small><h3>Mint Club</h3><p>Tokens are minted or redeemed against a reserve using a predefined price curve. No LP deposit — the curve itself is the liquidity.</p><div class="law">buy ≠ sell · supply moves</div></article>
<article class="mechanism"><div class="micon">◇</div><small>Fruit / discrete inventory</small><h3>Sudoswap NFT AMMs</h3><p>NUT Army assets are whole, non-fungible inventory. Their Sudoswap markets trade whole NFTs against fungible quote assets.</p><div class="law">whole-NFT inventory · curve quote</div></article>
<article class="mechanism"><div class="micon">1:1</div><small>1:1 wrapper</small><h3>NUT ⇄ wNUT</h3><p>Wrapping is not trading — it converts between the two forms at exactly 1:1.</p><div class="law">always exactly 1:1</div></article>
<article class="mechanism"><div class="micon">LP²</div><small>Meta-market</small><h3>Liquidity on liquidity</h3><p>An LP claim can itself trade in another pool. SNUT-LP/WETH turns underlying liquidity into a second-order market.</p><div class="law">LP tokens get their own price</div></article>
</div>
<div class="physics-note"><strong>A route can leave through one market type and come back through another.</strong> Mixed-mechanism routes are grouped in the Polyforest Grove.</div>
<div class="discrete-note"><div class="fruit">⚔️🥜</div><div><strong>Fruit is discrete.</strong> <span>The NUT Army adds a non-fungible inventory layer: NUT-backed Mint Club mint/redemption on one side, whole-NFT Sudoswap secondary markets on the other. Whole NFTs instead of fungible fractions — a different unit of inventory.</span></div></div>
</div>
</section>

<section class="metadex-section" id="metadex">
<div class="metadex-inner">
<div class="metadex-card">
<div class="metadex-copy">
<div class="eyebrow">Field note · 006 / MetaDEX</div>
<h2>The market between markets has no pool.</h2><p class="lead">A DEX contains markets. <strong>The Orchard contains relationships between markets.</strong></p>
<p>Each venue sets its own NUT price from its own reserves. No contract needs to publish one canonical Orchard price.</p>
<p>If NUT is cheaper on Uniswap than Aerodrome, an arbitrageur buys on Uniswap and sells on Aerodrome — and the two prices move toward each other. <strong>Those trades connect every market in the Orchard.</strong></p>
<div class="metaquote">Arbitrage is the mechanism. Pollination is our name for the price transmission it causes.</div>
<div class="market-key"><div><small>own price</small> <strong>Every venue prices from its own reserves.</strong></div><div><small>derived prices</small> <strong>Some values come from other pools — a basket share or LP token is worth what sits inside it.</strong></div><div><small>arbitrage</small> <strong>When venues disagree enough, traders move value between them until prices align.</strong></div></div>
</div>
<div class="market-map">
<svg viewBox="0 0 680 570" role="img" aria-label="MetaDEX diagram showing local market states coupled by arbitrage">
<circle cx="340" cy="282" r="49" class="mm-root"></circle><text x="340" y="279" text-anchor="middle" class="mm-white">NUT</text><text x="340" y="298" text-anchor="middle" class="mm-small" fill="#ead7bc">COMMON ROOT</text>
<rect x="74" y="90" width="165" height="82" rx="18" class="mm-market"></rect><text x="156" y="121" text-anchor="middle" class="mm-label">UNISWAP V3</text><text x="156" y="145" text-anchor="middle" class="mm-small">LOCAL PRICE P₁</text>
<rect x="440" y="90" width="165" height="82" rx="18" class="mm-market"></rect><text x="522" y="121" text-anchor="middle" class="mm-label">AERODROME</text><text x="522" y="145" text-anchor="middle" class="mm-small">LOCAL PRICE P₂</text>
<rect x="444" y="398" width="165" height="82" rx="18" class="mm-market"></rect><text x="526" y="429" text-anchor="middle" class="mm-label">BALANCER</text><text x="526" y="453" text-anchor="middle" class="mm-small">BPT / IMPLIED NAV</text>
<rect x="70" y="398" width="165" height="82" rx="18" class="mm-market"></rect><text x="152" y="429" text-anchor="middle" class="mm-label">MINT CLUB</text><text x="152" y="453" text-anchor="middle" class="mm-small">MINT / REDEEM</text>
<path d="M239 151 C286 174 306 208 323 236" class="mm-edge"></path><path d="M440 151 C395 176 374 207 357 236" class="mm-edge"></path><path d="M444 425 C397 397 372 360 356 328" class="mm-edge"></path><path d="M235 425 C281 397 306 360 324 328" class="mm-edge"></path>
<path d="M238 103 C310 58 371 58 440 103" class="mm-pollen"></path><text x="340" y="63" text-anchor="middle" class="mm-small">POLLINATION / CROSS-VENUE ARB</text>
<path d="M605 173 C646 241 645 331 608 398" class="mm-pollen"></path><text x="636" y="287" transform="rotate(90 636 287)" text-anchor="middle" class="mm-small">BPT ↔ NAV</text>
<path d="M71 173 C32 241 34 331 70 398" class="mm-pollen"></path><text x="42" y="286" transform="rotate(-90 42 286)" text-anchor="middle" class="mm-small">CURVE ↔ DEX</text>
<rect x="257" y="490" width="166" height="44" rx="14" class="mm-implied"></rect><text x="340" y="509" text-anchor="middle" class="mm-label">IMPLIED MARKET</text><text x="340" y="524" text-anchor="middle" class="mm-small">NO NEW MASTER CONTRACT</text>
<path d="M340 331 L340 489" class="mm-pollen"></path>
</svg>
</div>
</div>
</div>
</section>

<section class="ecology-section" id="ecology">
<div class="ecology-inner">
<div class="ecology-head"><div><div class="eyebrow">Field note · 007 / living markets</div><h2>Markets grow, dry out, cross-pollinate, and get pruned.</h2></div><p>The permaculture words describe <strong>market capacity, maturity and maintenance</strong> — states that move even when the contract address does not.</p></div>
<div class="ecology-grid">
<article class="maturity-card"><div class="truth">descriptive state · no hard threshold</div><h3>Sapling → Nut Tree</h3><p>A newly planted market can exist onchain and still be economically thin. Maturity comes from usable depth and connectivity, not age.</p><div class="maturity-track"><div class="maturity-line"></div><div class="maturity-node sap">SAPLING</div><div class="maturity-mid">🌿</div><div class="maturity-node tree">NUT<br/>TREE</div><span class="maturity-label left">shallow / light</span><span class="maturity-label mid">growing routes</span><span class="maturity-label right">deeper / connected</span></div><div class="growth-signals"><span>water</span><span>participants</span><span>routing</span><span>arbitrage</span><span>integrations</span></div><div class="no-threshold"><strong>Maturity is measured in depth and routes, not age.</strong></div></article>
<div class="ecology-stack">
<article class="ecology-card"><div class="ecoicon">💧</div><small>capacity</small><h3>Water</h3><p>Liquidity is edge capacity. What matters is not decorative TVL but <strong>depth at the trade size and route that needs it.</strong></p><div class="water-split"><div><small>trunk</small><b>protocol-owned core</b></div><div><small>branches</small><b>adaptive community LP</b></div></div></article>
<article class="ecology-card"><div class="ecoicon">🐝</div><small>arbitrage</small><h3>Pollination</h3><p>Uniswap and Aerodrome never message each other. Traders who <strong>buy cheap on one and sell dear on the other</strong> carry the price across. This is arbitrage. In Orchard terminology, we call the resulting price transmission pollination.</p></article>
<article class="ecology-card"><div class="ecoicon">🪱</div><small>recurring flow</small><h3>Nutrient cycling</h3><p>Fees, rewards, mints, redemptions, buybacks, rebalancing, LP and arbitrage keep value moving through layers.</p></article>
<article class="ecology-card"><div class="ecoicon">✂️</div><small>maintenance</small><h3>Pruning</h3><p>Ranges move. Liquidity deepens or leaves. Obsolete routes retire. Mechanisms migrate. <strong>The Orchard is maintained, not frozen.</strong></p></article>
</div>
</div>
<div class="polyculture-note"><span><strong>Polyculture:</strong> several pricing mechanisms can coexist around shared assets without sharing the same math.</span><span>Prices drift apart; arbitrage pulls them back together.</span></div>
</div>
</section>

<section class="factor-section" id="factorization">
<div class="factor-inner">
<div class="section-head">
<div><div class="eyebrow">Field note · 008 / NUT allocation</div><h2>Where the one NUT sits.</h2></div>
<p>There is exactly 1 NUT. At any moment, slices of it sit in wallets, in liquidity pools, in the wNUT wrapper, in Mint Club reserves, or in unreachable addresses. This map tracks those slices — a balance sheet for the whole root.</p>
</div>
<div class="factor-card">
<div class="factor-visual">
<svg aria-label="Conceptual partition of the one NUT across custody states" role="img" viewbox="0 0 650 510">
<circle class="partition-ring" cx="325" cy="250" r="188"></circle><circle class="partition-ring" cx="325" cy="250" r="118"></circle>
<line class="partition-edge" x1="325" x2="325" y1="250" y2="90"></line><line class="partition-edge" x1="325" x2="491" y1="250" y2="164"></line><line class="partition-edge" x1="325" x2="493" y1="250" y2="344"></line><line class="partition-edge" x1="325" x2="325" y1="250" y2="424"></line><line class="partition-edge" x1="325" x2="157" y1="250" y2="344"></line><line class="partition-edge" x1="325" x2="157" y1="250" y2="164"></line>
<circle class="partition-root" cx="325" cy="250" r="49"></circle><text fill="#fff4dc" font-size="17" font-weight="900" text-anchor="middle" x="325" y="247">1 NUT</text><text fill="#dbc5aa" font-size="10" font-weight="900" text-anchor="middle" x="325" y="267">CONSERVED TOTAL</text>
<circle class="partition-node" cx="325" cy="90" r="38"></circle><text class="partition-text" text-anchor="middle" x="325" y="87">WALLETS</text><text class="partition-small" text-anchor="middle" x="325" y="103">FREE BALANCE</text>
<circle class="partition-node" cx="491" cy="164" r="42"></circle><text class="partition-text" text-anchor="middle" x="491" y="161">AMMs</text><text class="partition-small" text-anchor="middle" x="491" y="177">POOL INVENTORY</text>
<circle class="partition-state" cx="493" cy="344" r="44"></circle><text class="partition-text" text-anchor="middle" x="493" y="341">wNUT</text><text class="partition-small" text-anchor="middle" x="493" y="357">1:1 CUSTODY</text>
<circle class="partition-node" cx="325" cy="424" r="43"></circle><text class="partition-text" text-anchor="middle" x="325" y="421">BALANCER</text><text class="partition-small" text-anchor="middle" x="325" y="437">RESERVES / BPT</text>
<circle class="partition-node" cx="157" cy="344" r="47"></circle><text class="partition-text" text-anchor="middle" x="157" y="341">MINT CLUB</text><text class="partition-small" text-anchor="middle" x="157" y="357">REDEEMABLE RESERVE</text>
<circle class="partition-sink" cx="157" cy="164" r="39"></circle><text fill="#f4dfc9" font-size="10" font-weight="900" text-anchor="middle" x="157" y="161">SINKS</text><text fill="#cba486" font-size="10" font-weight="900" text-anchor="middle" x="157" y="177">INACCESSIBLE</text>
<text class="partition-small" text-anchor="middle" x="325" y="491">CONCEPTUAL PARTITION · NOT TO SCALE · BALANCES CHANGE WITH STATE</text>
</svg>
</div>
<div class="factor-copy">
<div class="truth">one NUT, always</div>
<h3>Scarcity is not the same thing as free float.</h3><p>NUT inside an AMM is liquid inventory. NUT held by the wrapper backs wNUT one-for-one. NUT inside a Mint Club bond is reserve backing and can return on redemption. NUT accumulated in an inaccessible sink does not.</p>
<p>The amount never exceeds one NUT, but <strong>availability, custody and routing accessibility</strong> can change every block.</p>
<div class="aside">One NUT, many resting places.</div>
</div>
<div class="allocation-pressure">
<div class="allocation-head"><strong>What the one NUT is used for</strong> <span>the same asset works several jobs at once</span></div>
<div class="jobs">
<div class="job"><small>01</small> <strong>Collateral</strong><p>NUT committed to curves, reserves or other backing cannot simultaneously be free trading inventory.</p></div>
<div class="job"><small>02</small> <strong>Reward</strong><p>NUT routed through reward systems remains the same root quantity, but moves into a different economic role.</p></div>
<div class="job"><small>03</small> <strong>Basket member</strong><p>NUT or its wrapped claim can sit inside Balancer pools and trade as part of a basket.</p></div>
<div class="job"><small>04</small> <strong>Price</strong><p>NUT exposed to exchange supplies the inventory through which local executable prices are discovered.</p></div>
</div>
<div class="allocation-foot"><strong>The root cannot issue more of itself.</strong> When uses compete, the system reallocates inventory, liquidity and routes instead.</div>
</div>
</div>
</section>

<section class="microclimate">
<div class="micro-grid" style="grid-template-columns:1fr">
<article class="micro-card dark"><div class="eyebrow">Field note · 009 / SNUT</div><h3>What SNUT does.</h3><p><a href="/token/snut" style="color:#4f6f42;font-weight:800;text-decoration:underline">SNUT</a> is the rewards token. Every transfer pays a 1% fee that funds four jobs: NUT rewards to stakers, SNUT buyback, liquidity, and operations. It trades on five surfaces:</p><div class="micro-list"><div class="micro-row"><strong>SNUT / ETH</strong> <span>Main liquidity and price discovery.</span></div><div class="micro-row"><strong>SNUT-LP / ETH</strong> <span>Meta-market for the LP claim itself.</span></div><div class="micro-row"><strong>SNUT / NUT</strong> <span>Fee-fed market between branch and root.</span></div><div class="micro-row"><strong>pNUT Quad (V2)</strong> <span>Legacy basket: NUT/SNUT/cbETH/cbBTC.</span></div><div class="micro-row"><strong>pNUT Whorl (V3)</strong> <span>Current basket: wNUT/SNUT/cbETH/cbBTC.</span></div></div></article>
</div>
</section>

<section class="whorl-family" id="whorl-family">
<div class="whorl-inner">
<div class="whorl-head"><div><div class="eyebrow">Field note · 010 / whorl family</div><h2>The Whorl family: one shape, three uses.</h2></div><p>The Orchard uses the four-asset whorl shape three ways: a mixed-asset basket (pNUT), a pool of LP tokens (mNUT), and an ecosystem basket (nNUT).</p></div>
<div class="whorl-grid">
<article class="whorl-card"><div class="whorl-visual"><svg viewBox="0 0 360 300" role="img" aria-label="pNUT Peanut Whorl"><path class="whorl-shell" d="M92 93 C128 62 177 67 202 100 C226 75 269 76 292 108 C316 143 300 177 270 191 C287 223 270 258 235 267 C200 277 169 257 157 227 C132 252 91 247 70 216 C49 185 58 151 87 134 C73 119 76 106 92 93Z"/><ellipse cx="182" cy="166" rx="86" ry="67" class="whorl-ring"/><circle cx="182" cy="118" r="24" class="whorl-node"/><circle cx="233" cy="166" r="24" class="whorl-node"/><circle cx="182" cy="214" r="24" class="whorl-node"/><circle cx="131" cy="166" r="24" class="whorl-node"/><path d="M182 142 L182 190 M155 166 L209 166 M199 134 L216 150 M165 134 L148 150 M199 198 L216 182 M165 198 L148 182" class="whorl-edge"/><text x="182" y="122" text-anchor="middle" class="whorl-label">wNUT</text><text x="233" y="170" text-anchor="middle" class="whorl-label">SNUT</text><text x="182" y="218" text-anchor="middle" class="whorl-label">cbETH</text><text x="131" y="170" text-anchor="middle" class="whorl-label">cbBTC</text></svg></div><div class="whorl-copy"><small>pNUT / Peanut Whorl</small><h3>Mixed-asset reserve whorl.</h3><p>The <a href="/token/pnut" style="color:#4f6f42;font-weight:800;text-decoration:underline">pNUT pool</a> holds wNUT, SNUT, cbETH and cbBTC at equal 25% weights — successor to the older V2 basket that held NUT instead of wNUT.</p><div class="whorl-tags"><span>Balancer V3</span><span>four assets</span><span>25/25/25/25</span></div></div></article>
<article class="whorl-card"><div class="whorl-visual"><svg viewBox="0 0 360 300" role="img" aria-label="mNUT Meta Whorl"><circle cx="180" cy="150" r="104" class="whorl-ring"/><circle cx="180" cy="150" r="39" class="whorl-shell meta"/><text x="180" y="154" text-anchor="middle" fill="#fff6e6" font-size="12" font-weight="900">mNUT</text><circle cx="180" cy="58" r="28" class="whorl-node"/><circle cx="270" cy="170" r="31" class="whorl-node"/><circle cx="104" cy="207" r="31" class="whorl-node"/><circle cx="94" cy="103" r="27" class="whorl-node"/><path d="M180 111 L180 86 M218 157 L240 164 M146 169 L128 187 M145 133 L117 113" class="whorl-edge"/><text x="180" y="62" text-anchor="middle" class="whorl-label">wNUT</text><text x="270" y="166" text-anchor="middle" class="whorl-label">LP₁</text><text x="270" y="181" text-anchor="middle" class="whorl-small">LP CLAIM</text><text x="104" y="203" text-anchor="middle" class="whorl-label">LP₂</text><text x="104" y="218" text-anchor="middle" class="whorl-small">LP CLAIM</text><text x="94" y="99" text-anchor="middle" class="whorl-label">LP₃</text><text x="94" y="114" text-anchor="middle" class="whorl-small">LP CLAIM</text></svg></div><div class="whorl-copy"><small>mNUT / Meta Whorl</small><h3>A basket containing LP tokens.</h3><p><strong>wNUT plus three Aerodrome LP tokens.</strong> The LP tokens are themselves assets here — one pool holding pieces of other pools.</p><div class="whorl-tags"><span>LP-token basket</span><span>LP claims</span><span>wNUT scale</span></div></div></article>
<article class="whorl-card"><div class="whorl-visual"><svg viewBox="0 0 360 300" role="img" aria-label="nNUT Nested Whorl"><circle cx="180" cy="150" r="104" class="whorl-ring"/><circle cx="180" cy="150" r="39" class="whorl-shell nested"/><text x="180" y="154" text-anchor="middle" fill="#fff6e6" font-size="12" font-weight="900">nNUT</text><circle cx="180" cy="58" r="28" class="whorl-node"/><circle cx="270" cy="150" r="29" class="whorl-node"/><circle cx="180" cy="242" r="29" class="whorl-node"/><circle cx="90" cy="150" r="29" class="whorl-node"/><path d="M180 111 L180 86 M219 150 L241 150 M180 189 L180 213 M141 150 L119 150" class="whorl-edge"/><text x="180" y="62" text-anchor="middle" class="whorl-label">NUT</text><text x="270" y="154" text-anchor="middle" class="whorl-label">NUTINO</text><text x="180" y="246" text-anchor="middle" class="whorl-label">SALT</text><text x="90" y="154" text-anchor="middle" class="whorl-label">PIPS</text></svg></div><div class="whorl-copy"><small>nNUT / Nested Whorl</small><h3>NUT pooled with three ecosystem tokens.</h3><p><strong>NUT plus NUTINO, SALT and PIPS</strong> — the root pooled with three ecosystem tokens in one basket.</p><div class="whorl-tags"><span>nested economy</span><span>4 assets</span><span>NUT scale</span></div></div></article>
</div>

</div>
</section>

<section class="credit-section" id="nutusd">
<div class="credit-inner">
<div class="credit-head"><div><div class="eyebrow">Field note · 011 / nutUSD</div><h2>nutUSD — USDC lending vault.</h2></div><p>nutUSD changes how capital can enter and leave the Based NUT economy.</p></div>
<div class="credit-card">
<div class="credit-copy"><div class="truth snapshot">credit design / deployment state must be verified</div><h3>How the vault works.</h3><p>Deposit <strong>USDC</strong>, receive <a href="https://docs.basednut.com/based-nut/nutusd" style="color:#4f6f42;font-weight:800;text-decoration:underline">nutUSD</a> — a vault share (the ERC-4626 standard) of a lending reserve. The reserve lends only into approved Morpho markets.</p><p>The design lends USDC against cbBTC and cbETH collateral on Morpho, with loans capped at a conservative <strong>38.5% of collateral value</strong>. Interest flows back to the reserve; each share's worth rises or falls with it.</p><div class="credit-rule">nutUSD is not USD. It is not a stablecoin, synthetic dollar, $1 peg, or NUT-backed claim.</div><div class="credit-facts"><div class="credit-fact"><small>Vault asset</small><b>USDC</b></div><div class="credit-fact"><small>Share</small><b>nutUSD / ERC-4626</b></div><div class="credit-fact"><small>Lending protocol</small><b>Morpho Blue</b></div><div class="credit-fact"><small>Max loan / collateral</small><b>38.5%</b></div></div></div>
<div class="credit-visual"><svg viewBox="0 0 650 520" role="img" aria-label="nutUSD credit reserve flow"><defs><marker id="carr" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#80996a"/></marker></defs><circle cx="105" cy="260" r="48" class="credit-node"/><text x="105" y="257" text-anchor="middle" class="credit-label">USDC</text><text x="105" y="274" text-anchor="middle" class="credit-small">DEPOSIT</text><path d="M153 260 L238 260" class="credit-edge" marker-end="url(#carr)"/><circle cx="305" cy="260" r="68" class="credit-reserve"/><text x="305" y="251" text-anchor="middle" class="credit-white">nutUSD</text><text x="305" y="270" text-anchor="middle" class="credit-small" style="fill:#d9e6c5">CREDIT RESERVE SHARE</text><rect x="448" y="116" width="150" height="72" rx="18" class="credit-market"/><text x="523" y="146" text-anchor="middle" class="credit-label">cbBTC / USDC</text><text x="523" y="165" text-anchor="middle" class="credit-small">MORPHO · 38.5% LLTV</text><rect x="448" y="332" width="150" height="72" rx="18" class="credit-market"/><text x="523" y="362" text-anchor="middle" class="credit-label">cbETH / USDC</text><text x="523" y="381" text-anchor="middle" class="credit-small">MORPHO · 38.5% LLTV</text><path d="M365 238 C399 212 420 183 445 157" class="credit-edge" marker-end="url(#carr)"/><path d="M365 282 C399 307 421 338 445 363" class="credit-edge" marker-end="url(#carr)"/><path d="M489 190 C437 228 423 238 376 249" class="credit-return"/><path d="M489 330 C438 292 423 283 376 272" class="credit-return"/><text x="426" y="219" text-anchor="middle" class="credit-small">ALLOCATE USDC</text><text x="425" y="302" text-anchor="middle" class="credit-small">INTEREST / LOSSES RETURN TO RESERVE</text><path d="M305 328 C305 382 305 405 305 438" class="credit-return"/><text x="305" y="463" text-anchor="middle" class="credit-label">assets / share changes</text><text x="305" y="480" text-anchor="middle" class="credit-small">REDEMPTION FOLLOWS VAULT VALUE, NOT A PEG</text></svg></div>
</div>
</div>
</section>

<section class="claim-section" id="recursive-liquidity">
<div class="claim-inner">
<div class="section-head">
<div><div class="eyebrow">Field note · 012 / recursive liquidity</div><h2>Liquidity on liquidity.</h2></div>
<p>LP and BPT tokens are transferable claims on underlying reserves. Once a claim gets its own market, liquidity becomes an asset inside more liquidity.</p>
</div>
<div class="claim-card">
<div class="claim-copy">
<div class="truth">live recursive primitive</div>
<h3>One pool holds pieces of another.</h3>
<p>The cleanest live example is the SNUT/WETH LP claim trading against WETH in a separate Uniswap V2 meta-pool. The claim has a fair NAV from its underlying reserves, while the meta-market gives it a second price.</p>
<p>Balancer BPTs do the same thing structurally: gtINF, gtAGT, gtETH, gtBTC, gtFX, gtSIL, the pNUT generations, mNUT and nNUT are tokenized claims on multi-asset structures. mNUT makes that recursion explicit by using LP claims themselves as Whorl constituents.</p>
<div class="examples"><div class="example"><strong>SNUT-LP / WETH</strong> <span>LP claim gets its own spot market.</span></div><div class="example"><strong>gt* BPTs</strong> <span>One token represents a whole three-asset graft.</span></div><div class="example"><strong>pNUT / nNUT BPTs</strong> <span>One token represents a whole multi-asset whorl.</span></div><div class="example"><strong>mNUT BPT</strong> <span>One token represents a whorl whose constituents include other LP claims.</span></div></div>
</div>
<div class="claim-visual">
<svg aria-label="Recursive liquidity claim diagram" role="img" viewbox="0 0 620 470">
<circle class="claim-root" cx="155" cy="235" r="60"></circle><text class="claim-label" text-anchor="middle" x="155" y="230">SNUT / WETH</text><text class="claim-small" text-anchor="middle" x="155" y="248">UNDERLYING POOL</text>
<path class="claim-edge" d="M215 235 C250 235 268 235 297 235"></path><circle class="claim-node" cx="340" cy="235" r="52"></circle><text class="claim-label" text-anchor="middle" x="340" y="230">LP TOKEN</text><text class="claim-small" text-anchor="middle" x="340" y="248">CLAIM / NAV</text>
<path class="claim-edge" d="M392 235 C426 235 447 235 474 235"></path><circle class="claim-node" cx="516" cy="235" r="61"></circle><text class="claim-label" text-anchor="middle" x="516" y="225">LP / WETH</text><text class="claim-small" text-anchor="middle" x="516" y="243">META-MARKET</text><text class="claim-small" text-anchor="middle" x="516" y="259">SECOND PRICE</text>
<path class="claim-edge secondary" d="M515 174 C493 107 419 78 342 92 C278 104 225 139 194 184"></path>
<text class="claim-small" text-anchor="middle" x="351" y="77">ARBITRAGE COMPARES CLAIM PRICE TO UNDERLYING NAV</text>
<path class="claim-edge secondary" d="M340 287 C340 332 340 352 340 384"></path><circle class="claim-node" cx="340" cy="407" r="28"></circle><text class="claim-label" text-anchor="middle" x="340" y="411">NAV</text>
</svg>
</div>
</div>
</div>
</section>

<section class="boundary-section" id="boundaries">
<div class="boundary-inner">
<div class="section-head">
<div><div class="eyebrow">Field note · 013 / boundaries</div><h2>Some systems feed the Orchard without joining it.</h2></div>
<p>Revenue routing, attestations, social federation and real-world state can <strong>feed or observe the Orchard without becoming AMM edges.</strong></p>
</div>
<div class="boundary-grid">
<article class="boundary-card">
<div class="truth experimental">protocol plumbing</div><h3>FeeRouter is irrigation, not a branch.</h3><p>The FeeRouter takes USDC revenue and spends it two ways: buying PIPS and adding NUT/wNUT liquidity. Each spend is recorded by an EAS attestation. Money flows into the pools — the router itself adds no new market.</p>
<div class="flowline"><div class="flowbox">USDC REVENUE</div><div class="flowarrow">→</div><div class="flowbox">PIPS BUY<br/>+ NUT/wNUT LP</div><div class="flowarrow">→</div><div class="flowbox">EAS WITNESS</div></div>
</article>
<article class="boundary-card">
<div class="realm"><small>Liquidity graph</small> <strong>The Orchard</strong> <span>Assets, reserves, wrappers, pools, hyperedges, routes and market state.</span></div>
<div class="realm"><small>Social / work graph</small> <strong>Mycelium + Taproot</strong> <span>Our federated social layer — posts, follows, agents. A separate network from the liquidity map.</span></div>
<div class="realm"><small>Real-world state chain</small> <strong>RWA Stack</strong> <span>Physical-world tracking: land → production → custody → trade. Connects economically; is not a pool.</span></div>
<div class="realm"><small>Witness layer</small> <strong>Attestations</strong> <span>Records about economic events. Evidence is not a pool.</span></div>
<div class="realm"><small>Credit machinery</small> <strong>nutUSD + NUT Credit</strong> <span>nutUSD lending machinery — finances activity around the Orchard without being a market itself.</span></div></article>
</div>
</div>
</section>

<section class="boardwrap" id="ledger"><div class="boardhead"><div><div class="eyebrow">Under the bark</div><h2>The Orchard Ledger</h2></div><div class="boardnote">The Orchard can get weird. Verification should not. Market data, contracts, venues and routes stay explicit here.</div></div>
`;
  const PART_C = `<section class="plant"><div class="plantbox"><div><div class="eyebrow">At the fence</div><h3>Got a token? Don't join the family. Add an edge.</h3><p>Pairing with NUT gives the Orchard another route. If that route finds liquidity and connects to the rest of the graph, the topology changed.</p></div><a class="cta" href="/pair-your-token">ROOT IT INTO THE ORCHARD →</a></div></section><div class="docref">Field notes — deeper reading in the docs:
<a href="https://docs.basednut.com/liquidity/the-orchard-framework">The Orchard Framework</a> ·
<a href="https://docs.basednut.com/liquidity/groves">Groves</a> ·
<a href="https://docs.basednut.com/liquidity/groves/canopy-forms">Canopy Forms</a> ·
<a href="https://docs.basednut.com/liquidity/groves/sunflower-grove">Sunflower Grove</a> ·
<a href="https://docs.basednut.com/liquidity/groves/heirloom-grove">Heirloom Grove</a> ·
<a href="https://docs.basednut.com/liquidity/groves/polyforest-grove">Polyforest Grove</a> ·
<a href="https://docs.basednut.com/liquidity/groves/topology-graphs">Topology Graphs</a> ·
<a href="https://docs.basednut.com/liquidity/groves/liquid-state-machine">Liquid State Machine</a> ·
<a href="https://docs.basednut.com/liquidity/factorizing-nut">Factorizing NUT</a> ·
<a href="https://docs.basednut.com/based-nut/snut/snut-mechanics">SNUT Mechanics</a> ·
<a href="https://docs.basednut.com/based-nut/nutusd">nutUSD</a> ·
<a href="https://docs.basednut.com/technical/glossary">Glossary</a> · <a href="https://docs.basednut.com/technical/token-catalog">Token Catalog</a> ·
<a href="https://docs.basednut.com/technical/liquidity-catalog">Liquidity Catalog</a>
</div>`;
  const MARKETING_CSS = `
.orchard-marketing{--soil:#4d3021;--soil2:#6a4330;--bark:#76503b;--cream:#f6edda;--cream2:#eee1c8;--paper:#fffaf0;--leaf:#4f6f42;--leaf2:#78965e;--moss:#9dac75;--gold:#c89545;--ink:#352319;--muted:#6a5245;--line:rgba(76,47,32,.16);--line2:rgba(76,47,32,.09);--shadow:0 24px 70px rgba(64,39,24,.12);--deep:#293522;--deep2:#382a21}.orchard-marketing button,.orchard-marketing input{font:inherit}
.orchard-marketing .hero{position:relative;min-height:640px;overflow:hidden;display:flex;align-items:center;justify-content:center;border-bottom:1px solid rgba(76,47,32,.12);background:linear-gradient(180deg,rgba(255,252,245,.2),rgba(246,237,218,.2)),radial-gradient(circle at 50% 90%,rgba(95,117,66,.18),transparent 38rem)}.orchard-marketing .skygrain{position:absolute;inset:0;opacity:.18;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.12'/%3E%3C/svg%3E")}.orchard-marketing .canopy{position:absolute;left:0;right:0;bottom:-1px;height:300px;pointer-events:none}.orchard-marketing .hill{position:absolute;left:-10%;right:-10%;bottom:-110px;height:260px;border-radius:50% 50% 0 0;background:linear-gradient(#7d9360,#5f7549);box-shadow:inset 0 18px 50px rgba(255,255,255,.08)}.orchard-marketing .tree{position:absolute;bottom:70px;width:130px;height:220px}.orchard-marketing .tree .trunk{position:absolute;width:25px;height:120px;left:52px;bottom:0;background:linear-gradient(90deg,#5e3925,#7e5236,#4c2c1e);border-radius:45% 45% 8px 8px;transform:rotate(var(--rot,0deg));transform-origin:bottom}.orchard-marketing .tree .crown,.orchard-marketing .tree .crown:before,.orchard-marketing .tree .crown:after{content:"";position:absolute;border-radius:50%;background:radial-gradient(circle at 35% 28%,#8da46e 0 12%,#5f7c4b 48%,#405f39 100%);box-shadow:inset -14px -18px 30px rgba(39,70,34,.2)}.orchard-marketing .tree .crown{width:110px;height:100px;left:8px;top:22px}.orchard-marketing .tree .crown:before{width:85px;height:90px;left:-26px;top:29px}.orchard-marketing .tree .crown:after{width:82px;height:86px;right:-28px;top:25px}.orchard-marketing .tree.t1{left:4%;transform:scale(.8)}.orchard-marketing .tree.t2{left:15%;transform:scale(1.05)}.orchard-marketing .tree.t3{right:16%;transform:scale(.95)}.orchard-marketing .tree.t4{right:4%;transform:scale(.72)}.orchard-marketing .tree.t5{left:44%;bottom:82px;transform:scale(1.28)}.orchard-marketing .nut{position:absolute;width:22px;height:29px;border-radius:48% 48% 55% 55%;background:linear-gradient(145deg,#b97a3f,#6b3f22);box-shadow:inset -5px -7px 8px rgba(57,31,17,.18),0 8px 18px rgba(64,39,24,.2);transform:rotate(var(--r,12deg))}.orchard-marketing .nut:before{content:"";position:absolute;left:3px;right:3px;top:-5px;height:9px;border-radius:50%;background:linear-gradient(#6f5333,#4a321f)}.orchard-marketing .n1{left:16%;top:18%;--r:15deg;animation:orchardFloat 8s ease-in-out infinite}.orchard-marketing .n2{right:12%;top:25%;--r:-11deg;animation:orchardFloat 9s ease-in-out 1s infinite}.orchard-marketing .n3{left:74%;top:8%;--r:29deg;animation:orchardFloat 7s ease-in-out .4s infinite}.orchard-marketing .n4{left:8%;top:48%;--r:-19deg;animation:orchardFloat 10s ease-in-out .8s infinite}@keyframes orchardFloat{50%{transform:translateY(22px) rotate(calc(var(--r) + 16deg))}}
.orchard-marketing .hero-inner{position:relative;z-index:4;text-align:center;max-width:980px;padding:70px 24px 180px}.orchard-marketing .kicker{display:inline-flex;gap:10px;align-items:center;padding:8px 13px;border:1px solid rgba(74,99,56,.28);background:rgba(255,250,240,.62);backdrop-filter:blur(10px);border-radius:999px;color:#4d663e;font-weight:900;font-size:12px;letter-spacing:.16em;text-transform:uppercase}.orchard-marketing .hero h1{margin:26px auto 0;font-family:Georgia,"Times New Roman",serif;font-size:clamp(56px,10vw,126px);line-height:.82;letter-spacing:-.065em;font-weight:600;color:#533421;text-shadow:0 3px 0 rgba(255,255,255,.25)}.orchard-marketing .hero h1 span{display:block;font-size:.37em;letter-spacing:.15em;margin-top:.4em;color:#6a4a35;text-transform:uppercase}.orchard-marketing .hero-copy{max-width:720px;margin:30px auto 0;font-family:Georgia,serif;font-size:clamp(20px,2.2vw,29px);line-height:1.38;color:#5c4637}.orchard-marketing .hero-copy strong{color:#34512e;font-weight:600}.orchard-marketing .hero-note{display:inline-flex;align-items:center;justify-content:center;margin-top:18px;padding:8px 13px;border:1px solid rgba(91,58,41,.16);border-radius:999px;background:rgba(255,250,240,.88);backdrop-filter:blur(10px);box-shadow:0 7px 20px rgba(73,46,30,.07);font-size:11px;line-height:1.25;letter-spacing:.11em;text-transform:uppercase;color:#5a4030;font-weight:900;text-shadow:0 1px 0 rgba(255,255,255,.72)}.orchard-marketing .panel-head{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:22px}.orchard-marketing .eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:.18em;color:#453325;font-weight:900}.orchard-marketing .live{font-size:12px;font-weight:900;color:#4d6d43;display:flex;gap:8px;align-items:center}.orchard-marketing .live:before{content:"";width:8px;height:8px;border-radius:50%;background:#6c914f;box-shadow:0 0 0 5px rgba(108,145,79,.12)}
.orchard-marketing .field-section{max-width:1180px;margin:0 auto;padding:28px 22px 105px}.orchard-marketing .field-grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:52px;align-items:center}.orchard-marketing .copy h2{margin:10px 0 20px;font:500 clamp(42px,5.4vw,72px)/.98 Georgia,serif;letter-spacing:-.045em;color:#4b3326}.orchard-marketing .copy .lead{margin:0 0 18px;font:400 clamp(19px,2.15vw,26px)/1.5 Georgia,serif;color:#604b3d}.orchard-marketing .copy p{color:#453325;line-height:1.7;font-size:14px;margin:0 0 15px}.orchard-marketing .copy strong{color:#405b36}.orchard-marketing .copy .aside{margin-top:25px;padding:17px 0 17px 19px;border-left:3px solid #78965e;font:italic 20px/1.45 Georgia,serif;color:#536b47}.orchard-marketing .spec{margin-top:21px;display:flex;gap:7px;flex-wrap:wrap}.orchard-marketing .spec span{font-size:11px;letter-spacing:.11em;text-transform:uppercase;font-weight:900;border:1px solid var(--line);background:rgba(255,250,240,.55);padding:7px 9px;border-radius:999px;color:#453325}.orchard-marketing .display{position:relative;overflow:hidden;min-height:520px;border-radius:30px;border:1px solid rgba(89,59,39,.14);background:radial-gradient(circle at 50% 0%,rgba(144,171,111,.17),transparent 45%),linear-gradient(145deg,rgba(255,250,240,.94),rgba(237,226,205,.82));box-shadow:var(--shadow)}.orchard-marketing .display:before{content:"";position:absolute;inset:0;opacity:.1;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n2'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.7' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n2)' opacity='.18'/%3E%3C/svg%3E")}.orchard-marketing .display-head{position:absolute;z-index:3;left:22px;right:22px;top:20px;display:flex;justify-content:space-between;align-items:center;font-size:11px;letter-spacing:.15em;text-transform:uppercase;font-weight:900;color:#453325}.orchard-marketing .display-head .signal{display:flex;gap:7px;align-items:center;color:#526a44}.orchard-marketing .display-head .signal:before{content:"";width:7px;height:7px;border-radius:50%;background:#76955f;box-shadow:0 0 0 5px rgba(118,149,95,.1)}.orchard-marketing .display svg{display:block;width:100%;height:100%;min-height:520px;position:relative;z-index:2}.orchard-marketing .svg-label{font:700 13px Inter,system-ui,sans-serif;fill:#4d392e}.orchard-marketing .svg-small{font:700 10px Inter,system-ui,sans-serif;fill:#5a4636;letter-spacing:.06em}.orchard-marketing .svg-root{fill:#74472b;stroke:#5b351f;stroke-width:2}.orchard-marketing .svg-leaf{fill:#678153;stroke:#4d673e;stroke-width:2}.orchard-marketing .svg-soft{fill:#f9f1df;stroke:#92755f;stroke-width:1.5}.orchard-marketing .svg-state{fill:#eef2e3;stroke:#658052;stroke-width:2}.orchard-marketing .svg-edge{fill:none;stroke:#8b6b51;stroke-width:5;stroke-linecap:round}.orchard-marketing .svg-edge-thin{fill:none;stroke:#839b6d;stroke-width:2.5;stroke-linecap:round;opacity:.78}.orchard-marketing .svg-dash{fill:none;stroke:#9b7a5e;stroke-width:1.5;stroke-dasharray:5 6;opacity:.8}.orchard-marketing .svg-glow{filter:drop-shadow(0 6px 12px rgba(82,65,49,.13))}
.orchard-marketing .state-section{background:radial-gradient(circle at 12% 10%,rgba(141,166,109,.12),transparent 28rem),var(--cream2);border-top:1px solid var(--line2);border-bottom:1px solid var(--line2);padding:105px 0}.orchard-marketing .state-inner{max-width:1180px;margin:auto;padding:0 22px}.orchard-marketing .state-strip{margin-top:34px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.orchard-marketing .state-card{background:rgba(255,250,240,.72);border:1px solid var(--line);border-radius:18px;padding:18px}.orchard-marketing .state-card small{display:block;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#453325;font-weight:900;margin-bottom:9px}.orchard-marketing .state-card strong{font:500 22px/1.2 Georgia,serif;color:#4d372a}.orchard-marketing .state-card p{margin:8px 0 0;color:#453325;font-size:12px;line-height:1.55}
.orchard-marketing .soil-section{max-width:1180px;margin:0 auto;padding:105px 22px}.orchard-marketing .soil-display{position:relative;min-height:460px;border-radius:30px;overflow:hidden;border:1px solid var(--line);background:linear-gradient(#eef0dd 0 29%,#d6c1a1 29% 31%,#7b5135 31%,#4e3021 100%);box-shadow:var(--shadow)}.orchard-marketing .soil-display .surface-label{position:absolute;z-index:3;left:24px;top:22px;font-size:11px;letter-spacing:.15em;text-transform:uppercase;font-weight:900;color:#5c6e4d}.orchard-marketing .soil-display svg{width:100%;height:460px;display:block}.orchard-marketing .rootpath{fill:none;stroke:#c58b53;stroke-width:5;stroke-linecap:round;opacity:.62;filter:drop-shadow(0 0 6px rgba(224,181,107,.16))}.orchard-marketing .rootpath.fine{stroke-width:2.5;opacity:.45}.orchard-marketing .mineral-node{fill:#3b251b;stroke:#d8ae78;stroke-width:1.5}.orchard-marketing .mineral-text{fill:#f6e8c9;font:800 11px Inter,system-ui,sans-serif}.orchard-marketing .top-text{fill:#506641;font:800 11px Inter,system-ui,sans-serif}
.orchard-marketing .atlas{padding:105px 22px;background:#f0e5d1;border-top:1px solid var(--line2);border-bottom:1px solid var(--line2)}.orchard-marketing .atlas-inner{max-width:1220px;margin:auto}.orchard-marketing .atlas-head{max-width:860px;margin-bottom:38px}.orchard-marketing .atlas-head h2{margin:10px 0 16px;font:500 clamp(44px,5.7vw,75px)/.98 Georgia,serif;letter-spacing:-.045em;color:#493226}.orchard-marketing .atlas-head p{max-width:720px;color:#453325;font-size:14px;line-height:1.7}.orchard-marketing .grove-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.orchard-marketing .grove{position:relative;overflow:hidden;min-height:510px;border-radius:25px;background:linear-gradient(#edf1df 0 44%,#c6ad83 44% 46%,#644029 46%,#3f281d 100%);border:1px solid rgba(83,56,38,.14);box-shadow:0 18px 48px rgba(71,44,29,.08);transition:.3s}.orchard-marketing .grove:hover{transform:translateY(-6px);box-shadow:0 28px 54px rgba(71,44,29,.13)}.orchard-marketing .grove svg{display:block;width:100%;height:430px}.orchard-marketing .grove-foot{position:absolute;left:18px;right:18px;bottom:17px;border-top:1px solid rgba(255,255,255,.13);padding-top:13px;color:#eadbc7;display:flex;justify-content:space-between;gap:14px;align-items:end}.orchard-marketing .grove-foot strong{font:500 18px/1 Georgia,serif}.orchard-marketing .grove-foot span{font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:#c7b5a3;font-weight:900;text-align:right}.orchard-marketing .grove-sun{fill:#f4e9bd;filter:drop-shadow(0 0 18px rgba(244,220,148,.3))}.orchard-marketing .grove-stem{stroke:#6e7f45;stroke-width:12;stroke-linecap:round}.orchard-marketing .grove-root-svg{fill:none;stroke:#a86e3c;stroke-width:6;stroke-linecap:round}.orchard-marketing .grove-flow{fill:none;stroke:#cfe995;stroke-width:4;stroke-linecap:round;filter:drop-shadow(0 0 6px rgba(197,235,130,.5))}.orchard-marketing .grove-node{fill:#fff6e2;stroke:#5d7647;stroke-width:2}.orchard-marketing .grove-text{font:800 11px Inter,system-ui,sans-serif;fill:#4f3b2f}.orchard-marketing .world-ring{fill:none;stroke:#cfe2a3;stroke-width:2;stroke-dasharray:5 6;opacity:.85}
.orchard-marketing .weather{max-width:1180px;margin:0 auto;padding:105px 22px}.orchard-marketing .weather-box{overflow:hidden;border-radius:32px;color:#f4e8d7;background:radial-gradient(circle at 90% 5%,rgba(210,153,70,.24),transparent 24rem),linear-gradient(145deg,#3a2b22,#24351f);box-shadow:0 30px 70px rgba(49,38,28,.16)}.orchard-marketing .weather-grid{display:grid;grid-template-columns:.86fr 1.14fr;align-items:stretch}.orchard-marketing .weather-copy{padding:clamp(34px,5vw,66px)}.orchard-marketing .weather-copy .eyebrow{color:#bdd09a}.orchard-marketing .weather-copy h2{margin:12px 0 20px;font:500 clamp(42px,5.3vw,70px)/.98 Georgia,serif;letter-spacing:-.045em}.orchard-marketing .weather-copy p{color:#d8c9b5;line-height:1.7;font-size:14px}.orchard-marketing .weather-copy strong{color:#d9e9ac}.orchard-marketing .weather-copy .aside{margin-top:25px;padding:17px 0 17px 19px;border-left:3px solid #a8c979;font:italic 20px/1.45 Georgia,serif;color:#cfe5a6}.orchard-marketing .weather-flow{min-height:500px;background:rgba(7,15,9,.18);border-left:1px solid rgba(255,255,255,.08)}.orchard-marketing .weather-flow svg{width:100%;height:100%;min-height:500px}.orchard-marketing .flow-node{fill:#3d4f31;stroke:#a8c979;stroke-width:1.5}.orchard-marketing .flow-root{fill:#754727;stroke:#d3a162;stroke-width:2}.orchard-marketing .flow-line{fill:none;stroke:#9dba79;stroke-width:2.5;stroke-linecap:round}.orchard-marketing .flow-line.burn{stroke:#d98b54}.orchard-marketing .flow-label{fill:#f1e5d3;font:800 11px Inter,system-ui,sans-serif}.orchard-marketing .flow-small{fill:#aebda1;font:700 10.5px Inter,system-ui,sans-serif;letter-spacing:.06em}
.orchard-marketing .world-section{max-width:1180px;margin:0 auto;padding:0 22px 105px}.orchard-marketing .world-card{display:grid;grid-template-columns:.9fr 1.1fr;overflow:hidden;border-radius:32px;border:1px solid var(--line);background:rgba(255,250,240,.82);box-shadow:var(--shadow)}.orchard-marketing .world-copy{padding:clamp(35px,5vw,68px)}.orchard-marketing .world-copy h2{font:500 clamp(42px,5.3vw,70px)/.98 Georgia,serif;letter-spacing:-.045em;margin:10px 0 18px;color:#4b3326}.orchard-marketing .world-copy p{color:#776257;line-height:1.7;font-size:14px}.orchard-marketing .world-copy .shell-line{font:italic 22px/1.45 Georgia,serif;color:#536c47;margin-top:24px}.orchard-marketing .world-display{background:linear-gradient(145deg,#efe5d2,#e3d4bb);display:grid;place-items:center;min-height:470px;border-left:1px solid var(--line)}.orchard-marketing .world-display svg{width:100%;height:100%;min-height:470px}
.orchard-marketing .boardwrap{max-width:1180px;margin:0 auto;padding:105px 22px 120px}.orchard-marketing .boardhead{display:flex;justify-content:space-between;gap:20px;align-items:end;margin-bottom:18px}.orchard-marketing .boardhead h2{margin:6px 0 0;font:500 42px/1 Georgia,serif}.orchard-marketing .boardnote{font-size:12px;color:#453325;max-width:420px;text-align:right;line-height:1.5}.orchard-marketing .board{border:1px solid var(--line);border-radius:22px;overflow:hidden;background:#fffaf0;box-shadow:0 18px 50px rgba(79,52,35,.07)}.orchard-marketing .row{display:grid;grid-template-columns:1.35fr .9fr 1.2fr .8fr .65fr;gap:10px;padding:14px 18px;border-bottom:1px solid rgba(79,52,35,.08);align-items:center;font-size:13px}.orchard-marketing .row:last-child{border-bottom:0}.orchard-marketing .row.head{background:#eee2ce;font-size:10.5px;letter-spacing:.13em;text-transform:uppercase;font-weight:900;color:#453325}.orchard-marketing .asset{display:flex;gap:10px;align-items:center;font-weight:900}.orchard-marketing .tiny{width:28px;height:28px;border-radius:9px;display:grid;place-items:center;background:#f2e8d6}.orchard-marketing .good{color:#59764a;font-weight:900}.orchard-marketing .muted{color:#513e2f}
.orchard-marketing .plant{max-width:1180px;margin:0 auto 90px;padding:0 22px}.orchard-marketing .plantbox{display:flex;justify-content:space-between;gap:28px;align-items:center;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:36px 0}.orchard-marketing .plant h3{font:500 34px/1.05 Georgia,serif;margin:0}.orchard-marketing .plant p{margin:9px 0 0;color:#806b5f;max-width:690px;line-height:1.6}.orchard-marketing .cta{white-space:nowrap;text-decoration:none;border-radius:999px;padding:13px 18px;background:#563522;color:#fff6e5;font-weight:900;font-size:13px;box-shadow:0 10px 22px rgba(79,52,35,.16)}.orchard-marketing .cta:hover{background:#6a452d}.orchard-marketing .hidden{display:none!important}.orchard-marketing .svg-flow{stroke-dasharray:8 7;animation:orchardDash 7s linear infinite}@keyframes orchardDash{to{stroke-dashoffset:-90}}
@media(max-width:900px){.orchard-marketing .field-grid,.orchard-marketing .weather-grid,.orchard-marketing .world-card{grid-template-columns:1fr}.orchard-marketing .world-display,.orchard-marketing .weather-flow{border-left:0;border-top:1px solid var(--line)}.orchard-marketing .grove-grid{grid-template-columns:1fr}.orchard-marketing .grove{min-height:480px}.orchard-marketing .state-strip{grid-template-columns:1fr}}@media(max-width:850px){.orchard-marketing .row{grid-template-columns:1.2fr .8fr 1fr}.orchard-marketing .row>:nth-child(4),.orchard-marketing .row>:nth-child(5){display:none}}@media(max-width:600px){.orchard-marketing .hero{min-height:590px}.orchard-marketing .hero-inner{padding-top:48px}.orchard-marketing .panel-head{align-items:start;flex-direction:column}.orchard-marketing .field-section,.orchard-marketing .soil-section,.orchard-marketing .weather,.orchard-marketing .world-section,.orchard-marketing .boardwrap{padding-left:16px;padding-right:16px}.orchard-marketing .atlas{padding-left:16px;padding-right:16px}.orchard-marketing .plantbox{align-items:start;flex-direction:column}.orchard-marketing .boardnote{display:none}.orchard-marketing .display,.orchard-marketing .display svg{min-height:440px}}

/* V6 — topology specimens: remove literal landscape, favor botanical/technical geometry */
.orchard-marketing .grove-grid{gap:18px}
.orchard-marketing .grove{
  min-height:470px;
  background:
    radial-gradient(circle at 82% 14%,rgba(216,226,185,.34),transparent 120px),
    linear-gradient(160deg,#faf7ed 0%,#f1eadc 100%);
  border:1px solid rgba(83,56,38,.13);
  box-shadow:0 18px 48px rgba(71,44,29,.075);
}
.orchard-marketing .grove:before{
  content:"";position:absolute;inset:0;pointer-events:none;opacity:.15;
  background-image:radial-gradient(circle at center,rgba(82,105,65,.2) 0 1px,transparent 1.4px);
  background-size:24px 24px;
  mask-image:linear-gradient(to bottom,black,transparent 76%);
}
.orchard-marketing .grove:hover{transform:translateY(-4px);box-shadow:0 25px 54px rgba(71,44,29,.11)}
.orchard-marketing .grove svg{height:390px;position:relative;z-index:1}
.orchard-marketing .grove-foot{
  left:20px;right:20px;bottom:18px;padding-top:14px;
  border-top:1px solid rgba(76,47,32,.12);color:#4b3529;
}
.orchard-marketing .grove-foot strong{font:500 19px/1 Georgia,serif;color:#4b3529}
.orchard-marketing .grove-foot span{color:#836f61}
.orchard-marketing .spec-node{fill:#fffaf0;stroke:#5f774d;stroke-width:1.8;filter:drop-shadow(0 7px 10px rgba(77,52,37,.08))}
.orchard-marketing .spec-root{fill:#efe4cf;stroke:#7d5a43;stroke-width:2.1}
.orchard-marketing .spec-edge{fill:none;stroke:#6f8a59;stroke-width:2.6;stroke-linecap:round}
.orchard-marketing .spec-edge.soft{stroke:#9aaa82;stroke-width:1.5;stroke-dasharray:5 7;opacity:.78}
.orchard-marketing .spec-spine{fill:none;stroke:#a9774c;stroke-width:3;stroke-linecap:round;opacity:.78}
.orchard-marketing .spec-label{font:800 11px Inter,system-ui,sans-serif;fill:#463328}
.orchard-marketing .spec-small{font:800 10px Inter,system-ui,sans-serif;fill:#887365;letter-spacing:.1em}
.orchard-marketing .spec-pill{fill:#f0e7d5;stroke:#cab79e;stroke-width:1}
.orchard-marketing .spec-shell{fill:#b77947;fill-opacity:.12;stroke:#94613d;stroke-width:2.2}
.orchard-marketing .spec-shell-line{fill:none;stroke:#a36e45;stroke-width:1.5;opacity:.48;stroke-linecap:round}
.orchard-marketing .world-display{background:linear-gradient(160deg,#f7f0e2,#e8dbc5)}


/* V9 ADVANCED ORCHARD — current framework */
.orchard-marketing .advanced-intro{max-width:1180px;margin:0 auto;padding:28px 22px 96px}.orchard-marketing .advanced-intro .intro-card{border:1px solid var(--line);border-radius:30px;background:linear-gradient(145deg,rgba(255,250,240,.93),rgba(239,229,210,.83));box-shadow:var(--shadow);padding:clamp(30px,5vw,62px)}.orchard-marketing .advanced-intro h2{margin:10px 0 18px;font:500 clamp(42px,5.8vw,76px)/.96 Georgia,serif;letter-spacing:-.05em;color:#493126}.orchard-marketing .advanced-intro .lead{max-width:840px;font:400 clamp(19px,2.1vw,27px)/1.52 Georgia,serif;color:#5f493d}.orchard-marketing .advanced-intro .lead strong{color:#3d5935;font-weight:500}.orchard-marketing .five-layers{display:grid;grid-template-columns:repeat(5,1fr);gap:9px;margin-top:30px}.orchard-marketing .layer{position:relative;padding:18px 15px;border:1px solid var(--line);border-radius:17px;background:rgba(255,250,240,.7);min-height:126px}.orchard-marketing .layer small{display:block;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;font-weight:900;color:#7a6a5d;margin-bottom:10px}.orchard-marketing .layer strong{font:500 19px/1.15 Georgia,serif;color:#493428}.orchard-marketing .layer p{margin:8px 0 0;color:#7b675c;font-size:11px;line-height:1.45}.orchard-marketing .layer:not(:last-child):after{content:'→';position:absolute;right:-9px;top:48%;z-index:3;color:#8ba06f;font-weight:900}

.orchard-marketing .scale-section{padding:100px 22px;background:#efe4d0;border-top:1px solid var(--line2);border-bottom:1px solid var(--line2)}.orchard-marketing .scale-inner{max-width:1180px;margin:auto}.orchard-marketing .scale-head{display:grid;grid-template-columns:.8fr 1.2fr;gap:56px;align-items:end;margin-bottom:34px}.orchard-marketing .scale-head h2{margin:9px 0 0;font:500 clamp(44px,5.8vw,76px)/.96 Georgia,serif;letter-spacing:-.05em;color:#483025}.orchard-marketing .scale-head p{margin:0;color:#453325;font-size:14px;line-height:1.72}.orchard-marketing .scale-head strong{color:#405b36}.orchard-marketing .scale-map{overflow:hidden;border:1px solid var(--line);border-radius:30px;background:radial-gradient(circle at 50% 45%,rgba(255,255,255,.88),rgba(249,242,229,.62) 57%,rgba(227,214,191,.74));box-shadow:var(--shadow)}.orchard-marketing .scale-map svg{display:block;width:100%;height:auto}.orchard-marketing .scale-label{font:950 14px Inter,system-ui,sans-serif;letter-spacing:.11em;fill:#665044}.orchard-marketing .scale-title{font:800 17px Inter,system-ui,sans-serif;fill:#493428}.orchard-marketing .mass-node{fill:#fffaf0;stroke:#607a4d;stroke-width:2.4}.orchard-marketing .mass-root{fill:#754829;stroke:#5e3822;stroke-width:2.8}.orchard-marketing .mass-rootstock{fill:#edf2e3;stroke:#5b7748;stroke-width:2.8}.orchard-marketing .mass-graft{fill:#f3f6eb;stroke:#657f50;stroke-width:2.1}.orchard-marketing .mass-whorl{fill:#f2dfba;stroke:#95623b;stroke-width:2.4}.orchard-marketing .mass-edge{fill:none;stroke:#758e60;stroke-width:2.6;opacity:.82}.orchard-marketing .mass-branch{fill:none;stroke:#8f674d;stroke-width:2.6;opacity:.78}.orchard-marketing .wrapper-rail{stroke:#ba7a3f;stroke-width:6;stroke-linecap:round}.orchard-marketing .wrapper-dash{stroke:#fff0c9;stroke-width:1.8;stroke-dasharray:5 6}.orchard-marketing .mass-text{font:900 15px Inter,system-ui,sans-serif;fill:#3e2c23}.orchard-marketing .mass-small{font:800 11px Inter,system-ui,sans-serif;fill:#513e2f;paint-order:stroke;stroke:#fbf4e7;stroke-width:2px;stroke-linejoin:round}.orchard-marketing .mass-note{padding:17px 20px;border-top:1px solid var(--line);display:flex;justify-content:space-between;gap:24px;color:#6f594d;font-size:11px;line-height:1.55}.orchard-marketing .mass-note strong{color:#49603d}.orchard-marketing .mass-note em{font-style:normal;color:#8b5c38}.orchard-marketing .scale-legend{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;padding:16px 18px 18px;border-top:1px solid var(--line);background:rgba(255,250,240,.58)}.orchard-marketing .legend-group{min-width:0}.orchard-marketing .legend-group small,.orchard-marketing .legend-rail small{display:block;margin-bottom:8px;font-size:11px;letter-spacing:.13em;text-transform:uppercase;font-weight:950;color:#79665a}.orchard-marketing .legend-items{display:flex;flex-wrap:wrap;gap:6px}.orchard-marketing .legend-item{padding:6px 8px;border:1px solid rgba(76,47,32,.13);border-radius:999px;background:#fffaf0;color:#564034;font-size:11px;font-weight:850;line-height:1.2}.orchard-marketing .legend-item b{color:#3e5936}.orchard-marketing .legend-rail{align-self:stretch;display:flex;flex-direction:column;justify-content:center;min-width:125px;padding:0 14px;border-left:1px solid var(--line);border-right:1px solid var(--line);text-align:center}.orchard-marketing .legend-rail strong{font:600 16px/1.2 Georgia,serif;color:#7b4c2d}.orchard-marketing .legend-rail span{margin-top:4px;font-size:11px;color:#513e2f;font-weight:800}
.orchard-marketing .scale-map.split{padding:18px;background:linear-gradient(145deg,rgba(255,250,240,.83),rgba(236,224,203,.68))}
.orchard-marketing .scale-columns{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:stretch}
.orchard-marketing .scale-panel{position:relative;overflow:hidden;border:1px solid rgba(76,47,32,.13);border-radius:23px;background:rgba(255,252,245,.74);min-width:0}
.orchard-marketing .scale-panel-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;padding:18px 19px 10px}
.orchard-marketing .scale-panel-head small{display:block;font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:950;color:#7b675a}
.orchard-marketing .scale-panel-head strong{display:block;margin-top:5px;font:600 19px/1.1 Georgia,serif;color:#4a3227}
.orchard-marketing .scale-panel-head span{font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:900;color:#677a58;text-align:right}
.orchard-marketing .scale-panel svg{display:block;width:100%;height:auto;aspect-ratio:1.08/1}
.orchard-marketing .scale-panel-foot{padding:12px 16px 16px;border-top:1px solid rgba(76,47,32,.09);background:rgba(255,250,240,.48)}
.orchard-marketing .scale-panel-foot .legend-items{gap:5px}.orchard-marketing .scale-panel-foot .legend-item{font-size:10.5px;padding:5px 7px}
.orchard-marketing .scale-bridge{position:absolute;z-index:5;left:50%;top:47%;transform:translate(-50%,-50%);width:128px;padding:9px 8px;border:1px solid #bc8a58;border-radius:14px;background:#fff7e8;box-shadow:0 8px 24px rgba(80,50,31,.13);text-align:center;color:#70492f}
.orchard-marketing .scale-bridge strong{display:block;font:700 15px/1 Georgia,serif}.orchard-marketing .scale-bridge span{display:block;margin-top:4px;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;font-weight:900}
.orchard-marketing .scale-bridge:before,.orchard-marketing .scale-bridge:after{content:"";position:absolute;top:50%;width:44px;height:3px;background:#b8783e;transform:translateY(-50%);z-index:-1}
.orchard-marketing .scale-bridge:before{right:100%}.orchard-marketing .scale-bridge:after{left:100%}
.orchard-marketing .whorl-pod{fill:#edd8b0;stroke:#9a663e;stroke-width:2.4}
.orchard-marketing .whorl-rib{fill:none;stroke:#bb8752;stroke-width:2;opacity:.75;stroke-linecap:round}
.orchard-marketing .whorl-member{fill:#fffaf0;stroke:#6d825c;stroke-width:1.7}
.orchard-marketing .whorl-member-text{font:900 11px Inter,system-ui,sans-serif;fill:#3d2b22}
.orchard-marketing .whorl-connect{fill:none;stroke:#758e60;stroke-width:2;stroke-dasharray:6 6}
.orchard-marketing .whorl-note{font:850 10.5px Inter,system-ui,sans-serif;fill:#6f594c;paint-order:stroke;stroke:#fbf4e7;stroke-width:2px;stroke-linejoin:round}
.orchard-marketing .scale-note-v14{display:flex;justify-content:space-between;gap:22px;padding:16px 4px 2px;color:#6f594d;font-size:11px;line-height:1.55}.orchard-marketing .scale-note-v14 strong{color:#49603d}
/* V15 — sequential scale exhibits */
.orchard-marketing .scale-story{display:grid;gap:16px}
.orchard-marketing .scale-stage{
  overflow:hidden;border:1px solid rgba(76,47,32,.13);border-radius:26px;
  background:rgba(255,252,245,.78);box-shadow:0 12px 34px rgba(67,43,28,.055)
}
.orchard-marketing .scale-stage-head{
  display:flex;justify-content:space-between;gap:28px;align-items:end;
  padding:24px 28px 14px;border-bottom:1px solid rgba(76,47,32,.08)
}
.orchard-marketing .scale-stage-head small{
  display:block;font-size:11px;letter-spacing:.16em;text-transform:uppercase;
  font-weight:950;color:#7b675a;margin-bottom:6px
}
.orchard-marketing .scale-stage-head h3{
  margin:0;font:600 28px/1.05 Georgia,serif;color:#493126;letter-spacing:-.025em
}
.orchard-marketing .scale-stage-head p{
  margin:0;max-width:480px;text-align:right;color:#453325;
  font-size:11px;line-height:1.55
}
.orchard-marketing .scale-stage-visual{padding:8px 22px 0}
.orchard-marketing .scale-stage-visual svg{display:block;width:100%;height:auto}
.orchard-marketing .scale-stage-foot{
  display:flex;justify-content:space-between;gap:18px;align-items:center;
  padding:13px 22px 17px;border-top:1px solid rgba(76,47,32,.08);
  color:#725e52;font-size:11px;line-height:1.45
}
.orchard-marketing .scale-stage-foot strong{color:#415c37}
.orchard-marketing .v15-root-edge{fill:none;stroke:#987258;stroke-width:2.4;opacity:.72}
.orchard-marketing .v15-graft-edge{fill:none;stroke:#7b9367;stroke-width:2.5;opacity:.82}
.orchard-marketing .v15-node{fill:#fffaf0;stroke:#607a4d;stroke-width:2.2}
.orchard-marketing .v15-root{fill:#754829;stroke:#5e3822;stroke-width:3}
.orchard-marketing .v15-rootstock{fill:#edf2e3;stroke:#5b7748;stroke-width:3}
.orchard-marketing .v15-label{font:900 15px Inter,system-ui,sans-serif;fill:#3c2a21}
.orchard-marketing .v15-label-light{font:900 18px Inter,system-ui,sans-serif;fill:#fff2d7}
.orchard-marketing .v15-sub{font:800 10px Inter,system-ui,sans-serif;fill:#6f5a4e;letter-spacing:.035em}
.orchard-marketing .v15-sub-light{font:800 10.5px Inter,system-ui,sans-serif;fill:#eedabd;letter-spacing:.07em}
.orchard-marketing .v15-graft-box{fill:#f6f8ef;stroke:#668052;stroke-width:1.8}
.orchard-marketing .v15-graft-title{font:900 13px Inter,system-ui,sans-serif;fill:#3d2c22}
.orchard-marketing .v15-graft-pair{font:800 10.5px Inter,system-ui,sans-serif;fill:#735e51}
.orchard-marketing .wrapper-exhibit{
  display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:18px;
  padding:22px 26px;border:1px solid rgba(173,115,61,.22);border-radius:22px;
  background:linear-gradient(90deg,rgba(255,250,240,.75),rgba(244,226,193,.82),rgba(255,250,240,.75))
}
.orchard-marketing .wrapper-state{text-align:center}
.orchard-marketing .wrapper-state small{display:block;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;font-weight:950;color:#806b5d;margin-bottom:5px}
.orchard-marketing .wrapper-state strong{font:600 22px/1 Georgia,serif;color:#4b3327}
.orchard-marketing .wrapper-core{
  min-width:230px;text-align:center;padding:12px 22px;border-left:1px solid rgba(123,78,44,.18);border-right:1px solid rgba(123,78,44,.18)
}
.orchard-marketing .wrapper-core strong{display:block;color:#7d4e2f;font:700 17px/1 Georgia,serif}
.orchard-marketing .wrapper-core span{display:block;margin-top:6px;color:#806a5c;font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:900}
.orchard-marketing .wrapper-line{height:2px;background:linear-gradient(90deg,transparent,#b87940 18%,#b87940 82%,transparent);position:relative;margin:8px 0}
.orchard-marketing .wrapper-line:before,.orchard-marketing .wrapper-line:after{content:"";position:absolute;top:50%;width:8px;height:8px;border-top:2px solid #b87940;border-right:2px solid #b87940}
.orchard-marketing .wrapper-line:before{left:16%;transform:translateY(-50%) rotate(-135deg)}
.orchard-marketing .wrapper-line:after{right:16%;transform:translateY(-50%) rotate(45deg)}
.orchard-marketing .whorl-handoff{
  display:grid;grid-template-columns:auto 1fr auto;gap:18px;align-items:center;
  padding:22px 25px;border:1px dashed rgba(95,119,76,.28);border-radius:22px;
  background:rgba(237,242,227,.58)
}
.orchard-marketing .whorl-handoff .glyph{font-size:34px}
.orchard-marketing .whorl-handoff strong{display:block;font:600 20px/1.15 Georgia,serif;color:#425b39;margin-bottom:5px}
.orchard-marketing .whorl-handoff p{margin:0;color:#725f53;font-size:11.5px;line-height:1.55}
.orchard-marketing .whorl-handoff a{
  text-decoration:none;white-space:nowrap;border:1px solid rgba(83,107,70,.25);
  border-radius:999px;padding:9px 12px;background:#fffaf0;color:#4d653f;
  font-size:11px;letter-spacing:.1em;text-transform:uppercase;font-weight:950
}
.orchard-marketing .whorl-handoff a:hover{background:#f3f7ea}

@media(max-width:780px){
  .orchard-marketing .scale-stage-head{align-items:start;flex-direction:column}
  .orchard-marketing .scale-stage-head p{text-align:left}
  .orchard-marketing .wrapper-exhibit{grid-template-columns:1fr}
  .orchard-marketing .wrapper-core{border:0;border-top:1px solid rgba(123,78,44,.16);border-bottom:1px solid rgba(123,78,44,.16);padding:16px 8px}
  .orchard-marketing .whorl-handoff{grid-template-columns:auto 1fr}
  .orchard-marketing .whorl-handoff a{grid-column:1/-1;width:max-content}
}

@media(max-width:900px){.orchard-marketing .scale-columns{grid-template-columns:1fr}.orchard-marketing .scale-bridge{position:relative;left:auto;top:auto;transform:none;margin:-3px auto;width:180px}.orchard-marketing .scale-bridge:before,.orchard-marketing .scale-bridge:after{display:none}.orchard-marketing .scale-panel svg{aspect-ratio:auto}.orchard-marketing .scale-note-v14{flex-direction:column}}


.orchard-marketing .structure-section{max-width:1220px;margin:0 auto;padding:105px 22px}.orchard-marketing .structure-head{max-width:880px;margin-bottom:35px}.orchard-marketing .structure-head h2{margin:9px 0 17px;font:500 clamp(44px,5.8vw,76px)/.96 Georgia,serif;letter-spacing:-.05em;color:#483025}.orchard-marketing .structure-head p{margin:0;color:#453325;font-size:14px;line-height:1.72}.orchard-marketing .structure-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.orchard-marketing .structure-card{overflow:hidden;border:1px solid var(--line);border-radius:24px;background:linear-gradient(145deg,#fffdf8,#f3e7d3);box-shadow:0 16px 42px rgba(69,44,29,.08)}.orchard-marketing .structure-visual{height:360px;display:grid;place-items:center;background:radial-gradient(circle at 50% 35%,rgba(143,169,111,.13),transparent 55%)}.orchard-marketing .structure-visual svg{width:100%;height:100%}.orchard-marketing .structure-copy{padding:18px 20px 21px;border-top:1px solid var(--line)}.orchard-marketing .structure-copy small{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;font-weight:900;color:#788366}.orchard-marketing .structure-copy h3{font:500 24px/1 Georgia,serif;margin:8px 0 9px}.orchard-marketing .structure-copy p{margin:0;color:#453325;font-size:12px;line-height:1.6}.orchard-marketing .spec-node2{fill:#fff8e8;stroke:#657c52;stroke-width:2}.orchard-marketing .spec-root2{fill:#75482b;stroke:#5d3922;stroke-width:2}.orchard-marketing .spec-rootstock2{fill:#e9efdc;stroke:#657e52;stroke-width:2}.orchard-marketing .spec-edge2{fill:none;stroke:#90a871;stroke-width:3;stroke-linecap:round}.orchard-marketing .spec-edge2.dash{stroke-dasharray:6 7;stroke-width:2;opacity:.72}.orchard-marketing .spec-label2{font:900 13px Inter,system-ui,sans-serif;fill:#3f2e25}.orchard-marketing .spec-small2{font:800 10px Inter,system-ui,sans-serif;fill:#513e2f;letter-spacing:.04em;paint-order:stroke;stroke:#fff7e9;stroke-width:1.5px}.orchard-marketing .peanut-shell{fill:#a66d42;stroke:#7c4b2b;stroke-width:2}.orchard-marketing .peanut-rib{fill:none;stroke:#75452a;stroke-width:7;stroke-linecap:round;opacity:.34}.orchard-marketing .grove-not-structure{margin-top:16px;border:1px solid var(--line);border-radius:18px;background:#34432d;color:#e9e0d0;padding:16px 18px;display:flex;justify-content:space-between;gap:30px;align-items:center}.orchard-marketing .grove-not-structure strong{font:500 19px/1.2 Georgia,serif;color:#d8e7b2}.orchard-marketing .grove-not-structure span{font-size:11px;line-height:1.55;color:#c6b9a7;max-width:730px}

.orchard-marketing .projection-section{padding:105px 22px;background:#3a2b22;color:#f1e4d0}.orchard-marketing .projection-inner{max-width:1180px;margin:auto}.orchard-marketing .projection-head{display:grid;grid-template-columns:.82fr 1.18fr;gap:55px;align-items:end;margin-bottom:35px}.orchard-marketing .projection-head .eyebrow{color:#bdd09b}.orchard-marketing .projection-head h2{font:500 clamp(44px,5.8vw,76px)/.96 Georgia,serif;letter-spacing:-.05em;margin:9px 0 0}.orchard-marketing .projection-head p{margin:0;color:#c7b8a6;font-size:14px;line-height:1.72}.orchard-marketing .taxonomy{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 25px}.orchard-marketing .taxonomy span{padding:8px 11px;border-radius:999px;border:1px solid rgba(204,224,167,.18);background:rgba(255,255,255,.04);font-size:11px;letter-spacing:.11em;text-transform:uppercase;font-weight:900;color:#d5e2b5}.orchard-marketing .projection-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.orchard-marketing .projection{min-height:330px;border:1px solid rgba(255,255,255,.11);border-radius:22px;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.025));padding:22px;position:relative;overflow:hidden}.orchard-marketing .projection .glyph{font-size:36px;margin-bottom:42px}.orchard-marketing .projection small{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:#aebf8e;font-weight:900}.orchard-marketing .projection h3{font:500 29px/1 Georgia,serif;margin:10px 0 13px}.orchard-marketing .projection p{margin:0;color:#c8b9a8;font-size:12px;line-height:1.65}.orchard-marketing .projection .metric{position:absolute;left:22px;right:22px;bottom:21px;border-top:1px solid rgba(255,255,255,.1);padding-top:12px;color:#d6e5b0;font-size:10.5px;letter-spacing:.07em;text-transform:uppercase}.orchard-marketing .projection .metric strong{font-size:15px;letter-spacing:0;color:#f1e7d6}.orchard-marketing .projection.sun:after{content:'';position:absolute;width:180px;height:180px;border-radius:50%;right:-75px;top:-70px;background:radial-gradient(circle,#c9d88f 0 4%,transparent 5%),conic-gradient(from 0deg,rgba(203,220,145,.18),transparent 12%,rgba(203,220,145,.16) 23%,transparent 34%,rgba(203,220,145,.16) 47%,transparent 58%,rgba(203,220,145,.16) 71%,transparent 82%,rgba(203,220,145,.16));opacity:.8}.orchard-marketing .projection.heirloom:after{content:'';position:absolute;width:130px;height:130px;border:2px dashed rgba(219,190,132,.2);border-radius:50%;right:-38px;top:-28px}.orchard-marketing .projection.poly:after{content:'';position:absolute;width:160px;height:160px;right:-45px;top:-35px;background:repeating-radial-gradient(circle at 45% 50%,rgba(182,210,138,.15) 0 2px,transparent 2px 14px);opacity:.8}

.orchard-marketing .microclimate{max-width:1180px;margin:0 auto;padding:105px 22px}.orchard-marketing .micro-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px}.orchard-marketing .micro-card{border:1px solid var(--line);border-radius:26px;background:linear-gradient(145deg,#fffdf8,#f1e3ce);padding:28px;box-shadow:0 18px 48px rgba(73,46,30,.08)}.orchard-marketing .micro-card h3{font:500 clamp(32px,4vw,48px)/1 Georgia,serif;letter-spacing:-.035em;margin:8px 0 13px}.orchard-marketing .micro-card p{color:#755f54;font-size:13px;line-height:1.68}.orchard-marketing .micro-list{display:grid;gap:8px;margin-top:20px}.orchard-marketing .micro-row{display:grid;grid-template-columns:120px 1fr;gap:12px;border-top:1px solid var(--line);padding-top:10px;font-size:11px}.orchard-marketing .micro-row strong{color:#536b46}.orchard-marketing .micro-row span{color:#453325}.orchard-marketing .micro-card.dark{background:linear-gradient(145deg,#3b2d24,#293723);color:#f1e5d3}.orchard-marketing .micro-card.dark p,.orchard-marketing .micro-card.dark .micro-row span{color:#c8baa8}.orchard-marketing .micro-card.dark .micro-row{border-color:rgba(255,255,255,.09)}.orchard-marketing .micro-card.dark .micro-row strong{color:#cfe1a5}.orchard-marketing .micro-card.dark .eyebrow{color:#bdd09b}.orchard-marketing .machine-state{border:1px solid rgba(211,229,172,.18);border-radius:14px;padding:16px;text-align:center}.orchard-marketing .machine-state strong{font:500 23px/1 Georgia,serif;color:#d8e6b5}.orchard-marketing .machine-state small{display:block;margin-top:5px;color:#98a887;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase}.orchard-marketing .machine-action{color:#c9dba0;font-size:10.5px;line-height:1.7;text-align:center;letter-spacing:.07em;text-transform:uppercase}.orchard-marketing .machine-arrow{font-size:24px;color:#c9dba0}

@media(max-width:1000px){.orchard-marketing .five-layers{grid-template-columns:1fr 1fr}.orchard-marketing .layer:not(:last-child):after{display:none}.orchard-marketing .structure-grid,.orchard-marketing .projection-grid{grid-template-columns:1fr}.orchard-marketing .micro-grid{grid-template-columns:1fr}}
@media(max-width:650px){.orchard-marketing .five-layers{grid-template-columns:1fr}.orchard-marketing .machine-arrow{transform:rotate(90deg);text-align:center}.orchard-marketing .micro-row{grid-template-columns:1fr}.orchard-marketing .structure-visual{height:320px}}


/* V10 — deeper Orchard vocabulary */
.orchard-marketing .truth{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;font-size:10.5px;font-weight:950;letter-spacing:.12em;text-transform:uppercase;border:1px solid var(--line);background:rgba(255,250,240,.7);color:#6f5b4e}.orchard-marketing .truth:before{content:"";width:6px;height:6px;border-radius:50%;background:#718c5b}.orchard-marketing .truth.snapshot:before{background:#b58a4d}.orchard-marketing .truth.experimental:before{background:#c8754f}
.orchard-marketing .factor-section,.orchard-marketing .physics-section,.orchard-marketing .claim-section,.orchard-marketing .boundary-section{padding:105px 22px}.orchard-marketing .factor-inner,.orchard-marketing .physics-inner,.orchard-marketing .claim-inner,.orchard-marketing .boundary-inner{max-width:1180px;margin:auto}.orchard-marketing .section-head{display:grid;grid-template-columns:.9fr 1.1fr;gap:60px;align-items:end;margin-bottom:36px}.orchard-marketing .section-head h2{font:500 clamp(43px,5.5vw,74px)/.96 Georgia,serif;letter-spacing:-.045em;color:#493226;margin:9px 0 0}.orchard-marketing .section-head p{margin:0;color:#453325;font-size:14px;line-height:1.72;max-width:630px}.orchard-marketing .section-head strong{color:#405b36}
.orchard-marketing .factor-section{background:#f2e7d4;border-top:1px solid var(--line2);border-bottom:1px solid var(--line2)}.orchard-marketing .factor-card{display:grid;grid-template-columns:1.1fr .9fr;overflow:hidden;border:1px solid var(--line);border-radius:30px;background:rgba(255,250,240,.8);box-shadow:var(--shadow)}.orchard-marketing .factor-visual{min-height:510px;background:radial-gradient(circle at 50% 48%,#fffdf7,#eadfcb);border-right:1px solid var(--line);display:grid;place-items:center}.orchard-marketing .factor-visual svg{width:100%;height:100%;min-height:510px}.orchard-marketing .factor-copy{padding:clamp(34px,5vw,62px);display:flex;flex-direction:column;justify-content:center}.orchard-marketing .factor-copy h3{font:500 clamp(32px,4vw,49px)/1 Georgia,serif;margin:10px 0 19px;color:#4b3326}.orchard-marketing .factor-copy p{font-size:13px;line-height:1.68;color:#453325;margin:0 0 14px}.orchard-marketing .factor-copy .aside{font:italic 20px/1.45 Georgia,serif;color:#536b47;margin-top:12px}.orchard-marketing .partition-ring{fill:none;stroke:#cbb99f;stroke-width:1.5;stroke-dasharray:3 7}.orchard-marketing .partition-edge{stroke:#98765a;stroke-width:1.8;opacity:.65}.orchard-marketing .partition-node{fill:#fff9ed;stroke:#7d654f;stroke-width:1.7}.orchard-marketing .partition-root{fill:#74472b;stroke:#5b351f;stroke-width:2.2}.orchard-marketing .partition-state{fill:#e8efdc;stroke:#607b4d;stroke-width:2}.orchard-marketing .partition-sink{fill:#4b3429;stroke:#ba784d;stroke-width:2}.orchard-marketing .partition-text{font:800 11px Inter,system-ui,sans-serif;fill:#4f392d}.orchard-marketing .partition-small{font:800 10px Inter,system-ui,sans-serif;fill:#856f61;letter-spacing:.07em}
.orchard-marketing .physics-section{background:var(--cream)}.orchard-marketing .mechanism-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.orchard-marketing .mechanism{min-height:245px;padding:19px;border:1px solid var(--line);border-radius:20px;background:linear-gradient(145deg,#fffdf8,#f2e7d4);position:relative;overflow:hidden}.orchard-marketing .mechanism .micon{width:42px;height:42px;border-radius:13px;background:#fffaf0;border:1px solid var(--line);display:grid;place-items:center;font-size:21px;margin-bottom:18px}.orchard-marketing .mechanism small{font-size:10.5px;letter-spacing:.13em;text-transform:uppercase;font-weight:950;color:#71805f}.orchard-marketing .mechanism h3{font:500 21px/1.1 Georgia,serif;margin:7px 0 9px;color:#4b3428}.orchard-marketing .mechanism p{font-size:11.5px;line-height:1.53;color:#453325;margin:0}.orchard-marketing .mechanism .law{position:absolute;left:18px;right:18px;bottom:16px;padding-top:10px;border-top:1px solid var(--line2);font-size:11px;font-weight:900;color:#587047}.orchard-marketing .physics-note{margin-top:18px;padding:18px 21px;border-radius:17px;background:#35422f;color:#e8ddca;font:400 17px/1.5 Georgia,serif}.orchard-marketing .physics-note strong{color:#d6e6aa;font-weight:500}
.orchard-marketing .claim-section{background:#eee2ce;border-top:1px solid var(--line2);border-bottom:1px solid var(--line2)}.orchard-marketing .claim-card{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid var(--line);border-radius:30px;overflow:hidden;background:#fffaf0;box-shadow:var(--shadow)}.orchard-marketing .claim-copy{padding:clamp(34px,5vw,62px)}.orchard-marketing .claim-copy h3{font:500 clamp(35px,4.5vw,56px)/.98 Georgia,serif;margin:10px 0 18px;color:#4b3326}.orchard-marketing .claim-copy p{font-size:13px;line-height:1.7;color:#453325;margin:0 0 14px}.orchard-marketing .claim-copy strong{color:#405b36}.orchard-marketing .claim-visual{background:radial-gradient(circle at 50% 45%,#f7f0df,#e4d4ba);border-left:1px solid var(--line);min-height:470px}.orchard-marketing .claim-visual svg{width:100%;height:100%;min-height:470px}.orchard-marketing .claim-node{fill:#fffaf0;stroke:#745c49;stroke-width:1.7}.orchard-marketing .claim-root{fill:#e7eddb;stroke:#678253;stroke-width:2}.orchard-marketing .claim-edge{fill:none;stroke:#78965e;stroke-width:2.5;stroke-linecap:round}.orchard-marketing .claim-edge.secondary{stroke:#b07d55;stroke-dasharray:5 6}.orchard-marketing .claim-label{fill:#3f2e25;font:900 13px Inter,system-ui,sans-serif}.orchard-marketing .claim-small{fill:#695448;font:800 10px Inter,system-ui,sans-serif;letter-spacing:.04em;paint-order:stroke;stroke:#fff7e9;stroke-width:1.5px}.orchard-marketing .examples{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:22px}.orchard-marketing .example{border:1px solid var(--line);border-radius:13px;padding:12px;background:rgba(255,255,255,.36)}.orchard-marketing .example strong{display:block;font-size:11px;margin-bottom:5px}.orchard-marketing .example span{font-size:10.5px;line-height:1.4;color:#7b685c}
.orchard-marketing .pnut-generations{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:17px}.orchard-marketing .generation{border:1px solid var(--line);background:rgba(255,255,255,.42);border-radius:14px;padding:13px}.orchard-marketing .generation small{display:block;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:#806c5e;font-weight:950;margin-bottom:5px}.orchard-marketing .generation strong{font:500 16px/1.15 Georgia,serif;color:#4b3428}.orchard-marketing .generation span{display:block;margin-top:6px;font-size:10.5px;line-height:1.45;color:#7a675b}
.orchard-marketing .boundary-section{background:#293522;color:#eee2cf}.orchard-marketing .boundary-section .section-head h2{color:#f3e8d6}.orchard-marketing .boundary-section .section-head p{color:#c2b6a6}.orchard-marketing .boundary-section .eyebrow{color:#b9cb99}.orchard-marketing .boundary-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:14px}.orchard-marketing .boundary-card{border:1px solid rgba(225,238,194,.16);border-radius:22px;background:rgba(255,255,255,.035);padding:24px}.orchard-marketing .boundary-card h3{font:500 25px/1.1 Georgia,serif;margin:8px 0 11px;color:#f0e3cf}.orchard-marketing .boundary-card p{font-size:12px;line-height:1.65;color:#bdaf9e;margin:0 0 13px}.orchard-marketing .boundary-card strong{color:#d5e5ac}.orchard-marketing .flowline{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:8px;align-items:center;margin-top:18px}.orchard-marketing .flowbox{border:1px solid rgba(225,238,194,.17);border-radius:13px;padding:12px;text-align:center;font-size:10.5px;font-weight:900;color:#e7dbc7;background:rgba(0,0,0,.1)}.orchard-marketing .flowarrow{color:#a9c57e}.orchard-marketing .realm{padding:12px 0;border-bottom:1px solid rgba(225,238,194,.1)}.orchard-marketing .realm:last-child{border-bottom:0}.orchard-marketing .realm small{display:block;font-size:10.5px;text-transform:uppercase;letter-spacing:.13em;color:#a4b78c;font-weight:950;margin-bottom:4px}.orchard-marketing .realm strong{font-size:12px}.orchard-marketing .realm span{display:block;color:#b8aa9a;font-size:11px;line-height:1.5;margin-top:4px}
.orchard-marketing .snapshot-warning{font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:#8b715c;margin-top:8px}.orchard-marketing .snapshot-warning strong{color:#a66d42}
@media(max-width:960px){.orchard-marketing .mechanism-grid{grid-template-columns:repeat(2,1fr)}.orchard-marketing .section-head,.orchard-marketing .factor-card,.orchard-marketing .claim-card,.orchard-marketing .boundary-grid{grid-template-columns:1fr}.orchard-marketing .factor-visual,.orchard-marketing .claim-visual{border-right:0;border-left:0;border-bottom:1px solid var(--line)}.orchard-marketing .claim-visual{border-top:1px solid var(--line)}.orchard-marketing .examples{grid-template-columns:1fr}.orchard-marketing .flowline{grid-template-columns:1fr}.orchard-marketing .flowarrow{transform:rotate(90deg);text-align:center}.orchard-marketing .pnut-generations{grid-template-columns:1fr}}
@media(max-width:600px){.orchard-marketing .mechanism-grid{grid-template-columns:1fr}.orchard-marketing .factor-section,.orchard-marketing .physics-section,.orchard-marketing .claim-section,.orchard-marketing .boundary-section{padding-left:16px;padding-right:16px}.orchard-marketing .section-head{gap:20px}.orchard-marketing .factor-visual svg,.orchard-marketing .claim-visual svg{min-height:410px}.orchard-marketing .factor-visual,.orchard-marketing .claim-visual{min-height:410px}}


/* V11 — MetaDEX relationships, living market ecology, executable state */
.orchard-marketing .metadex-section{padding:0 22px 105px}.orchard-marketing .metadex-inner{max-width:1180px;margin:auto}.orchard-marketing .metadex-card{display:grid;grid-template-columns:.86fr 1.14fr;border:1px solid var(--line);border-radius:30px;overflow:hidden;background:linear-gradient(145deg,#fffdf8,#efe3ce);box-shadow:var(--shadow)}.orchard-marketing .metadex-copy{padding:clamp(34px,5vw,64px)}.orchard-marketing .metadex-copy h2{font:500 clamp(42px,5.7vw,76px)/.96 Georgia,serif;letter-spacing:-.05em;color:#493126;margin:10px 0 18px}.orchard-marketing .metadex-copy .lead{font:400 clamp(18px,2vw,25px)/1.52 Georgia,serif;color:#5f493d;margin:0 0 18px}.orchard-marketing .metadex-copy p{font-size:13px;line-height:1.72;color:#776257;margin:0 0 14px}.orchard-marketing .metadex-copy strong{color:#405b36}.orchard-marketing .metaquote{margin-top:23px;padding-top:18px;border-top:1px solid var(--line);font:italic 22px/1.38 Georgia,serif;color:#546b48}.orchard-marketing .market-map{min-height:570px;background:radial-gradient(circle at 50% 43%,rgba(255,255,255,.9),rgba(230,218,195,.74));border-left:1px solid var(--line)}.orchard-marketing .market-map svg{display:block;width:100%;height:100%;min-height:570px}.orchard-marketing .mm-market{fill:#fffaf0;stroke:#7d6756;stroke-width:1.5}.orchard-marketing .mm-root{fill:#754829;stroke:#5b351f;stroke-width:2.2}.orchard-marketing .mm-implied{fill:#e7eddc;stroke:#617c4f;stroke-width:1.7}.orchard-marketing .mm-edge{fill:none;stroke:#8aa06e;stroke-width:2.2;stroke-linecap:round}.orchard-marketing .mm-pollen{fill:none;stroke:#c28d4f;stroke-width:1.8;stroke-dasharray:6 7;stroke-linecap:round}.orchard-marketing .mm-label{fill:#49372c;font:800 11px Inter,system-ui,sans-serif}.orchard-marketing .mm-small{fill:#5a4636;font:800 10px Inter,system-ui,sans-serif;letter-spacing:.07em}.orchard-marketing .mm-white{fill:#fff3dc;font:800 12px Inter,system-ui,sans-serif}.orchard-marketing .market-key{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:22px}.orchard-marketing .market-key div{border:1px solid var(--line);border-radius:13px;padding:11px;background:rgba(255,255,255,.35)}.orchard-marketing .market-key small{display:block;color:#837063;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;font-weight:900}.orchard-marketing .market-key strong{display:block;margin-top:5px;font:500 16px/1.15 Georgia,serif;color:#4c3529}

.orchard-marketing .allocation-pressure{margin-top:16px;border:1px solid var(--line);border-radius:22px;background:rgba(255,250,240,.7);overflow:hidden}.orchard-marketing .allocation-head{padding:16px 18px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:20px;align-items:center}.orchard-marketing .allocation-head strong{font:500 20px/1 Georgia,serif;color:#4c3428}.orchard-marketing .allocation-head span{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#7a675a;font-weight:900}.orchard-marketing .jobs{display:grid;grid-template-columns:repeat(4,1fr)}.orchard-marketing .job{padding:17px;border-right:1px solid var(--line)}.orchard-marketing .job:last-child{border-right:0}.orchard-marketing .job small{font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:#798566;font-weight:900}.orchard-marketing .job strong{display:block;margin-top:6px;font:500 19px/1.1 Georgia,serif;color:#4b3529}.orchard-marketing .job p{font-size:11px;line-height:1.48;color:#513e2f;margin:7px 0 0}.orchard-marketing .allocation-foot{padding:12px 18px;background:#35422f;color:#e9dfcd;font-size:10.5px;line-height:1.55}.orchard-marketing .allocation-foot strong{color:#d4e5ab}

.orchard-marketing .ecology-section{padding:105px 22px;background:#eef0df;border-top:1px solid var(--line2);border-bottom:1px solid var(--line2)}.orchard-marketing .ecology-inner{max-width:1180px;margin:auto}.orchard-marketing .ecology-head{display:grid;grid-template-columns:.8fr 1.2fr;gap:58px;align-items:end;margin-bottom:32px}.orchard-marketing .ecology-head h2{font:500 clamp(43px,5.6vw,75px)/.96 Georgia,serif;letter-spacing:-.05em;color:#493226;margin:9px 0 0}.orchard-marketing .ecology-head p{font-size:14px;line-height:1.72;color:#715f53;margin:0}.orchard-marketing .ecology-head strong{color:#405b36}.orchard-marketing .ecology-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:14px}.orchard-marketing .maturity-card,.orchard-marketing .ecology-card{border:1px solid var(--line);border-radius:24px;background:rgba(255,250,240,.74);box-shadow:0 18px 45px rgba(73,46,30,.06)}.orchard-marketing .maturity-card{padding:25px}.orchard-marketing .maturity-card h3{font:500 31px/1 Georgia,serif;margin:8px 0 10px;color:#493428}.orchard-marketing .maturity-card>p{font-size:12px;line-height:1.6;color:#453325;margin:0}.orchard-marketing .maturity-track{position:relative;margin:30px 10px 19px;height:164px}.orchard-marketing .maturity-line{position:absolute;left:26px;right:26px;top:73px;height:2px;background:linear-gradient(90deg,#c8ae86,#6c8a57)}.orchard-marketing .maturity-node{position:absolute;top:43px;width:62px;height:62px;border-radius:50%;display:grid;place-items:center;background:#fff9ea;border:2px solid #78905f;font:700 10px Inter,system-ui,sans-serif;color:#4d653f;text-align:center}.orchard-marketing .maturity-node.sap{left:0;border-color:#b19266;color:#806044}.orchard-marketing .maturity-node.tree{right:0}.orchard-marketing .maturity-mid{position:absolute;left:50%;top:51px;transform:translateX(-50%);width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:#f2ecd9;border:1.5px solid #8c9c74;font-size:20px}.orchard-marketing .maturity-label{position:absolute;top:115px;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:#7e6a5d;font-weight:900}.orchard-marketing .maturity-label.left{left:0}.orchard-marketing .maturity-label.mid{left:50%;transform:translateX(-50%);text-align:center}.orchard-marketing .maturity-label.right{right:0;text-align:right}.orchard-marketing .growth-signals{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.orchard-marketing .growth-signals span{padding:8px 5px;border-radius:10px;background:#edf1e2;border:1px solid rgba(97,124,76,.12);text-align:center;font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;color:#5d714f;font-weight:900}.orchard-marketing .no-threshold{margin-top:14px;font-size:10.5px;color:#826d60;border-top:1px solid var(--line);padding-top:12px}.orchard-marketing .no-threshold strong{color:#4f6742}.orchard-marketing .ecology-stack{display:grid;grid-template-columns:1fr 1fr;gap:10px}.orchard-marketing .ecology-card{padding:18px;min-height:164px}.orchard-marketing .ecology-card .ecoicon{font-size:24px;margin-bottom:18px}.orchard-marketing .ecology-card small{font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:#758462;font-weight:950}.orchard-marketing .ecology-card h3{font:500 22px/1 Georgia,serif;color:#493428;margin:7px 0 8px}.orchard-marketing .ecology-card p{font-size:11px;line-height:1.5;color:#78655a;margin:0}.orchard-marketing .ecology-card strong{color:#4b643f}.orchard-marketing .polyculture-note{margin-top:13px;padding:15px 18px;border-radius:15px;background:#34432d;color:#e9dfcc;display:flex;justify-content:space-between;gap:20px;font-size:10.5px;line-height:1.5}.orchard-marketing .polyculture-note strong{color:#d3e5a9}.orchard-marketing .water-split{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px}.orchard-marketing .water-split div{padding:9px 10px;border-radius:10px;background:#f4eddd;border:1px solid var(--line2)}.orchard-marketing .water-split small{display:block;font-size:10px;color:#857266}.orchard-marketing .water-split b{font-size:10.5px;color:#536a47}

.orchard-marketing .discrete-note{margin-top:16px;padding:15px 18px;border-radius:15px;border:1px solid var(--line);background:#fff8e9;display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:start}.orchard-marketing .discrete-note .fruit{font-size:28px}.orchard-marketing .discrete-note strong{display:block;color:#506644;font:500 18px/1.1 Georgia,serif;margin-bottom:5px}.orchard-marketing .discrete-note span{font-size:11px;line-height:1.5;color:#7b675a}

@media(max-width:1000px){.orchard-marketing .market-map{border-left:0;border-top:1px solid var(--line)}.orchard-marketing .jobs{grid-template-columns:1fr 1fr}.orchard-marketing .job:nth-child(2){border-right:0}.orchard-marketing .job:nth-child(-n+2){border-bottom:1px solid var(--line)}}
@media(max-width:650px){.orchard-marketing .ecology-head{grid-template-columns:1fr;gap:18px}.orchard-marketing .market-map,.orchard-marketing .market-map svg{min-height:480px}}


/* V12 — Whorl family + nutUSD credit reserve */
.orchard-marketing .whorl-family{padding:105px 22px;background:#f2e7d4;border-top:1px solid var(--line2);border-bottom:1px solid var(--line2)}
.orchard-marketing .whorl-inner,.orchard-marketing .credit-inner{max-width:1180px;margin:auto}
.orchard-marketing .whorl-head,.orchard-marketing .credit-head{display:grid;grid-template-columns:.82fr 1.18fr;gap:58px;align-items:end;margin-bottom:34px}
.orchard-marketing .whorl-head h2,.orchard-marketing .credit-head h2{font:500 clamp(43px,5.6vw,76px)/.96 Georgia,serif;letter-spacing:-.05em;color:#493226;margin:9px 0 0}
.orchard-marketing .whorl-head p,.orchard-marketing .credit-head p{font-size:14px;line-height:1.72;color:#453325;margin:0}.orchard-marketing .whorl-head strong,.orchard-marketing .credit-head strong{color:#405b36}
.orchard-marketing .whorl-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.orchard-marketing .whorl-card{overflow:hidden;border:1px solid var(--line);border-radius:26px;background:#fffaf0;box-shadow:0 18px 48px rgba(73,46,30,.07)}
.orchard-marketing .whorl-visual{height:300px;background:radial-gradient(circle at 50% 45%,rgba(255,255,255,.96),rgba(232,220,197,.72));border-bottom:1px solid var(--line);display:grid;place-items:center}
.orchard-marketing .whorl-visual svg{width:100%;height:100%}.orchard-marketing .whorl-copy{padding:21px}.orchard-marketing .whorl-copy small{font-size:10.5px;letter-spacing:.13em;text-transform:uppercase;font-weight:950;color:#788565}.orchard-marketing .whorl-copy h3{font:500 27px/1 Georgia,serif;margin:8px 0 10px;color:#4a3428}.orchard-marketing .whorl-copy p{font-size:11.5px;line-height:1.62;color:#453325;margin:0 0 12px}.orchard-marketing .whorl-copy strong{color:#4e6841}.orchard-marketing .whorl-tags{display:flex;gap:6px;flex-wrap:wrap}.orchard-marketing .whorl-tags span{font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;font-weight:900;border:1px solid var(--line);border-radius:999px;padding:6px 8px;color:#7b6659;background:#f4ead9}
.orchard-marketing .whorl-shell{fill:#b87842;stroke:#6f452a;stroke-width:2}.orchard-marketing .whorl-shell.meta{fill:#6f8063;stroke:#4f6744}.orchard-marketing .whorl-shell.nested{fill:#a56d55;stroke:#754630}.orchard-marketing .whorl-ring{fill:none;stroke:#f3e0b7;stroke-width:1.5;stroke-dasharray:5 6;opacity:.9}.orchard-marketing .whorl-node{fill:#fff8e9;stroke:#6b584a;stroke-width:1.4}.orchard-marketing .whorl-edge{fill:none;stroke:#78925f;stroke-width:2;stroke-linecap:round}.orchard-marketing .whorl-label{fill:#4a372d;font:800 10px Inter,system-ui,sans-serif}.orchard-marketing .whorl-small{fill:#756255;font:800 7.5px Inter,system-ui,sans-serif;letter-spacing:.06em}
.orchard-marketing .credit-section{padding:105px 22px;background:#eef0df;border-top:1px solid var(--line2);border-bottom:1px solid var(--line2)}
.orchard-marketing .credit-card{display:grid;grid-template-columns:.92fr 1.08fr;overflow:hidden;border:1px solid var(--line);border-radius:30px;background:#fffaf0;box-shadow:var(--shadow)}
.orchard-marketing .credit-copy{padding:clamp(30px,4.7vw,58px)}.orchard-marketing .credit-copy .truth{margin-bottom:10px}.orchard-marketing .credit-copy h3{font:500 clamp(34px,4.3vw,57px)/.98 Georgia,serif;letter-spacing:-.04em;color:#493226;margin:0 0 16px}.orchard-marketing .credit-copy p{font-size:12.5px;line-height:1.68;color:#453325;margin:0 0 14px}.orchard-marketing .credit-copy strong{color:#405b36}.orchard-marketing .credit-rule{margin-top:19px;border-left:3px solid #738c5b;padding:13px 0 13px 16px;font:italic 19px/1.42 Georgia,serif;color:#526a46}.orchard-marketing .credit-facts{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:18px}.orchard-marketing .credit-fact{border:1px solid var(--line);border-radius:11px;padding:10px;background:#f5ecd9}.orchard-marketing .credit-fact small{display:block;font-size:10px;letter-spacing:.11em;text-transform:uppercase;color:#806d60;font-weight:900}.orchard-marketing .credit-fact b{display:block;margin-top:4px;font-size:11px;color:#4d633f}.orchard-marketing .credit-visual{min-height:520px;border-left:1px solid var(--line);background:radial-gradient(circle at 50% 44%,#fffdf6,#e4ead5);display:grid;place-items:center}.orchard-marketing .credit-visual svg{width:100%;height:100%;min-height:520px}.orchard-marketing .credit-node{fill:#fffaf0;stroke:#677e55;stroke-width:1.6}.orchard-marketing .credit-reserve{fill:#42583a;stroke:#b9ce91;stroke-width:2}.orchard-marketing .credit-market{fill:#edf2e4;stroke:#6d855a;stroke-width:1.4}.orchard-marketing .credit-edge{fill:none;stroke:#80996a;stroke-width:2.2;stroke-linecap:round}.orchard-marketing .credit-return{fill:none;stroke:#bf8d54;stroke-width:1.8;stroke-dasharray:6 6}.orchard-marketing .credit-label{fill:#49382e;font:800 11px Inter,system-ui,sans-serif}.orchard-marketing .credit-white{fill:#f6ecd8;font:800 12px Inter,system-ui,sans-serif}.orchard-marketing .credit-small{fill:#7a685d;font:800 10px Inter,system-ui,sans-serif;letter-spacing:.06em}
@media(max-width:1000px){.orchard-marketing .whorl-grid{grid-template-columns:1fr}.orchard-marketing .whorl-head,.orchard-marketing .credit-head,.orchard-marketing .credit-card{grid-template-columns:1fr}.orchard-marketing .credit-visual{border-left:0;border-top:1px solid var(--line)}}
@media(max-width:600px){.orchard-marketing .whorl-family,.orchard-marketing .credit-section{padding-left:16px;padding-right:16px}.orchard-marketing .credit-facts{grid-template-columns:1fr}}


/* V13 READABILITY */
@media(max-width:900px){
  .orchard-marketing .hero-note{font-size:10.5px;letter-spacing:.08em;padding:8px 11px}
  .orchard-marketing .scale-map{border-radius:22px}
  .orchard-marketing .scale-map svg{width:100%;height:auto}
  .orchard-marketing .scale-label{font-size:17px}
  .orchard-marketing .mass-text{font-size:18px}
  .orchard-marketing .mass-small{font-size:13px;stroke-width:2.5px}
  .orchard-marketing .scale-legend{grid-template-columns:1fr;gap:14px;padding:15px}
  .orchard-marketing .legend-rail{min-width:0;border-left:0;border-right:0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:12px 0}
  .orchard-marketing .legend-items{gap:7px}
  .orchard-marketing .legend-item{font-size:11px;padding:7px 9px}
}
@media(max-width:600px){
  .orchard-marketing .hero-note{max-width:92%;white-space:normal;text-align:center}
  .orchard-marketing .scale-map svg{min-width:720px}
  .orchard-marketing .scale-map{overflow-x:auto;overscroll-behavior-x:contain}
  .orchard-marketing .scale-map:after{content:'Swipe diagram horizontally for full geometry';display:block;position:sticky;left:0;padding:9px 14px;border-top:1px solid var(--line);background:rgba(255,250,240,.92);font-size:11px;letter-spacing:.09em;text-transform:uppercase;font-weight:900;color:#6b594d}
}

/* S84 additions: scoping safety + live board slot + docs reference strip */
.orchard-marketing *{box-sizing:border-box}
.orchard-marketing .live-board-wrap{max-width:1180px;margin:0 auto;padding:6px 22px 40px}
.orchard-marketing .live-title{font:600 24px/1.2 Georgia,serif;color:#4b3326;margin:16px 0 12px}
.orchard-marketing .board-caption{margin-top:14px;font-size:12px;color:#453325;text-align:center}
.orchard-marketing .docref{max-width:1180px;margin:0 auto;padding:6px 22px 56px;font-size:12.5px;color:#453325;font-weight:700;line-height:2}
.orchard-marketing .docref a{color:#4f6f42;text-decoration:underline;text-decoration-thickness:1.5px}
/* S84 hard rule: explanatory text dark */
.orchard-marketing .structure-copy p,.orchard-marketing .claim-copy p,.orchard-marketing .credit-copy p,.orchard-marketing .job p,.orchard-marketing .grove-copy p,.orchard-marketing .law{color:#453325}
.orchard-marketing .spec-small2,.orchard-marketing .mm-small,.orchard-marketing .svg-small{fill:#513e2f}
`;
  return (
    <section className="orchard-marketing">
      <div dangerouslySetInnerHTML={{ __html: PART_H }} />
      <div dangerouslySetInnerHTML={{ __html: PART_A }} />
      <div className="live-board-wrap">
        <div className="live-title">📋 All NUTs — live board</div>
        <OrchardBoard tokens={tokens} pools={pools} marketData={marketData} />
        <div className="board-caption">📊 Data sources: <strong>GT</strong> = GeckoTerminal · <strong>DS</strong> = DexScreener · <strong>RPC</strong> = Base RPC · <strong>CG</strong> = CoinGecko</div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: PART_C }} />
      <style dangerouslySetInnerHTML={{ __html: MARKETING_CSS }} />
    </section>
  );
}

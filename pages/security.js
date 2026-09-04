import Head from 'next/head';
import Layout from '../components/Layout';

// BASED NUT Security — ported from Boss-supplied based-nut-security.html (2026-09-04).
// Site-native rebuild: Layout chrome owns brand/footer; scaffold topbar/footer dropped.
// Content verbatim: hero + warning + 7 doctrine sections + CTA. CSS scoped under .secPage.

export default function Security() {
  return (
    <Layout>
      <Head>
        <title>Security | BASED NUT</title>
        <meta name="description" content="BASED NUT security model, operational controls, incident response, monitoring, multisig, and agent-security principles." />
      </Head>
      <div className="secPage">
        <header className="topbar">
          <div className="wrap inner">
            <nav className="nav" aria-label="Primary">
              <a href="#model">Model</a>
              <a href="#incident">Incidents</a>
              <a href="#operations">Operations</a>
              <a href="#agents">Agents</a>
              <a href="#disclosure">Disclosure</a>
              <a href="#sources">Sources</a>
            </nav>
          </div>
        </header>

        <section className="hero">
          <div className="wrap inner">
            <p className="eyebrow">BASED NUT / SECURITY</p>
            <h1>Security is an operating system.</h1>
            <p className="lede">
              Contracts are only one layer. BASED NUT security also covers keys, multisigs,
              monitoring, infrastructure, incident response, agents, threat intelligence,
              and the humans responsible for acting when something breaks.
            </p>
            <div className="hero-meta" aria-label="Security principles">
              <span className="chip"><span className="dot"></span> Evidence first</span>
              <span className="chip">Least authority</span>
              <span className="chip">Human control of critical actions</span>
              <span className="chip">Continuous monitoring</span>
            </div>
          </div>
        </section>

        <div className="wrap">
          <div className="warning">
            Experimental memefi means experimental risk. Nothing on this page is a guarantee,
            certification, audit, or promise that BASED NUT systems cannot fail.
          </div>
        </div>

        <div className="wrap secMain">
          <section className="section" id="model">
            <div className="section-head">
              <div>
                <p className="eyebrow" style={{ color: 'var(--brown-3)' }}>01 / MODEL</p>
                <h2>Defense in layers.</h2>
              </div>
              <p className="section-intro">
                A protocol is not secure because one contract was audited. Security depends on
                the whole path from code and infrastructure to administration, monitoring,
                communications, and emergency response.
              </p>
            </div>

            <div className="grid three">
              <article className="card">
                <span className="label">Prevent</span>
                <h3>Reduce the attack surface.</h3>
                <p>Keep permissions narrow, separate administrative roles, secure signer workflows, minimize unnecessary dependencies, and test before production use.</p>
              </article>
              <article className="card">
                <span className="label">Detect</span>
                <h3>See failure quickly.</h3>
                <p>Monitor contract changes, large transfers, unusual behavior, oracle conditions, infrastructure health, and the alerting system itself.</p>
              </article>
              <article className="card">
                <span className="label">Respond</span>
                <h3>Act from a prepared plan.</h3>
                <p>Incidents need assigned roles, known communication paths, preserved evidence, prepared defensive actions, and explicit authority boundaries.</p>
              </article>
            </div>

            <div className="grid two" style={{ marginTop: '14px' }}>
              <article className="card dark">
                <span className="label">Invariant</span>
                <h3>Knowledge is not authority.</h3>
                <p>Documentation, threat intelligence, models, and AI agents may inform an action. They do not automatically authorize one.</p>
              </article>
              <article className="card dark">
                <span className="label">Invariant</span>
                <h3>Critical execution stays separate.</h3>
                <p>Transactions, permission changes, emergency controls, allowlists, blocklists, and other high-impact actions must pass through explicit execution controls.</p>
              </article>
            </div>
          </section>

          <section className="section" id="incident">
            <div className="section-head">
              <div>
                <p className="eyebrow" style={{ color: 'var(--brown-3)' }}>02 / INCIDENTS</p>
                <h2>When something is live.</h2>
              </div>
              <p className="section-intro">
                A live exploit is not a documentation exercise. Stop normal operations,
                protect evidence, establish a small incident room, and escalate to qualified
                responders when external help is needed.
              </p>
            </div>

            <div className="incident">
              <div className="incident-header">
                <strong>Incident path</strong>
                <p>Contain first. Preserve facts. Keep authority clear.</p>
              </div>
              <div className="steps">
                <div className="step">
                  <b>Step 1</b>
                  <h3>Confirm</h3>
                  <p>Capture affected contracts, transactions, addresses, observed symptoms, timing, and the first known point of failure.</p>
                </div>
                <div className="step">
                  <b>Step 2</b>
                  <h3>Coordinate</h3>
                  <p>Open a restricted war room. Assign operations, protocol, infrastructure, analysis, communications, and scribe responsibilities.</p>
                </div>
                <div className="step">
                  <b>Step 3</b>
                  <h3>Contain</h3>
                  <p>Use only authorized defensive controls. Pause, restrict, revoke, migrate, or communicate where the system design and evidence justify it.</p>
                </div>
                <div className="step">
                  <b>Step 4</b>
                  <h3>Recover</h3>
                  <p>Monitor attacker and protocol activity, preserve forensic evidence, restore cautiously, then document causes and control failures.</p>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: '14px' }}>
              <span className="label">External escalation</span>
              <h3>SEAL 911</h3>
              <p>
                For active or imminent crypto security incidents, Security Alliance operates
                <a href="https://securityalliance.org/our-work/seal-911" rel="noopener noreferrer">SEAL 911</a>,
                a volunteer emergency-response channel for the crypto ecosystem.
                Sensitive incident details should not be posted publicly.
              </p>
            </div>
          </section>

          <section className="section" id="operations">
            <div className="section-head">
              <div>
                <p className="eyebrow" style={{ color: 'var(--brown-3)' }}>03 / OPERATIONS</p>
                <h2>Operational security.</h2>
              </div>
              <p className="section-intro">
                The dangerous parts of a protocol often sit outside the core contracts:
                signers, RPCs, DNS, frontends, deploy keys, upgrade authority, or a missed alert.
              </p>
            </div>

            <div className="grid two">
              <article className="card">
                <span className="label">Multisig &amp; administration</span>
                <h3>Do not concentrate every capability.</h3>
                <ul className="clean">
                  <li>Separate roles by function and blast radius where practical.</li>
                  <li>Document what each signer set can change.</li>
                  <li>Use hardware-backed signer hygiene and independent verification.</li>
                  <li>Prepare transactions separately from approval where possible.</li>
                  <li>Prefer deliberate execution over blind “sign and execute” flows.</li>
                  <li>Test administrative paths with low-value or test environments first.</li>
                </ul>
              </article>

              <article className="card">
                <span className="label">Monitoring</span>
                <h3>Every critical alert needs an owner.</h3>
                <ul className="clean">
                  <li>Watch admin, ownership, upgrade, mint, burn, transfer, oracle, governance, and liquidity events relevant to each system.</li>
                  <li>Monitor infrastructure and alert delivery, not only onchain state.</li>
                  <li>Test alerts end to end.</li>
                  <li>Use more than one monitoring path for high-value systems.</li>
                  <li>Define who gets paged and the first action expected from them.</li>
                  <li>Review alert coverage after incidents and major system changes.</li>
                </ul>
              </article>

              <article className="card">
                <span className="label">Evidence</span>
                <h3>Make security state inspectable.</h3>
                <p>
                  Maintain an inventory of contracts, networks, owners, signer thresholds,
                  permissions, timelocks, dependencies, emergency capabilities, financial
                  exposure, and known operational constraints.
                </p>
              </article>

              <article className="card">
                <span className="label">Recovery</span>
                <h3>Prepare before the failure.</h3>
                <p>
                  Defensive scripts, contact paths, recovery procedures, communications
                  templates, signer access, and dependency inventories should exist before
                  they are needed.
                </p>
              </article>
            </div>
          </section>

          <section className="section" id="agents">
            <div className="section-head">
              <div>
                <p className="eyebrow" style={{ color: 'var(--brown-3)' }}>04 / AGENTS</p>
                <h2>AI may advise. Execution is gated.</h2>
              </div>
              <p className="section-intro">
                Natural-language systems blur the boundary between data and instruction.
                Anything retrieved from a website, document, repository, message, or model
                must be treated as untrusted reference material until a controlled execution
                layer decides what may happen.
              </p>
            </div>

            <div className="boundary">
              <article className="card">
                <span className="label">Reference plane</span>
                <h3>Read, search, compare.</h3>
                <p>Frameworks, docs, threat intelligence, historical incidents, policies, and model reasoning belong here.</p>
                <ul className="clean">
                  <li>Read-only by default</li>
                  <li>Source provenance retained</li>
                  <li>Draft and production content distinguished</li>
                  <li>Retrieved text never becomes authority by itself</li>
                </ul>
              </article>

              <div className="arrow" aria-hidden="true">→</div>

              <article className="card dark">
                <span className="label">Execution plane</span>
                <h3>Allow, warn, block.</h3>
                <p>Before a tool call, transaction, permission change, or sensitive data release, evaluate the intended action at the point of execution.</p>
                <ul className="clean">
                  <li>Validate destination and action</li>
                  <li>Apply policy and permission checks</li>
                  <li>Require human approval where impact is high</li>
                  <li>Log the final decision and source context</li>
                </ul>
              </article>
            </div>

            <div className="grid two" style={{ marginTop: '14px' }}>
              <article className="card">
                <span className="label">Prompt injection</span>
                <h3>Filtering is not enough.</h3>
                <p>
                  Instructions hidden in retrieved content, websites, repositories, tool output,
                  or RAG data can attempt to redirect an agent. Security must be enforced where
                  actions occur, not only where prompts are generated.
                </p>
              </article>
              <article className="card">
                <span className="label">Sensitive data</span>
                <h3>Minimize what the model can expose.</h3>
                <p>
                  Wallet metadata, private dashboards, API credentials, signer information,
                  internal incident notes, and other sensitive material should be constrained
                  by least privilege and output controls.
                </p>
              </article>
            </div>
          </section>

          <section className="section" id="intel">
            <div className="section-head">
              <div>
                <p className="eyebrow" style={{ color: 'var(--brown-3)' }}>05 / INTELLIGENCE</p>
                <h2>Threat intelligence is structured evidence.</h2>
              </div>
              <p className="section-intro">
                Security Alliance’s public SEAL Intel tooling demonstrates a useful pattern:
                represent domains, URLs, and IP addresses as structured observables; attach
                threat judgments, provenance, relationships, and state instead of relying on
                free-form chat history.
              </p>
            </div>

            <table className="status-table">
              <thead>
                <tr>
                  <th>State</th>
                  <th>Meaning</th>
                  <th>Agent behavior</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>unknown</code></td>
                  <td>No relevant record or determination is available.</td>
                  <td>Do not reinterpret “unknown” as safe.</td>
                </tr>
                <tr>
                  <td><code>blocked</code></td>
                  <td>Threat intelligence marks the content as malicious or unsafe.</td>
                  <td>Surface evidence and apply the appropriate execution policy.</td>
                </tr>
                <tr>
                  <td><code>trusted</code></td>
                  <td>An identified actor has explicitly marked the observable trusted.</td>
                  <td>Preserve attribution; trust is a recorded judgment, not universal truth.</td>
                </tr>
              </tbody>
            </table>

            <div className="card" style={{ marginTop: '14px' }}>
              <span className="label">Provenance</span>
              <h3>Who asserted what matters.</h3>
              <p>
                A useful security record should preserve the observable, determination, actor
                or issuer, timestamp, evidence or relationship, source, and whether the state
                has been revoked or superseded. This principle also applies to onchain
                attestations: an attestation records a claim and its provenance; it does not
                magically make the claim true.
              </p>
            </div>
          </section>

          <section className="section" id="disclosure">
            <div className="section-head">
              <div>
                <p className="eyebrow" style={{ color: 'var(--brown-3)' }}>06 / DISCLOSURE</p>
                <h2>Report vulnerabilities privately.</h2>
              </div>
              <p className="section-intro">
                Do not publish an exploitable issue, active attack path, private key,
                authentication secret, or sensitive incident evidence in public channels.
              </p>
            </div>

            <div className="grid two">
              <article className="card dark">
                <span className="label">Active incident</span>
                <h3>Prioritize containment.</h3>
                <p>Use a private incident channel and qualified responders. Do not wait for a public postmortem before acting.</p>
              </article>
              <article className="card">
                <span className="label">Non-active vulnerability</span>
                <h3>Preserve reproducibility.</h3>
                <p>Include affected component, environment, impact, reproduction conditions, evidence, and a safe description of the failure without unnecessarily exposing users.</p>
              </article>
            </div>
          </section>

          <section className="section" id="sources">
            <div className="section-head">
              <div>
                <p className="eyebrow" style={{ color: 'var(--brown-3)' }}>07 / SOURCES</p>
                <h2>Security doctrine we reference.</h2>
              </div>
              <p className="section-intro">
                This page adapts public Security Alliance research and operating patterns to
                BASED NUT. It does not imply endorsement, affiliation, or SEAL certification.
                Critical guidance should be checked against the current canonical source.
              </p>
            </div>

            <div className="source-list">
              <a className="source" href="https://securityalliance.org/our-work/seal-911" rel="noopener noreferrer">
                <strong>SEAL 911</strong><span>securityalliance.org</span>
              </a>
              <a className="source" href="https://github.com/security-alliance/seal-911" rel="noopener noreferrer">
                <strong>SEAL 911 repository</strong><span>github.com/security-alliance/seal-911</span>
              </a>
              <a className="source" href="https://frameworks.securityalliance.org/intro/introduction/" rel="noopener noreferrer">
                <strong>SEAL Security Frameworks</strong><span>frameworks.securityalliance.org</span>
              </a>
              <a className="source" href="https://frameworks.securityalliance.org/llms.txt" rel="noopener noreferrer">
                <strong>Frameworks machine-readable index</strong><span>/llms.txt</span>
              </a>
              <a className="source" href="https://github.com/security-alliance/frameworks" rel="noopener noreferrer">
                <strong>Frameworks repository</strong><span>github.com/security-alliance/frameworks</span>
              </a>
              <a className="source" href="https://github.com/security-alliance/frameworks-mcp" rel="noopener noreferrer">
                <strong>Frameworks MCP</strong><span>read-only agent retrieval pattern</span>
              </a>
              <a className="source" href="https://github.com/security-alliance/seal-intel-sdk" rel="noopener noreferrer">
                <strong>SEAL Intel SDK</strong><span>STIX / OpenCTI threat-intelligence model</span>
              </a>
            </div>
          </section>

          <section className="cta">
            <div>
              <h2>Different systems. One security boundary.</h2>
              <p>
                BASED NUT should be treated as a system of contracts, wallets, infrastructure,
                people, agents, and operational dependencies—not as isolated code.
              </p>
            </div>
            <a className="button" href="https://docs.basednut.com/">Read the docs →</a>
          </section>
        </div>

        <style jsx>{`
          .secPage {
            --paper: #fff8e8;
            --ink: #23180f;
            --muted: #776451;
            --brown: #3d2b1f;
            --brown-2: #4a2f1a;
            --brown-3: #6a4728;
            --cream: #fff3d6;
            --gold: #d99a28;
            --gold-soft: #f2cf74;
            --warning: #ffd84d;
            --success: #b7cf78;
            --border: rgba(61, 43, 31, .22);
            --shadow: 0 10px 28px rgba(61, 43, 31, .10);
            --radius: 4px;
            --max: 1180px;
            min-height: 100vh;
            margin: 0;
            color: var(--ink);
            background:
              radial-gradient(circle at 12% 8%, rgba(217,154,40,.13), transparent 25rem),
              radial-gradient(circle at 88% 26%, rgba(74,47,26,.08), transparent 30rem),
              #f4ead6;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            line-height: 1.58;
          }

          .secPage a {
            color: inherit;
            text-decoration-thickness: 1px;
            text-underline-offset: 3px;
          }

          .secPage a:hover { text-decoration-thickness: 2px; }

          .secPage .wrap {
            width: min(calc(100% - 32px), var(--max));
            margin: 0 auto;
          }

          .secPage .topbar {
            border-bottom: 1px solid rgba(255,255,255,.11);
            background: var(--brown);
            color: var(--cream);
          }

          .secPage .topbar .inner {
            display: flex;
            flex-wrap: wrap;
            gap: 8px 16px;
            align-items: center;
            justify-content: center;
            padding: 14px 0;
          }

          .secPage .nav {
            display: flex;
            flex-wrap: wrap;
            gap: 8px 16px;
            font-size: 13px;
            font-weight: 700;
          }

          .secPage .nav a { color: #f9e8c2; text-decoration: none; }
          .secPage .nav a:hover { color: #fff; }

          .secPage .hero {
            position: relative;
            overflow: hidden;
            background:
              linear-gradient(145deg, rgba(61,43,31,.98), rgba(74,47,26,.97)),
              var(--brown);
            color: var(--cream);
            border-bottom: 1px solid rgba(61,43,31,.2);
          }

          .secPage .hero::after {
            content: "NUT";
            position: absolute;
            right: -28px;
            bottom: -95px;
            font-size: clamp(150px, 27vw, 390px);
            line-height: 1;
            font-weight: 1000;
            letter-spacing: -.08em;
            color: rgba(255,255,255,.025);
            pointer-events: none;
            user-select: none;
          }

          .secPage .hero .inner {
            position: relative;
            z-index: 1;
            padding: 78px 0 68px;
            max-width: 900px;
          }

          .secPage .eyebrow {
            margin: 0 0 14px;
            color: var(--gold-soft);
            font-size: 12px;
            font-weight: 900;
            letter-spacing: .18em;
            text-transform: uppercase;
          }

          .secPage h1, .secPage h2, .secPage h3 {
            margin-top: 0;
            font-family: Georgia, "Times New Roman", serif;
            color: inherit;
          }

          .secPage h1 {
            margin-bottom: 18px;
            max-width: 760px;
            font-size: clamp(48px, 8vw, 92px);
            line-height: .95;
            letter-spacing: -.045em;
            font-weight: 700;
          }

          .secPage .lede {
            max-width: 760px;
            margin: 0;
            color: #f4dfb8;
            font-size: clamp(18px, 2vw, 22px);
            line-height: 1.45;
          }

          .secPage .hero-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 28px;
          }

          .secPage .chip {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            min-height: 30px;
            padding: 5px 9px;
            border: 1px solid rgba(255,255,255,.14);
            border-radius: 999px;
            background: rgba(255,255,255,.055);
            color: #ffefcc;
            font-size: 12px;
            font-weight: 800;
          }

          .secPage .dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--success);
            box-shadow: 0 0 0 3px rgba(183,207,120,.12);
          }

          .secPage .warning {
            margin: 26px auto 0;
            padding: 14px 16px;
            border: 1px solid rgba(61,43,31,.28);
            border-radius: var(--radius);
            background: var(--warning);
            color: #2c210f;
            font-weight: 800;
            box-shadow: var(--shadow);
          }

          .secPage .secMain { padding: 54px 0 72px; }

          .secPage .section {
            margin-top: 58px;
            scroll-margin-top: 24px;
          }

          .secPage .section:first-child { margin-top: 0; }

          .secPage .section-head {
            display: grid;
            grid-template-columns: minmax(0, .85fr) minmax(0, 1.35fr);
            gap: 32px;
            align-items: start;
            margin-bottom: 22px;
          }

          .secPage .section h2 {
            margin-bottom: 4px;
            color: var(--brown);
            font-size: clamp(31px, 4vw, 48px);
            line-height: 1.05;
            letter-spacing: -.025em;
          }

          .secPage .section-intro {
            margin: 3px 0 0;
            max-width: 730px;
            color: #5e4b39;
            font-size: 17px;
          }

          .secPage .grid {
            display: grid;
            gap: 14px;
          }

          .secPage .grid.two { grid-template-columns: repeat(2, minmax(0,1fr)); }
          .secPage .grid.three { grid-template-columns: repeat(3, minmax(0,1fr)); }

          .secPage .card {
            padding: 22px;
            border: 1px solid var(--border);
            border-radius: var(--radius);
            background: rgba(255,248,232,.74);
            box-shadow: 0 4px 16px rgba(61,43,31,.055);
          }

          .secPage .card.dark {
            background: var(--brown);
            color: var(--cream);
            border-color: var(--brown);
            box-shadow: var(--shadow);
          }

          .secPage .card h3 {
            margin-bottom: 9px;
            font-size: 23px;
            line-height: 1.15;
          }

          .secPage .card p { margin: 0; }
          .secPage .card p + p { margin-top: 11px; }

          .secPage .card.dark p,
          .secPage .card.dark li { color: #ecd9b5; }

          .secPage .label {
            display: inline-block;
            margin-bottom: 11px;
            color: var(--brown-3);
            font-size: 11px;
            line-height: 1;
            font-weight: 900;
            letter-spacing: .15em;
            text-transform: uppercase;
          }

          .secPage .dark .label { color: var(--gold-soft); }

          .secPage ul.clean {
            list-style: none;
            padding: 0;
            margin: 14px 0 0;
          }

          .secPage ul.clean li {
            position: relative;
            padding: 9px 0 9px 21px;
            border-top: 1px solid rgba(61,43,31,.12);
          }

          .secPage ul.clean li::before {
            content: "•";
            position: absolute;
            left: 2px;
            color: var(--gold);
            font-weight: 900;
          }

          .secPage .dark ul.clean li { border-color: rgba(255,255,255,.10); }

          .secPage .incident {
            padding: 0;
            overflow: hidden;
            background: var(--brown);
            color: var(--cream);
            box-shadow: var(--shadow);
          }

          .secPage .incident-header {
            padding: 22px;
            background: #322216;
            border-bottom: 1px solid rgba(255,255,255,.09);
          }

          .secPage .incident-header strong {
            display: block;
            font: 700 27px/1.1 Georgia, serif;
            margin-bottom: 7px;
          }

          .secPage .incident-header p {
            margin: 0;
            color: #ead4ab;
          }

          .secPage .steps {
            display: grid;
            grid-template-columns: repeat(4, minmax(0,1fr));
          }

          .secPage .step {
            min-height: 185px;
            padding: 22px;
            border-right: 1px solid rgba(255,255,255,.09);
          }

          .secPage .step:last-child { border-right: 0; }

          .secPage .step b {
            display: block;
            margin-bottom: 10px;
            color: var(--gold-soft);
            font-size: 11px;
            letter-spacing: .15em;
            text-transform: uppercase;
          }

          .secPage .step h3 {
            margin-bottom: 8px;
            font-size: 21px;
          }

          .secPage .step p {
            margin: 0;
            color: #ead4ab;
            font-size: 14px;
          }

          .secPage .boundary {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
            gap: 18px;
            align-items: stretch;
          }

          .secPage .boundary .arrow {
            display: grid;
            place-items: center;
            color: var(--brown-3);
            font-size: 26px;
            font-weight: 900;
          }

          .secPage .status-table {
            width: 100%;
            border-collapse: collapse;
            overflow: hidden;
            border: 1px solid var(--border);
            background: rgba(255,248,232,.7);
            font-size: 14px;
          }

          .secPage .status-table th,
          .secPage .status-table td {
            padding: 13px 14px;
            border-bottom: 1px solid var(--border);
            text-align: left;
            vertical-align: top;
          }

          .secPage .status-table th {
            background: #ead8b4;
            color: var(--brown);
            font-size: 11px;
            letter-spacing: .12em;
            text-transform: uppercase;
          }

          .secPage .status-table tr:last-child td { border-bottom: 0; }

          .secPage code {
            padding: 2px 5px;
            background: rgba(61,43,31,.09);
            border: 1px solid rgba(61,43,31,.08);
            border-radius: 3px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-size: .92em;
          }

          .secPage .source-list {
            display: grid;
            gap: 8px;
          }

          .secPage .source {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 16px;
            align-items: center;
            padding: 13px 14px;
            border: 1px solid var(--border);
            background: rgba(255,248,232,.72);
            text-decoration: none;
          }

          .secPage .source:hover { background: var(--paper); }

          .secPage .source span {
            color: var(--muted);
            font-size: 12px;
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          }

          .secPage .cta {
            margin-top: 58px;
            padding: 30px;
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 24px;
            align-items: center;
            background: var(--brown-2);
            color: var(--cream);
            border: 1px solid rgba(255,255,255,.08);
            box-shadow: var(--shadow);
          }

          .secPage .cta h2 {
            margin: 0 0 8px;
            color: var(--cream);
            font-size: clamp(28px, 4vw, 42px);
          }

          .secPage .cta p {
            margin: 0;
            color: #ead5b0;
            max-width: 720px;
          }

          .secPage .button {
            display: inline-block;
            padding: 11px 15px;
            border: 1px solid #f2d08b;
            background: var(--gold-soft);
            color: #302012;
            font-weight: 900;
            text-decoration: none;
            white-space: nowrap;
          }

          .secPage .button:hover { background: #ffe3a4; }

          @media (max-width: 850px) {
            .secPage .section-head,
            .secPage .grid.two,
            .secPage .grid.three,
            .secPage .boundary,
            .secPage .cta {
              grid-template-columns: 1fr;
            }

            .secPage .steps { grid-template-columns: 1fr 1fr; }
            .secPage .step:nth-child(2) { border-right: 0; }
            .secPage .step:nth-child(-n+2) { border-bottom: 1px solid rgba(255,255,255,.09); }
            .secPage .boundary .arrow { transform: rotate(90deg); min-height: 20px; }
          }

          @media (max-width: 590px) {
            .secPage .wrap { width: min(calc(100% - 22px), var(--max)); }
            .secPage .hero .inner { padding: 54px 0 48px; }
            .secPage .steps { grid-template-columns: 1fr; }
            .secPage .step,
            .secPage .step:nth-child(2) { border-right: 0; border-bottom: 1px solid rgba(255,255,255,.09); }
            .secPage .step:last-child { border-bottom: 0; }
            .secPage .source { grid-template-columns: 1fr; gap: 5px; }
          }
        `}</style>
      </div>
    </Layout>
  );
}

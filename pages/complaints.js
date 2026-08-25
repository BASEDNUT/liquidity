import Head from 'next/head';
import { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

// NUT Department of Complaints & Emotional Liquidity
// Design: Boss-supplied index.html, ported verbatim (paper-bureaucracy look).
// Local-only: no network calls, nothing persisted. Complainant prefilled — Karen is funnier.

const GRIEVANCES = [
  'Price went down',
  'Price went up without me',
  'Someone said “wen moon”',
  'Insufficient NUT exposure',
  'Excessive NUT exposure',
  'Liquidity-related emotional damage',
  'Other weak-handed behavior',
];
const RESPONSIBLE = ['The market', 'The bonding curve', 'Arbitrageurs', 'Myself, unfortunately', 'Jeff'];
const SEVERITIES = [
  { value: 'Mildly Salted', nuts: '🥜' },
  { value: 'Roasted', nuts: '🥜🥜' },
  { value: 'Absolutely NUTTERED', nuts: '🥜🥜🥜' },
];
const DEFAULT_NAME = 'KAREN N. TITLEMENT';

export default function Complaints() {
  const [name, setName] = useState(DEFAULT_NAME);
  const [grievances, setGrievances] = useState([]);
  const [severity, setSeverity] = useState('');
  const [responsible, setResponsible] = useState('');
  const [statement, setStatement] = useState('');
  const [stage, setStage] = useState('form');
  const [caseId, setCaseId] = useState(null);

  const toggleGrievance = (item) =>
    setGrievances((cur) => (cur.includes(item) ? cur.filter((x) => x !== item) : [...cur, item]));

  const reset = () => {
    setName(DEFAULT_NAME);
    setGrievances([]);
    setSeverity('');
    setResponsible('');
    setStatement('');
    setCaseId(null);
    setStage('form');
  };

  const submit = (e) => {
    e.preventDefault();
    if (!grievances.length) {
      alert('Bureaucratic error: select at least one grievance.');
      return;
    }
    setCaseId(Math.floor(10000 + Math.random() * 89999));
    setStage('received');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const go = (next) => {
    setStage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout>
      <Head>
        <title>NUT Department of Complaints & Emotional Liquidity</title>
        <meta name="description" content="Your feelings are valid. Your trades are under review." />
      </Head>
      <div className="cPage">
        <div className="shell">
          <main className="paper">
            <header className="topbar">
              <div className="seal"><div><b>🌰</b>OFFICIAL<br />NUT SEAL</div></div>
              <div>
                <h1>NUT Department of Complaints & Emotional Liquidity</h1>
                <div className="subtitle">Your feelings are valid. Your trades are under review.</div>
              </div>
              <div className="office-code"><strong>FORM NUT-13F</strong>Revision 6.9<br />Office of Market Feelings<br />Public Counter</div>
            </header>

            <div className="ticker"><span>NOTICE: COMPLAINTS DO NOT ALTER BLOCKCHAIN STATE &nbsp;•&nbsp; PRICE ACTION MAY CONTINUE DURING REVIEW &nbsp;•&nbsp; PLEASE REMAIN LIQUID &nbsp;•&nbsp; COMPLAINTS DO NOT ALTER BLOCKCHAIN STATE &nbsp;•&nbsp; PRICE ACTION MAY CONTINUE DURING REVIEW &nbsp;•&nbsp; PLEASE REMAIN LIQUID &nbsp;•&nbsp; </span></div>

            {stage === 'form' && (
              <section className="content">
                <form onSubmit={submit}>
                  <h2 className="section-title">0. Complainant of record</h2>
                  <div className="field">
                    <label htmlFor="complainant">Legal-ish name</label>
                    <input id="complainant" type="text" maxLength={80} value={name} autoComplete="off" onChange={(e) => setName(e.target.value)} />
                  </div>

                  <h2 className="section-title">1. Nature of grievance</h2>
                  <div className="field choices">
                    {GRIEVANCES.map((item) => (
                      <label className="choice" key={item}>
                        <input type="checkbox" checked={grievances.includes(item)} onChange={() => toggleGrievance(item)} />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>

                  <h2 className="section-title">2. Severity</h2>
                  <div className="field severity">
                    {SEVERITIES.map((item) => (
                      <label key={item.value} className={severity === item.value ? 'checked' : ''}>
                        <input required type="radio" name="severity" value={item.value} checked={severity === item.value} onChange={() => setSeverity(item.value)} />
                        <span className="nuts">{item.nuts}</span>
                        <span>{item.value}</span>
                      </label>
                    ))}
                  </div>

                  <h2 className="section-title">3. Who is responsible?</h2>
                  <div className="field choices">
                    {RESPONSIBLE.map((item) => (
                      <label className="choice" key={item}>
                        <input required type="radio" name="responsible" value={item} checked={responsible === item} onChange={() => setResponsible(item)} />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>

                  <h2 className="section-title">4. Supporting emotional evidence</h2>
                  <div className="field">
                    <label htmlFor="statement">Describe what the market did to you</label>
                    <textarea id="statement" maxLength={700} value={statement} placeholder="Example: I sold and then it went up, which appears targeted." onChange={(e) => setStatement(e.target.value)} />
                  </div>
                  <button className="button" type="submit">Submit Formal Grievance →</button>
                </form>

                <aside className="side">
                  <div className="notice">Do not panic.<br />Your panic has already been priced in.</div>
                  <div className="status"><b>Current desk status</b>OPEN<br />Average empathy latency: 4 blocks<br />Queue priority: economically irrelevant</div>
                  <div className="status"><b>Jurisdiction</b>Price complaints<br />Arbitrage trauma<br />Bonding-curve confusion<br />General market betrayal</div>
                  <div className="desk"><span className="stamp">Emotionally<br />Received</span></div>
                  <p className="tiny">By filing this form you acknowledge that charts may move independently of your expectations, timing, conviction, personal narrative, or group chat consensus.</p>
                </aside>
              </section>
            )}

            {stage === 'received' && (
              <section className="result active">
                <div className="stamp">Complaint Received</div>
                <h2>Your grievance exists now.</h2>
                <div className="case">CASE #NUT-{caseId}</div>
                <p>Complainant of record: <strong>{name.trim() || DEFAULT_NAME}</strong>.</p>
                <p>Your complaint has been forwarded to the <strong>Supreme Council of Nut Affairs</strong>.</p>
                <p>Current estimated resolution: <strong>2–3 market cycles.</strong><br />In the meantime, please remain liquid.</p>
                <div className="action-row">
                  <button className="button alt" onClick={() => go('denied')}>I Want To See The Manager</button>
                  <button className="button ghost" onClick={reset}>File Another Complaint</button>
                </div>
              </section>
            )}

            {stage === 'denied' && (
              <section className="result active">
                <div className="stamp">Appeal Denied</div>
                <h2>Peanutoshi has ruled.</h2>
                <div className="peanut-wrap">
                  <div className="peanut">
                    <div className="glasses"><div className="lens" /><div className="bridge" /><div className="lens" /></div>
                    <div className="mouth" />
                  </div>
                </div>
                <p>Peanutoshi reviewed the blockchain and determined that <strong>the code is behaving as coded.</strong></p>
                <p>Recommended treatment:<br /><strong>Acquire perspective. Touch grass. Study liquidity.</strong></p>
                <p className="errorline">Reason code: USER_EXPECTATION ≠ MARKET_STATE</p>
                <div className="action-row">
                  <button className="button alt" onClick={() => go('manager')}>I Demand To Speak To The Manager</button>
                </div>
              </section>
            )}

            {stage === 'manager' && (
              <section className="result active">
                <img className="manager-image" src="/img/peanut.webp" alt="A suited peanut in sunglasses declaring I AM THE MANAGER" />
                <div className="manager-card">Office of Ultimate Escalations</div>
                <p>Your complaint has reached management.</p>
                <p><strong>Corrective action:</strong> Grow your NUTS.</p>
                <p className="errorline">No further appeals. Terminal bureaucracy achieved.</p>
                <div className="action-row">
                  <Link href="/"><button className="button">Grow Your NUTS</button></Link>
                </div>
              </section>
            )}

            <footer className="footer">
              <span>NUT Consumer Protection Bureau · Office of Liquidity Grievances</span>
              <span>NO REFUNDS · NO GUARANTEES · NO EMOTIONAL SLIPPAGE PROTECTION</span>
            </footer>
          </main>
        </div>
      </div>
      <style jsx>{`
        .cPage{
          min-height:100vh;
          color:#15120d;
          font-family:"Courier New", Courier, monospace;
          background:
            radial-gradient(circle at 15% 10%, rgba(255,255,255,.45), transparent 30%),
            repeating-linear-gradient(0deg, rgba(40,30,15,.022) 0 1px, transparent 1px 4px),
            #d8caaa;
          padding-bottom:20px;
        }
        .cPage button,.cPage input,.cPage textarea,.cPage select{font:inherit}
        .shell{width:min(1050px,calc(100% - 28px));margin:26px auto 50px}
        .paper{
          position:relative;
          background:#f2e8cf;
          border:1px solid #7a6d55;
          box-shadow:0 18px 50px rgba(35,28,16,.16), 8px 10px 0 rgba(255,255,255,.18) inset;
          overflow:hidden;
        }
        .paper:before{
          content:"";position:absolute;inset:0;pointer-events:none;opacity:.42;
          background:repeating-linear-gradient(90deg,transparent 0 19px,rgba(63,49,25,.025) 20px);
        }
        .topbar{
          position:relative;z-index:1;
          display:grid;grid-template-columns:96px 1fr 140px;gap:18px;align-items:center;
          padding:22px 26px 18px;border-bottom:3px double #272119
        }
        .seal{
          width:84px;height:84px;border:3px double #9d241f;border-radius:50%;display:grid;place-items:center;
          color:#9d241f;font-weight:900;text-align:center;line-height:.95;transform:rotate(-6deg);font-size:11px;
        }
        .seal b{font-size:28px;display:block}
        .topbar h1{font-family:Georgia,serif;margin:0;text-transform:uppercase;font-size:clamp(24px,4vw,46px);line-height:.95;letter-spacing:-1.5px}
        .subtitle{margin-top:8px;color:#6d6659;font-size:13px}
        .office-code{text-align:right;font-size:11px;line-height:1.6;color:#6d6659}
        .office-code strong{display:block;color:#15120d;font-size:12px}
        .ticker{position:relative;z-index:1;border-bottom:1px solid #272119;padding:8px 26px;background:#e5d7b8;font-size:11px;overflow:hidden;white-space:nowrap}
        .ticker span{display:inline-block;animation:scroll 20s linear infinite}
        @keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-55%)}}
        .content{position:relative;z-index:1;padding:26px;display:grid;grid-template-columns:1fr 280px;gap:24px}
        .section-title{display:flex;align-items:center;gap:10px;margin:0 0 14px;text-transform:uppercase;font-weight:900;letter-spacing:.5px}
        .section-title:after{content:"";height:1px;background:#272119;flex:1}
        .field{margin:0 0 18px}
        .field>label{display:block;font-weight:900;margin-bottom:9px;text-transform:uppercase;font-size:12px;letter-spacing:.5px}
        .choices{display:grid;gap:8px}
        .choice{display:flex;gap:10px;align-items:flex-start;background:rgba(255,255,255,.24);padding:10px 11px;border:1px solid #9d9077;cursor:pointer}
        .choice:hover{background:rgba(255,255,255,.45)}
        .choice input{accent-color:#9d241f;margin-top:2px}
        textarea,input[type=text]{width:100%;border:1px solid #736851;background:#f7efd9;padding:10px;color:#15120d;outline:none}
        textarea:focus,input[type=text]:focus{box-shadow:0 0 0 2px #b8903a}
        textarea{min-height:98px;resize:vertical}
        .severity{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
        .severity label{display:grid;place-items:center;gap:7px;text-align:center;padding:12px 7px;border:1px solid #8b7c62;background:#f5ecd4;cursor:pointer;font-size:11px;font-weight:700}
        .severity input{display:none}
        .severity label.checked{outline:3px solid #9d241f;outline-offset:-3px;background:#ead5b1}
        .nuts{font-size:18px;letter-spacing:-4px;padding-right:4px}
        .button{
          appearance:none;border:2px solid #272119;background:#15120d;color:#fff;padding:13px 16px;font-weight:900;text-transform:uppercase;cursor:pointer;box-shadow:4px 4px 0 #b8903a;transition:.08s transform,.08s box-shadow
        }
        .button:hover{transform:translate(2px,2px);box-shadow:2px 2px 0 #b8903a}
        .button.alt{background:#9d241f;box-shadow:4px 4px 0 #54211d}
        .button.ghost{background:transparent;color:#15120d;box-shadow:4px 4px 0 #afa080}
        .side{border-left:1px solid #8f836b;padding-left:20px}
        .notice{border:2px solid #9d241f;padding:15px;color:#9d241f;transform:rotate(.6deg);font-weight:900;text-transform:uppercase;text-align:center;margin-bottom:22px}
        .status{border:1px solid #8b806a;padding:14px;background:#e8dcc3;font-size:12px;line-height:1.55;margin-bottom:16px}
        .status b{display:block;margin-bottom:4px;text-transform:uppercase}
        .tiny{font-size:10px;color:#6d6659;line-height:1.5}
        .desk{margin-top:16px;border-top:1px solid #998d75;padding-top:14px}
        .stamp{display:inline-block;border:3px double #9d241f;color:#9d241f;font-weight:900;padding:8px 12px;transform:rotate(-4deg);font-size:12px;text-transform:uppercase}
        .result{padding:36px 26px 40px;text-align:center}
        .result h2{font-family:Georgia,serif;font-size:clamp(34px,6vw,70px);margin:8px 0 16px;letter-spacing:-2px;text-transform:uppercase}
        .case{display:inline-block;border:2px solid #272119;background:#ebdfc3;padding:10px 14px;margin-bottom:16px;font-weight:900}
        .result p{max-width:700px;margin:10px auto;line-height:1.6}
        .action-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:24px}
        .peanut-wrap{display:grid;place-items:center;margin:8px auto 18px}
        .peanut{
          position:relative;width:170px;height:235px;
          background:radial-gradient(circle at 35% 26%,#d4a752 0 7%,transparent 8%),radial-gradient(circle at 68% 64%,#c49544 0 7%,transparent 8%),#c99b47;
          border:4px solid #5f401f;border-radius:43% 49% 45% 53% / 38% 52% 44% 57%;
          transform:rotate(4deg);box-shadow:inset -14px -12px 0 rgba(90,56,20,.13),0 13px 0 rgba(54,40,18,.1)
        }
        .peanut:before,.peanut:after{content:"";position:absolute;left:17px;right:17px;height:3px;background:#7d572c;transform:rotate(28deg);opacity:.55}
        .peanut:before{top:72px;box-shadow:0 38px 0 #7d572c,0 76px 0 #7d572c}
        .peanut:after{top:94px;transform:rotate(-27deg);box-shadow:0 38px 0 #7d572c,0 76px 0 #7d572c}
        .glasses{position:absolute;z-index:4;left:29px;top:73px;display:flex;gap:4px;transform:rotate(-2deg)}
        .lens{width:52px;height:31px;background:#161616;border:4px solid #050505;border-radius:5px 5px 18px 18px}
        .bridge{width:10px;height:4px;background:#050505;margin-top:7px}
        .mouth{position:absolute;left:66px;top:132px;width:44px;height:17px;border-bottom:5px solid #4c2b18;border-radius:0 0 50% 50%;z-index:4}
        .manager-card{display:inline-block;border:3px double #272119;padding:8px 13px;background:#efe4ca;font-size:11px;text-transform:uppercase;transform:rotate(-1deg)}
        .manager-image{display:block;width:min(720px,100%);height:auto;margin:4px auto 22px;border:2px solid #272119;box-shadow:8px 8px 0 #b8903a;background:#efd5ae}
        .errorline{font-weight:900;color:#9d241f;text-transform:uppercase;margin-top:18px}
        .footer{position:relative;z-index:1;border-top:3px double #272119;padding:13px 26px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;font-size:10px;color:#6d6659}
        @media(max-width:760px){
          .topbar{grid-template-columns:74px 1fr}.office-code{display:none}.seal{width:68px;height:68px}.seal b{font-size:22px}
          .content{grid-template-columns:1fr}.side{border-left:0;border-top:1px solid #8f836b;padding-left:0;padding-top:20px}.severity{grid-template-columns:1fr}
        }
        @media(prefers-reduced-motion:reduce){.ticker span{animation:none}}
      `}</style>
    </Layout>
  );
}

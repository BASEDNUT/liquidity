import { useEffect, useRef, useState, useCallback } from "react";
import Head from "next/head";
import Layout from "../components/Layout";

const NUTS = [
  { emoji: "🌰", points: 1 },
  { emoji: "🌰", points: 2 },
  { emoji: "🥥", points: 3 }
];
const BOMB_EMOJI = "💣";
const MAX_MISSES = 5;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function pickNut() {
  return NUTS[Math.floor(Math.random() * NUTS.length)];
}

export default function NutCatcher() {
  const gameRef = useRef(null);
  const basketRef = useRef(50);
  const scoreRef = useRef(0);
  const missesRef = useRef(0);
  const modeRef = useRef("splash");
  const nextIdRef = useRef(1);
  const nextBurstRef = useRef(1);
  const objectsRef = useRef([]);
  const burstsRef = useRef([]);
  const rafRef = useRef(0);
  const startRef = useRef(null);

  const [mode, setMode] = useState("splash");
  const [basketX, setBasketX] = useState(50);
  const [tick, setTick] = useState(0);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [serverTitle, setServerTitle] = useState("🌰 Awaiting harvest");
  const [gameOverMessage, setGameOverMessage] = useState("Miss too many nuts and the basket gets liquidated.");

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { basketRef.current = basketX; }, [basketX]);

  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem("nut-catcher-high-score") || 0);
      if (Number.isFinite(saved)) setHighScore(saved);
    } catch (e) {}
  }, []);

  const endGame = useCallback((msg) => {
    modeRef.current = "over";
    setGameOverMessage(msg);
    setMode("over");
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const startGame = useCallback(() => {
    scoreRef.current = 0;
    missesRef.current = 0;
    objectsRef.current = [];
    burstsRef.current = [];
    nextIdRef.current = 1;
    nextBurstRef.current = 1;
    modeRef.current = "playing";
    setScore(0);
    setMisses(0);
    setBasketX(50);
    setServerTitle("🌰 Awaiting harvest");
    setGameOverMessage("Miss too many nuts and the basket gets liquidated.");
    setMode("playing");
  }, []);

  startRef.current = startGame;

  useEffect(() => {
    function onKeyDown(e) {
      const key = e.key.toLowerCase();
      if ((modeRef.current === "splash" || modeRef.current === "over") && (key === "enter" || key === " ")) {
        startRef.current();
        return;
      }
      if (modeRef.current !== "playing") return;
      if (key === "arrowleft" || key === "a") setBasketX(x => clamp(x - 8, 8, 92));
      if (key === "arrowright" || key === "d") setBasketX(x => clamp(x + 8, 8, 92));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (mode !== "playing") return;

    let last = performance.now();
    let spawnMs = 0;

    const loop = (now) => {
      if (modeRef.current !== "playing") return;

      const dt = Math.min(32, now - last);
      last = now;
      spawnMs += dt;

      const rect = gameRef.current ? gameRef.current.getBoundingClientRect() : null;
      const width = rect ? rect.width : 360;
      const height = rect ? rect.height : 540;
      const spawnEvery = Math.max(260, 720 - scoreRef.current * 8);

      const objs = objectsRef.current;
      for (let i = 0; i < objs.length; i++) {
        objs[i].y += objs[i].speed * (dt / 16.67);
      }

      if (spawnMs >= spawnEvery) {
        spawnMs = 0;
        const bombChance = Math.min(0.28, 0.12 + scoreRef.current * 0.003);
        const isBomb = Math.random() < bombChance;
        const nut = isBomb ? null : pickNut();
        objs.push({
          id: nextIdRef.current++,
          kind: isBomb ? "bomb" : "nut",
          x: 8 + Math.random() * 84,
          y: -18,
          speed: 2.2 + Math.random() * 1.8 + scoreRef.current * 0.012,
          emoji: isBomb ? BOMB_EMOJI : nut.emoji,
          points: isBomb ? 0 : nut.points
        });
      }

      const basketPx = (basketRef.current / 100) * width;
      let caughtPoints = 0;
      let droppedNuts = 0;
      let bombHit = false;
      const newBursts = [];

      const surviving = [];
      for (let i = 0; i < objs.length; i++) {
        const item = objs[i];
        const itemPx = (item.x / 100) * width;
        const isCaught = item.y > height - 100 && item.y < height - 36 && Math.abs(itemPx - basketPx) < 56;
        const isDropped = item.y > height - 12;

        if (isCaught) {
          if (item.kind === "bomb") {
            bombHit = true;
            newBursts.push({ id: nextBurstRef.current++, x: item.x, y: item.y, text: "💥 INSTA-KILL" });
          } else {
            caughtPoints += item.points;
            const burstText = item.points === 3 ? "+3 🥥" : item.points === 2 ? "+2 🌰" : "+1 🌰";
            newBursts.push({ id: nextBurstRef.current++, x: item.x, y: item.y, text: burstText });
          }
          continue;
        }

        if (isDropped) {
          if (item.kind === "nut") droppedNuts++;
          continue;
        }

        surviving.push(item);
      }

      objectsRef.current = surviving;

      if (newBursts.length > 0) {
        burstsRef.current = [...burstsRef.current, ...newBursts].slice(-12);
        const burstIds = newBursts.map(b => b.id);
        setTimeout(() => {
          burstsRef.current = burstsRef.current.filter(b => !burstIds.includes(b.id));
        }, 650);
      }

      if (caughtPoints > 0) {
        scoreRef.current += caughtPoints;
        setScore(scoreRef.current);
      }

      if (bombHit) {
        endGame("💣 You caught a bomb. Instant liquidation.");
        setTick(t => t + 1);
        return;
      }

      if (droppedNuts > 0) {
        missesRef.current += droppedNuts;
        setMisses(missesRef.current);
        if (missesRef.current >= MAX_MISSES) {
          endGame("🕳️ Too many missed nuts. Harvest collapsed.");
          setTick(t => t + 1);
          return;
        }
      }

      setTick(t => t + 1);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [mode, endGame]);

  useEffect(() => {
    if (mode !== "over") return;
    const best = Math.max(highScore, scoreRef.current);
    setHighScore(best);
    try { window.localStorage.setItem("nut-catcher-high-score", String(best)); } catch (e) {}

    fetch("/api/score", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ score: scoreRef.current, misses: missesRef.current })
    })
      .then(res => res.json())
      .then(data => setServerTitle(data.title || "🌰 Harvest logged"))
      .catch(() => setServerTitle("🌰 Local harvest logged"));
  }, [mode]);

  function moveBasket(e) {
    if (modeRef.current !== "playing") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setBasketX(clamp(x, 8, 92));
  }

  const objects = objectsRef.current;
  const bursts = burstsRef.current;

  const s = {
    shell: { minHeight: "calc(100vh - 140px)", display: "grid", placeItems: "center", padding: "18px 8px" },
    card: {
      width: "min(94vw, 540px)",
      borderRadius: 30,
      padding: 16,
      background: "rgba(255, 248, 220, 0.9)",
      boxShadow: "0 24px 80px rgba(50, 24, 2, 0.35)",
      border: "3px solid rgba(76, 42, 10, 0.35)"
    },
    brand: {
      width: "fit-content",
      margin: "0 auto 10px",
      padding: "8px 14px",
      borderRadius: 999,
      background: "rgba(77, 43, 9, 0.12)",
      border: "2px solid rgba(77, 43, 9, 0.22)",
      fontWeight: 950,
      letterSpacing: 1.3,
      fontSize: 18
    },
    topbar: { display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", fontWeight: 850, marginBottom: 12 },
    gameArea: {
      position: "relative",
      height: "min(72vh, 575px)",
      overflow: "hidden",
      borderRadius: 24,
      background: "linear-gradient(#ffeaa8 0%, #ffd171 48%, #c97728 77%, #764018 100%)",
      border: "3px solid rgba(60, 31, 4, 0.42)",
      touchAction: "none",
      userSelect: "none",
      cursor: "pointer"
    },
    overlay: {
      position: "absolute",
      inset: 0,
      zIndex: 10,
      display: "grid",
      placeContent: "center",
      justifyItems: "center",
      textAlign: "center",
      padding: 28,
      background: "rgba(255, 245, 203, 0.86)",
      backdropFilter: "blur(5px)"
    },
    logo: { fontSize: 76, lineHeight: 1 },
    title: { fontSize: 44, margin: "12px 0 6px", letterSpacing: -1.2 },
    copy: { fontSize: 18, margin: "6px 0", maxWidth: 350 },
    hint: { fontSize: 14, opacity: 0.72, marginTop: 16 },
    button: {
      marginTop: 18,
      border: 0,
      borderRadius: 999,
      padding: "14px 23px",
      cursor: "pointer",
      background: "#3b2109",
      color: "#fff8da",
      fontWeight: 900,
      boxShadow: "0 10px 0 #8d5a18",
      transform: "translateY(-3px)"
    },
    sun: { position: "absolute", top: 24, right: 30, fontSize: 34, opacity: 0.92 },
    cloudOne: { position: "absolute", top: 48, left: 30, fontSize: 34, opacity: 0.72 },
    cloudTwo: { position: "absolute", top: 86, right: 86, fontSize: 29, opacity: 0.64 },
    treeLeft: { position: "absolute", bottom: 26, left: 12, fontSize: 42, opacity: 0.78 },
    treeRight: { position: "absolute", bottom: 28, right: 12, fontSize: 42, opacity: 0.78 },
    warning: {
      position: "absolute", top: 12, left: 12, zIndex: 4,
      padding: "6px 10px", borderRadius: 999,
      background: "rgba(70, 18, 18, 0.15)",
      border: "2px solid rgba(70, 18, 18, 0.2)",
      fontWeight: 900
    },
    object: {
      position: "absolute", zIndex: 3,
      transform: "translate(-50%, -50%)",
      fontSize: 36,
      filter: "drop-shadow(0 7px 8px rgba(65, 30, 4, 0.25))"
    },
    burst: {
      position: "absolute", zIndex: 6,
      transform: "translate(-50%, -50%)",
      fontSize: 22, fontWeight: 950, pointerEvents: "none",
      animation: "pop 650ms ease-out forwards",
      textShadow: "0 2px 0 rgba(255,255,255,0.75)"
    },
    basket: {
      position: "absolute", zIndex: 5, bottom: 34,
      transform: "translateX(-50%)",
      fontSize: 62,
      filter: "drop-shadow(0 10px 10px rgba(48, 21, 2, 0.35))"
    },
    ground: {
      position: "absolute", left: 0, right: 0, bottom: 0, height: 36,
      display: "grid", placeItems: "center", fontSize: 22,
      background: "rgba(64, 35, 11, 0.28)"
    }
  };

  return (
    <Layout>
      <Head>
        <title>🌰 Nut Catcher | BASED NUT</title>
        <meta name="description" content="Catch falling nuts in a basket. Avoid bombs. An experimental memefi mini-game from the BASED NUT orchard." />
      </Head>
      <style>{`
        @keyframes pop {
          0% { opacity: 0; transform: translate(-50%, -20%) scale(0.7); }
          20% { opacity: 1; transform: translate(-50%, -65%) scale(1.08); }
          100% { opacity: 0; transform: translate(-50%, -145%) scale(1); }
        }
        button:active { transform: translateY(1px) !important; box-shadow: 0 5px 0 #8d5a18 !important; }
      `}</style>
      <main style={s.shell}>
        <section style={s.card}>
          <div style={s.brand}>BASED NUT 🌰</div>

          <div style={s.topbar}>
            <span>🌰 Score {score}</span>
            <span>🕳️ Misses {misses}/{MAX_MISSES}</span>
            <span>🏆 Best {highScore}</span>
          </div>

          <div ref={gameRef} onPointerMove={moveBasket} onPointerDown={moveBasket} style={s.gameArea}>
            <div style={s.sun}>☀️</div>
            <div style={s.cloudOne}>☁️</div>
            <div style={s.cloudTwo}>☁️</div>
            <div style={s.treeLeft}>🌳</div>
            <div style={s.treeRight}>🌲</div>
            <div style={s.warning}>💣 Avoid bombs</div>

            {mode === "splash" && (
              <div style={s.overlay}>
                <div style={s.logo}>🌰🧺💣</div>
                <h1 style={s.title}>Nut Catcher</h1>
                <p style={s.copy}>Catch the falling nuts. Miss 5 and the harvest collapses.</p>
                <p style={s.copy}><strong>Do not catch 💣. One bomb instantly ends the run.</strong></p>
                <button onClick={startGame} style={s.button}>🌰 Start Harvest</button>
                <p style={s.hint}>Mouse, touch, A/D, or ← →</p>
              </div>
            )}

            {mode === "over" && (
              <div style={s.overlay}>
                <div style={s.logo}>🧺💥💣</div>
                <h1 style={s.title}>Basket Liquidated</h1>
                <p style={s.copy}>{gameOverMessage}</p>
                <p style={s.copy}>{serverTitle}</p>
                <p style={s.copy}>Final score: <strong>{score}</strong></p>
                <button onClick={startGame} style={s.button}>🔁 Nut Again</button>
              </div>
            )}

            {objects.map((item) => (
              <span key={item.id} style={{ ...s.object, left: `${item.x}%`, top: `${item.y}px` }}>
                {item.emoji}
              </span>
            ))}

            {bursts.map((burst) => (
              <span key={burst.id} style={{ ...s.burst, left: `${burst.x}%`, top: `${burst.y}px` }}>
                {burst.text}
              </span>
            ))}

            <div style={{ ...s.basket, left: `${basketX}%` }}>🧺</div>
            <div style={s.ground}>🌱 🌿 🌱 🌿 🌱 🌿 🌱</div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

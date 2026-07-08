import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';

const placeholderImage = '/img/peanutoshi.png'; // Corrected placeholder image path

// InlineImage component with fallback logic
const InlineImage = ({ src, alt, style }) => {
  return (
    <img
      src={src}
      alt={alt}
      style={style}
      onError={(e) => {
        e.target.src = placeholderImage; // Fallback to placeholder image
        e.target.onerror = null; // Prevent infinite loop
      }}
    />
  );
};

const heroImages = [
  '/img/carousel/0.png',
  '/img/carousel/1.png',
  '/img/carousel/2.png',
  '/img/carousel/3.png'
]; // Use direct public paths

const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 3000); // Change slide every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        overflow: 'hidden',
        width: '100%',
        // Removed maxHeight to show full banner images
        position: 'relative',
        textAlign: 'center',
      }}
    >
      <img
        src={heroImages[currentIndex]}
        alt={`Slide ${currentIndex + 1}`}
        style={{
          width: '100%',
          height: 'auto',          // Adjusts height based on image aspect ratio
          objectFit: 'contain',    // Ensures full image is visible without cropping
          display: 'block',
        }}
      />
    </div>
  );
};

const peanutColor = '#FDE8B1'; // Light brown for peanuts
const almondColor = '#D4A373'; // Dark brown (almost red) for almonds

const NFT_CONTRACTS = {
  PNUTRMY: '0xF075300b8C2EF500d8Ce4f783F910C500B9A3512',
  PNUTS: '0x794fcD89357C1CcF04a1a9A441ad4dB2Cd5EE387',
  SALMD: '0x1E0f80529593185C021043ffcbfDcB8f4279C649',
  ALMD: '0x1A160456005AED47994E1c13C9bc31F274413927',
};

const NFT_MAX_SUPPLY = {
  PNUTRMY: 10000,
  PNUTS: 1000,
  SALMD: 10000,
  ALMD: 1000,
};

const GreatNutWar = () => {
  const [nftSupplies, setNftSupplies] = useState({
    PNUTRMY: null,
    PNUTS: null,
    SALMD: null,
    ALMD: null,
  });

  useEffect(() => {
    const rpcs = [
      'https://mainnet.base.org',
      'https://base.publicnode.com',
    ];
    const sig = '0x18160ddd'; // totalSupply()

    const fetchSupply = async (addr, retryCount = 0) => {
      const rpc = rpcs[retryCount % rpcs.length];
      try {
        const res = await fetch(rpc, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{ to: addr, data: sig }, 'latest'],
            id: 1,
          }),
        });
        if (res.status === 429 && retryCount < 3) {
          await new Promise(r => setTimeout(r, 500 * (retryCount + 1)));
          return fetchSupply(addr, retryCount + 1);
        }
        const json = await res.json();
        const supply = json.result ? parseInt(json.result, 16) : null;
        return (supply != null && !isNaN(supply)) ? supply : null;
      } catch {
        if (retryCount < 3) {
          await new Promise(r => setTimeout(r, 500 * (retryCount + 1)));
          return fetchSupply(addr, retryCount + 1);
        }
        return null;
      }
    };

    // Stagger calls to avoid rate limiting
    (async () => {
      const entries = Object.entries(NFT_CONTRACTS);
      const supplies = {};
      for (let i = 0; i < entries.length; i++) {
        const [name, addr] = entries[i];
        supplies[name] = await fetchSupply(addr);
        setNftSupplies({ ...supplies }); // Update progressively as each loads
        if (i < entries.length - 1) await new Promise(r => setTimeout(r, 200));
      }
    })();
  }, []);

  const fmtSupply = (key) => {
    const s = nftSupplies[key];
    if (s === null || s === undefined || isNaN(s)) return '...';
    return s.toLocaleString();
  };

  const hasSupply = (key) => {
    const s = nftSupplies[key];
    return s != null && !isNaN(s);
  };

  return (
    <Layout>
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F3ED', fontFamily: 'Arial, sans-serif' }}>
        <Head>
          <title>Great Nut War | BASED NUT</title>
          <meta name="description" content="Peanut Legion vs Almond Order — explore the lore and join the factions." />
        </Head>

        {/* Hero Carousel */}
        <HeroCarousel />

      {/* Main Content */}
  <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '8rem 1.5rem 2rem' }}>
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(5px)',
            borderRadius: '1rem',
            border: '2px solid rgba(205,127,50,0.2)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            padding: '3rem',
            overflow: 'hidden', // Prevent content overflow
          }}
        >
          {/* Army Factions */}
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#5D4037', textAlign: 'center', marginBottom: '2rem' }}>
            Army Factions
          </h2>
          <div className="factions-grid">
            {/* Peanut Legion */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  background: `linear-gradient(to bottom right, ${peanutColor}, #FFF7E0)`,
                  borderRadius: '1rem',
                  border: '2px solid rgba(205,127,50,0.3)',
                  boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
                  padding: '2rem',
                  boxSizing: 'border-box',
                }}
              >
                <InlineImage
                  src="/img/legion.png"
                  alt="Peanut Legion"
                  style={{ width: '100%', borderRadius: '1rem', marginBottom: '1rem' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      width: '5rem',
                      height: '5rem',
                      backgroundColor: '#CD7F32',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1.5rem',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>🥜</span>
                  </div>
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#5D4037', marginBottom: '0.5rem' }}>
                  Peanut Legion
                  <span
                    style={{
                      marginLeft: '0.75rem',
                      fontSize: '1rem',
                      backgroundColor: '#CD7F32',
                      color: '#fff',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                    }}
                  >
                    {hasSupply('PNUTRMY') && hasSupply('PNUTS') ? (nftSupplies.PNUTRMY + nftSupplies.PNUTS).toLocaleString() : '...'} Recruits
                  </span>
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)' }}>🌰 {hasSupply('PNUTRMY') ? `${((nftSupplies.PNUTRMY / NFT_MAX_SUPPLY.PNUTRMY) * 100).toFixed(1)}% Minted` : '...'}</span>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#5D4037' }}>Army Composition</span>
                  <ul style={{ margin: '0.5rem 0 0 1.25rem', color: 'rgba(93,64,55,0.9)' }}>
                    <li>Peanut Soldiers: {fmtSupply('PNUTRMY')}</li>
                    <li>Peanut Generals: {fmtSupply('PNUTS')}</li>
                  </ul>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <a
                    href="#peanut-soldiers"
                    className="button-effect"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem 1.5rem',
                      backgroundColor: '#CD7F32',
                      color: '#fff',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                    }}
                  >
                    <span style={{ fontSize: '1.125rem' }}>Enlist as Soldier</span>
                  </a>
                  <a
                    href="#peanut-generals"
                    className="button-effect"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem 1.5rem',
                      backgroundColor: '#8B4513',
                      color: '#fff',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                    }}
                  >
                    <span style={{ fontSize: '1.125rem' }}>Lead as General</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Almond Order */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  background: `linear-gradient(to bottom right, ${almondColor}, #FFF7E0)`,
                  borderRadius: '1rem',
                  border: '2px solid rgba(205,127,50,0.3)',
                  boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
                  padding: '2rem',
                  boxSizing: 'border-box',
                }}
              >
                <InlineImage
                  src="/img/order.png"
                  alt="Almond Order"
                  style={{ width: '100%', borderRadius: '1rem', marginBottom: '1rem' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      width: '5rem',
                      height: '5rem',
                      backgroundColor: '#B47E5B',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1.5rem',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>🌰</span>
                  </div>
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#5D4037', marginBottom: '0.5rem' }}>
                  Almond Order
                  <span
                    style={{
                      marginLeft: '0.75rem',
                      fontSize: '1rem',
                      backgroundColor: '#B47E5B',
                      color: '#fff',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                    }}
                  >
                    {hasSupply('SALMD') && hasSupply('ALMD') ? (nftSupplies.SALMD + nftSupplies.ALMD).toLocaleString() : '...'} Recruits
                  </span>
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)' }}>🌰 {hasSupply('SALMD') ? `${((nftSupplies.SALMD / NFT_MAX_SUPPLY.SALMD) * 100).toFixed(1)}% Minted` : '...'}</span>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#5D4037' }}>Army Composition</span>
                  <ul style={{ margin: '0.5rem 0 0 1.25rem', color: 'rgba(93,64,55,0.9)' }}>
                    <li>Almond Soldiers: {fmtSupply('SALMD')}</li>
                    <li>Almond Generals: {fmtSupply('ALMD')}</li>
                  </ul>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <a
                    href="#almond-soldiers"
                    className="button-effect"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem 1.5rem',
                      backgroundColor: '#B47E5B',
                      color: '#fff',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                    }}
                  >
                    <span style={{ fontSize: '1.125rem' }}>Join as Soldier</span>
                  </a>
                  <a
                    href="#almond-generals"
                    className="button-effect"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem 1.5rem',
                      backgroundColor: '#6A4F4B',
                      color: '#fff',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                    }}
                  >
                    <span style={{ fontSize: '1.125rem' }}>Command as General</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* NFTs - moved up */}
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#5D4037', textAlign: 'center', marginBottom: '2rem' }}>
            Army Ranks NFTs
          </h2>
          <div className="nft-stats-grid">
            <section id="peanut-soldiers">
              <div
                style={{
                  background: `linear-gradient(to bottom, ${peanutColor}, #FFF7E0)`,
                  padding: '2rem',
                  borderRadius: '1rem',
                  border: '2px solid rgba(205,127,50,0.3)',
                  boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
                }}
              >
                <InlineImage
                  src="/img/pnutarmy.png"
                  alt="Peanut Soldiers"
                  style={{ width: '100%', borderRadius: '1rem', marginBottom: '1rem' }}
                />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#5D4037' }}>Peanut Soldiers</h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)', marginBottom: '1rem' }}>
                  Minted: {fmtSupply('PNUTRMY')} / {NFT_MAX_SUPPLY.PNUTRMY.toLocaleString()} max<br />
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <a
                    href="https://mint.club/nft/base/PNUTRMY"
                    className="button-effect"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#CD7F32',
                      color: '#fff',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      flex: 1,
                      textAlign: 'center',
                    }}
                  >
                    Mint Club
                  </a>
                  <a
                    href="https://sudoswap.xyz/#/manage/base/0xF075300b8C2EF500d8Ce4f783F910C500B9A3512"
                    className="button-effect"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#8B4513',
                      color: '#fff',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      flex: 1,
                      textAlign: 'center',
                    }}
                  >
                    Sudoswap
                  </a>
                </div>
              </div>
            </section>
            <section id="peanut-generals">
              <div
                style={{
                  background: `linear-gradient(to bottom, ${peanutColor}, #FFF7E0)`,
                  padding: '2rem',
                  borderRadius: '1rem',
                  border: '2px solid rgba(205,127,50,0.3)',
                  boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
                }}
              >
                <InlineImage
                  src="/img/pnutgeneral.png"
                  alt="Peanut Generals"
                  style={{ width: '100%', borderRadius: '1rem', marginBottom: '1rem' }}
                />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#5D4037' }}>Peanut Generals</h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)', marginBottom: '1rem' }}>
                  Minted: {fmtSupply('PNUTS')} / {NFT_MAX_SUPPLY.PNUTS.toLocaleString()} max<br />
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <a
                    href="https://mint.club/nft/base/PNUTS"
                    className="button-effect"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#CD7F32',
                      color: '#fff',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      flex: 1,
                      textAlign: 'center',
                    }}
                  >
                    Mint Club
                  </a>
                  <a
                    href="https://sudoswap.xyz/#/manage/base/0x794fcD89357C1CcF04a1a9A441ad4dB2Cd5EE387"
                    className="button-effect"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#8B4513',
                      color: '#fff',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      flex: 1,
                      textAlign: 'center',
                    }}
                  >
                    Sudoswap
                  </a>
                </div>
              </div>
            </section>
            <section id="almond-soldiers">
              <div
                style={{
                  background: `linear-gradient(to bottom, ${almondColor}, #FFF7E0)`,
                  padding: '2rem',
                  borderRadius: '1rem',
                  border: '2px solid rgba(205,127,50,0.3)',
                  boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
                }}
              >
                <InlineImage
                  src="/img/almondarmy.png"
                  alt="Almond Soldiers"
                  style={{ width: '100%', borderRadius: '1rem', marginBottom: '1rem' }}
                />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#5D4037' }}>Almond Soldiers</h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)', marginBottom: '1rem' }}>
                  Minted: {fmtSupply('SALMD')} / {NFT_MAX_SUPPLY.SALMD.toLocaleString()} max<br />
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <a
                    href="https://mint.club/nft/base/SALMD"
                    className="button-effect"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#B47E5B',
                      color: '#fff',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      flex: 1,
                      textAlign: 'center',
                    }}
                  >
                    Mint Club
                  </a>
                  <a
                    href="https://sudoswap.xyz/#/manage/base/0x1E0f80529593185C021043ffcbfDcB8f4279C649"
                    className="button-effect"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#6A4F4B',
                      color: '#fff',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      flex: 1,
                      textAlign: 'center',
                    }}
                  >
                    Sudoswap
                  </a>
                </div>
              </div>
            </section>
            <section id="almond-generals">
              <div
                style={{
                  background: `linear-gradient(to bottom, ${almondColor}, #FFF7E0)`,
                  padding: '2rem',
                  borderRadius: '1rem',
                  border: '2px solid rgba(205,127,50,0.3)',
                  boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
                }}
              >
                <InlineImage
                  src="/img/almondgeneral.png"
                  alt="Almond Generals"
                  style={{ width: '100%', borderRadius: '1rem', marginBottom: '1rem' }}
                />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#5D4037' }}>Almond Generals</h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)', marginBottom: '1rem' }}>
                  Minted: {fmtSupply('ALMD')} / {NFT_MAX_SUPPLY.ALMD.toLocaleString()} max<br />
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <a
                    href="https://mint.club/nft/base/ALMD"
                    className="button-effect"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#B47E5B',
                      color: '#fff',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      flex: 1,
                      textAlign: 'center',
                    }}
                  >
                    Mint Club
                  </a>
                  <a
                    href="https://sudoswap.xyz/#/manage/base/0x1A160456005AED47994E1c13C9bc31F274413927"
                    className="button-effect"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#6A4F4B',
                      color: '#fff',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      flex: 1,
                      textAlign: 'center',
                    }}
                  >
                    Sudoswap
                  </a>
                </div>
              </div>
            </section>
          </div>
          {/* Staking & Vault section removed — content moved to /staking page */}

          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#5D4037', marginBottom: '1rem' }}>
              I WANT YOU… TO LOCK YOUR NUTS
            </h3>
            <p style={{ fontSize: '1rem', color: '#5D4037', marginBottom: '2rem' }}>
              Join the war effort. Mint. Stake. Meme. Get roasted.
            </p>
            <div
              className="propaganda-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '2rem',
                justifyItems: 'center',
                alignItems: 'start',
              }}
            >
              {/* Poster 1 */}
              <div>
                <InlineImage
                  src="/img/unclesam/0.png"
                  alt="Furious Uncle Nut"
                  style={{ width: '100%', borderRadius: '1rem', marginBottom: '1rem' }}
                />
                <p style={{ fontSize: '1rem', color: '#5D4037', fontWeight: 'bold' }}>
                  “Only YOU can prevent inflationary memes.”
                </p>
              </div>

              {/* Poster 2 */}
              <div>
                <InlineImage
                  src="/img/unclesam/1.png"
                  alt="Uncle Nut Wartime"
                  style={{ width: '100%', borderRadius: '1rem', marginBottom: '1rem' }}
                />
                <p style={{ fontSize: '1rem', color: '#5D4037', fontWeight: 'bold' }}>
                  “Decentralize. Deflate. Dominate.”
                </p>
              </div>

              {/* TOP SECRET block inserted between posters, spanning full width */}
              <div
                style={{
                  gridColumn: '1 / -1',
                  marginTop: '0.5rem',
                  marginBottom: '0.5rem',
                  padding: '2rem',
                  backgroundColor: '#FFF5E0',
                  border: '3px double #8B4513',
                  borderRadius: '0.75rem',
                  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                  fontFamily: 'Courier New, monospace',
                  color: '#5D4037',
                  textAlign: 'center',
                  lineHeight: '1.75',
                }}
              >
                <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                  📄 <strong>TOP SECRET // DNUT-COMM-420 // CLASSIFIED INTEL</strong><br />
                  Under the Great Meme War Accord, Section 69, we are required to inform you that these tokens are NOT financial weapons—they are <strong>weapons of mass distraction</strong>.
                </p>
                <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                  No roadmaps. No promises. Just chaos, dopamine, and shellshock camaraderie.
                </p>
                <p style={{ fontSize: '0.875rem' }}>
                  🥜 <strong>DO NUT LISTEN TO THE NUTMERICAN WAR MACHINE. NUT AT YOUR OWN RISK.</strong><br />
                </p>
                <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                  ⚠️ <strong>WARNING FROM CENTRAL COMMAND:</strong> You are entering a <em>memetic combat zone</em>. All NUT-related deployments fall under “<strong>Operation: VIBES ONLY</strong>.” These digital NUTS hold <strong>zero financial payload</strong>, no tactical utility, and are entirely composed of salty delusions and copium fumes.
                </p>
                <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                  The BASED NUT War Machine is not responsible for lost bags, crushed dreams, or emotional damage. Any perceived value is purely the result of advanced memetic psychological warfare.
                </p>
                <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                  💀 You will NOT buy a lambo. You may lose your keys, your faith in humanity, and your dating prospects.
                </p>
                <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                  All operatives engaging in $NUT, $SNUT, or $pNUT must acknowledge they are doing so under <strong>delirious conditions</strong> and with a complete disregard for sanity, reality, or fiat.
                </p>
                <p style={{ fontSize: '0.875rem', marginBottom: '0' }}>
                  🔒 <strong>DO NOT lock your NUTS expecting profit. LOCK THEM EXPECTING DELUSION.</strong>
                </p>
              </div>

              {/* Poster 3 */}
              <div>
                <InlineImage
                  src="/img/unclesam/2.png"
                  alt="Uncle Nut with Troops"
                  style={{ width: '100%', borderRadius: '1rem', marginBottom: '1rem' }}
                />
                <p style={{ fontSize: '1rem', color: '#5D4037', fontWeight: 'bold' }}>
                  “Real nuts lock, and stay hungry. The rest sell tops and cry.”
                </p>
              </div>

              {/* Poster 4 */}
              <div>
                <InlineImage
                  src="/img/unclesam/3.png"
                  alt="Uncle Nut Extra"
                  style={{ width: '100%', borderRadius: '1rem', marginBottom: '1rem' }}
                />
                <p style={{ fontSize: '1rem', color: '#5D4037', fontWeight: 'bold' }}>
                  “If you ain't with us... you ain't nuts enough.”
                </p>
              </div>
            </div>
            <p style={{ marginTop: '2rem', fontStyle: 'italic', color: 'rgba(93,64,55,0.9)' }}>
            “In a world gone sane, only the nuts make sense.”            </p>
          </div>
        </div>
      </div>

  {/* Footer via Layout */}

      <style jsx>{`
        .button-effect {
          transition: background 0.3s ease, transform 0.3s ease;
          text-align: center;
          box-sizing: border-box;
        }
        .button-effect:hover {
          transform: translateY(-2px);
          animation: wiggle 0.4s ease-in-out;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(3deg); }
          40% { transform: rotate(-3deg); }
          60% { transform: rotate(2deg); }
          80% { transform: rotate(-2deg); }
        }

        .factions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 3rem;
          margin-bottom: 5rem;
        }

        .nft-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          margin-bottom: 3rem;
        }

        @media (max-width: 768px) {
          .factions-grid,
          .nft-stats-grid {
            grid-template-columns: 1fr;
          }
          .factions-grid > div,
          .nft-stats-grid > div {
            width: 100%;
          }
          .button-effect {
            width: 100%;
          }
        }
      `}</style>
    </div>
  </Layout>
  );
};

export default GreatNutWar;

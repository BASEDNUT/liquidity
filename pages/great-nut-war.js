import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

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

const GreatNutWar = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F3ED', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <Header />

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
          {/* Armies */}
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#5D4037', textAlign: 'center', marginBottom: '2rem' }}>
            Armies
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
                  boxSizing: 'border-box', // Include padding in width calculations
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
                  <div>
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
                        5,263 Recruits
                      </span>
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)' }}>🥇 Leading Salt Production</span>
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#5D4037' }}>Army Composition</span>
                  <ul style={{ margin: '0.5rem 0 0 1.25rem', color: 'rgba(93,64,55,0.9)' }}>
                    <li>Peanut Soldiers: 5,012</li>
                    <li>Peanut Generals: 251</li>
                  </ul>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <a
                    href="#peanut-soldiers" // Link to Peanut Soldiers NFT section
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
                    href="#peanut-generals" // Link to Peanut Generals NFT section
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
                  boxSizing: 'border-box', // Include padding in width calculations
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
                  <div>
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
                        6,661 Recruits
                      </span>
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)' }}>🏆 Most Honey Reserves</span>
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#5D4037' }}>Army Composition</span>
                  <ul style={{ margin: '0.5rem 0 0 1.25rem', color: 'rgba(93,64,55,0.9)' }}>
                    <li>Almond Soldiers: 6,237</li>
                    <li>Almond Generals: 424</li>
                  </ul>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <a
                    href="#almond-soldiers" // Link to Almond Soldiers NFT section
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
                    href="#almond-generals" // Link to Almond Generals NFT section
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

          {/* For Salt Tokens */}
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#5D4037', textAlign: 'center', marginBottom: '2rem' }}>
            For Salt Tokens
          </h2>
          <div className="war-machinery-grid">
            {/* Salt Forge */}
            <div
              style={{
                background: 'linear-gradient(to bottom, rgba(205,127,50,0.05), #fff)',
                padding: '2rem',
                borderRadius: '1rem',
                border: '2px solid rgba(205,127,50,0.2)',
                transition: 'all 0.3s',
                boxSizing: 'border-box',
                overflow: 'hidden',
                wordWrap: 'break-word', // Ensure long text wraps properly
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#5D4037', flex: '1', marginRight: '1rem' }}>
                  Salt Forge
                </h3>
                <div
                  style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundColor: '#CD7F32',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  🌋
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Forge your destiny in the fires of the Great Nut War. Mint SALT to fuel your faction's ambitions and dominate the battlefield. 
                Every contract strengthens your army's resolve.
              </p>
              <a
                href="https://mint.club/token/base/SALT" // changed href from "#"
                className="button-effect"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem 1.5rem',
                  backgroundColor: '#CD7F32',
                  color: '#fff',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  transition: 'background-color 0.3s ease',
                  width: '100%',
                  maxWidth: '300px',
                  margin: '0 auto',
                  textAlign: 'center', // Center-align text
                }}
              >
                <span style={{ fontSize: '1.125rem', textAlign: 'center' }}>Mint Salt</span>
              </a>
            </div>

            {/* NFT Armory */}
            <div
              style={{
                background: 'linear-gradient(to bottom, rgba(180,126,91,0.1), #fff)',
                padding: '2rem',
                borderRadius: '1rem',
                border: '2px solid rgba(205,127,50,0.3)',
                boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
                transition: 'all 0.3s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#5D4037' }}>NUT Nested NFTs</h3>
                <div
                  style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundColor: '#B47E5B',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '1.5rem',
                  }}
                >
                  🛡️
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Collect NFTs to have a chance at Spoils of War. From Footsoldier to General your NFT rank determines spoils division.
              </p>
              <a
                href="https://mint.club/nut" // changed href from "#"
                className="button-effect"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#B47E5B',
                  color: '#fff',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                }}
              >
                View Nested Collections
                <svg style={{ width: '1.25rem', height: '1.25rem', marginLeft: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
            </div>

            {/* Volcanic Vault */}
            <div
              style={{
                background: 'linear-gradient(to bottom, #FFEBEE, #fff)',
                padding: '2rem',
                borderRadius: '1rem',
                border: '2px solid rgba(205,127,50,0.3)',
                boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
                transition: 'all 0.3s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#5D4037' }}>Molten Salt Vault</h3>
                <div
                  style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundColor: '#B71C1C',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '1.5rem',
                  }}
                >
                  🏰
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(93,64,55,0.9)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Stake SALT in our molten core to generate strategic reserves.
              </p>
              <a
                href="#"
                className="button-effect"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#B71C1C',
                  color: '#fff',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                }}
              >
                Enter Salt Vault
                <svg style={{ width: '1.25rem', height: '1.25rem', marginLeft: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* NFTs */}
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#5D4037', textAlign: 'center', marginBottom: '2rem' }}>
            NFTs
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
                  Total NFTs: 10,000<br />
                  Average Saltiness: 10x
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
                    href="https://sudoswap.xyz/#/manage/base/0x04dbBc85E27DF12970dD62973e83a01FCd6aa8FD"
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
                  Total NFTs: 1,000<br />
                  Average Saltiness: 100x
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
                    href="https://sudoswap.xyz/#/manage/base/0x262bEaa785a0eF65f5D9C1b8BA5c41980D087ff3"
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
                  Total NFTs: 10,000<br />
                  Average Saltiness: 10x
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
                    href="https://sudoswap.xyz/#/manage/base/0xeE7243F0E02e5890c6415B5CbAe58e0D0fb758a5"
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
                  Total NFTs: 1,000<br />
                  Average Saltiness: 100x
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
                    href="https://sudoswap.xyz/#/manage/base/0x308C9BC0546723d6e4905c971cd34feBF1f94031"
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
          
          {/* REMOVE the "Growth Comparison" block */}
          <div
            style={{
              marginTop: '4rem',
              marginBottom: '4rem',
              padding: '2rem',
              backgroundColor: '#FFF5E0',
              border: '3px double #8B4513',
              borderRadius: '0.75rem',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              maxWidth: '900px',
              marginLeft: 'auto',
              marginRight: 'auto',
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
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
              🔒 <strong>DO NOT lock your NUTS expecting profit. LOCK THEM EXPECTING DELUSION.</strong>
            </p>
            
          </div>

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
                justifyItems: 'center' 
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

      {/* Footer */}
      <Footer />

      <style jsx>{`
        .button-effect {
          transition: background 0.3s ease, transform 0.3s ease;
          width: 100%; /* Ensure buttons take full width on smaller screens */
          max-width: 300px; /* Limit button width */
          margin: 0 auto; /* Center buttons */
          text-align: center; /* Center text */
          box-sizing: border-box; /* Include padding in width */
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

        .war-machinery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-bottom: 6rem;
        }

        .nft-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          margin-bottom: 3rem;
        }

        @media (max-width: 768px) {
          .factions-grid,
          .war-machinery-grid,
          .nft-stats-grid {
            grid-template-columns: 1fr; /* Single column layout for smaller screens */
          }
          .factions-grid > div,
          .war-machinery-grid > div,
          .nft-stats-grid > div {
            width: 100%; /* Ensure full width on smaller screens */
          }
          .button-effect {
            width: 100%; /* Full width for buttons */
          }
        }

        /* Ensure text wraps properly */
        .war-machinery-grid div {
          overflow-wrap: break-word;
          word-wrap: break-word;
        }
      `}</style>
    </div>
  );
};

export default GreatNutWar;

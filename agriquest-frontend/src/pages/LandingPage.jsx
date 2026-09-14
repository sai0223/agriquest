import { useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../context/AuthContext';
import AgriWorldCanvas from '../components/AgriWorldCanvas';

gsap.registerPlugin(ScrollTrigger);

const SIGNALS = [
  ['01', 'SOIL ORGANIC CARBON', '3.8%', 'Rising'],
  ['02', 'WATER USE EFFICIENCY', '1.42 kg/m³', 'This cycle'],
  ['03', 'POLLINATOR ACTIVITY', '+31%', 'Since planting'],
  ['04', 'NITROGEN BALANCE', '+18 kg/ha', 'In range'],
  ['05', 'CROP VIGOR INDEX', '0.91', 'Healthy'],
  ['06', 'WATER SAVED', '32L', 'This cycle'],
  ['07', 'CARBON STORED', '0.82 t/ha', 'Season total'],
  ['08', 'RAINFALL CAPTURED', '612 mm', 'Field network'],
];

const STEPS = [
  ['01', 'Choose a crop', 'Start with a living field and a clear goal.'],
  ['02', 'Make the call', 'Shape the season with every decision.'],
  ['03', 'Read the result', 'See the consequence. Keep the knowledge.'],
];

function MetricTicker() {
  const trackRef = useRef(null);
  const viewportRef = useRef(null);
  const position = useRef(0);
  const velocity = useRef(-0.32);
  const drag = useRef({ active: false, x: 0 });

  useEffect(() => {
    let frameId;
    let halfWidth = 0;

    const measure = () => {
      halfWidth = (trackRef.current?.scrollWidth || 0) / 2;
    };
    const wrap = () => {
      if (!halfWidth) return;
      if (position.current <= -halfWidth) position.current += halfWidth;
      if (position.current >= 0) position.current -= halfWidth;
    };
    const animate = () => {
      if (!drag.current.active) {
        velocity.current = velocity.current * 0.985 + (-0.32 * 0.015);
        position.current += velocity.current;
      }
      wrap();
      if (trackRef.current) trackRef.current.style.transform = `translate3d(${position.current}px, 0, 0)`;
      frameId = requestAnimationFrame(animate);
    };

    measure();
    window.addEventListener('resize', measure);
    frameId = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('resize', measure);
      cancelAnimationFrame(frameId);
    };
  }, []);

  const handlePointerDown = (event) => {
    drag.current = { active: true, x: event.clientX };
    velocity.current = 0;
    viewportRef.current?.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!drag.current.active) return;
    const delta = event.clientX - drag.current.x;
    position.current += delta;
    velocity.current = delta;
    drag.current.x = event.clientX;
  };

  const stopDragging = (event) => {
    drag.current.active = false;
    viewportRef.current?.releasePointerCapture?.(event.pointerId);
  };

  return (
    <section
      className="signal-ticker"
      ref={viewportRef}
      aria-label="Field analytics"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
    >
      <div className="signal-track" ref={trackRef}>
        {[...SIGNALS, ...SIGNALS].map(([number, label, value, note], index) => (
          <div className="signal-item" key={`${label}-${index}`}>
            <span className="signal-number">{number}</span>
            <span className="signal-label">{label}</span>
            <strong>{value}</strong>
            <small>{note}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const pageRef = useRef(null);
  const heroRef = useRef(null);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.from('.home-reveal', {
        y: 38,
        opacity: 0,
        duration: 1.1,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.15,
      });
      gsap.from('.world-frame', {
        opacity: 0,
        scale: 0.86,
        rotate: -3,
        duration: 1.5,
        ease: 'power4.out',
      });
      gsap.from('.step-card', {
        y: 45,
        opacity: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.steps-grid',
          start: 'top 78%',
        },
      });
      gsap.to('.field-word', {
        yPercent: -18,
        ease: 'none',
        scrollTrigger: {
          trigger: '.field-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, pageRef);

    return () => context.revert();
  }, []);

  const dashboardPath = user?.role === 'FARMER' ? '/farmer/dashboard' : user?.role === 'TEACHER' ? '/teacher/dashboard' : '/dashboard';

  return (
    <main className="home-page" ref={pageRef}>
      <section className="home-hero" ref={heroRef}>
        <div className="hero-grid-lines" aria-hidden="true" />
        <div className="container home-hero-inner">
          <div className="home-copy">
            <div className="eyebrow home-reveal"><span className="eyebrow-dot" /> THE FIELD IS YOURS</div>
            <h1 className="home-title home-reveal">Grow a future<br /><em>worth cultivating.</em></h1>
            <p className="home-subtitle home-reveal">AgriQuest turns sustainable farming into a living experiment. Make the decision, feel the consequence, and build the instinct that lasts beyond the screen.</p>
            <div className="home-actions home-reveal">
              <Link to={user ? dashboardPath : '/register'} className="btn btn-primary btn-lg">Enter the field <span aria-hidden="true">↗</span></Link>
              <a href="#method" className="text-link">Explore the method <span aria-hidden="true">↓</span></a>
            </div>
            <div className="hero-proof home-reveal"><span className="proof-rule" /> Built for curious minds, future farmers, and a healthier planet.</div>
          </div>
          <div className="world-frame" aria-label="Interactive 3D virtual crop field">
            <div className="world-label world-label--top"><span>LIVE SIMULATION</span><strong>FIELD / 001</strong></div>
            <div className="world-canvas"><AgriWorldCanvas /></div>
            <div className="world-label world-label--bottom"><span>Move your cursor to explore</span><span className="world-status"><i /> ACTIVE</span></div>
            <div className="world-orbit orbit-one" /><div className="world-orbit orbit-two" />
          </div>
        </div>
        <div className="hero-scroll"><span>SCROLL TO CULTIVATE</span><span className="scroll-line" /></div>
      </section>

      <MetricTicker />

      <section className="field-section" id="method">
        <div className="container field-inner">
          <div className="section-marker">01 / THE METHOD</div>
          <div className="field-heading"><h2>Learning should feel<br /><span>alive.</span></h2><div className="field-word" aria-hidden="true">FIELD</div></div>
          <div className="steps-grid">
            {STEPS.map(([number, title, copy]) => <article className="step-card" key={number}><span className="step-number">{number}</span><div><h3>{title}</h3><p>{copy}</p></div><span className="step-arrow">↗</span></article>)}
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div className="container cta-inner"><div><div className="section-marker">02 / YOUR NEXT SEASON</div><h2>Make your first<br /><span>good decision.</span></h2></div><Link to={user ? dashboardPath : '/register'} className="cta-circle">Start<br />now <span>↗</span></Link></div>
      </section>

      <footer className="home-footer"><div className="container footer-inner"><div className="navbar-brand">Agri<span>Quest</span></div><span>Simulation for a more sustainable tomorrow.</span><span>© 2026</span></div></footer>
    </main>
  );
}

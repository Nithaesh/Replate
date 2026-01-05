import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowRight, FaTruck, FaLeaf, FaUtensils, 
  FaShieldAlt, FaCheckCircle, FaClock, FaBoxOpen 
} from 'react-icons/fa';
import './LandingPage.css';

// Internal Component: CountUp Animation
const CountUp = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.5 });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}+</span>;
};

const LandingPage = () => {
  const navigate = useNavigate();
  
  // --- HERO TYPING EFFECT ---
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const words = ["Logistics Problem.", "Coordination Problem.", "Solvable Problem."];

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % words.length;
      const fullText = words[i];
      setText(isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1));
      setTypingSpeed(isDeleting ? 30 : 150);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 1500); 
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };
    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed, words]);

  // --- SCROLL ANIMATION OBSERVER ---
  const revealRefs = useRef([]);
  revealRefs.current = [];
  const addToRefs = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    revealRefs.current.forEach((el) => observer.observe(el));
    return () => revealRefs.current.forEach((el) => observer.unobserve(el));
  }, []);

  return (
    <div className="landing-wrapper">
      
      {/* 1. NAVBAR */}
      <nav className="navbar fade-in-down">
        <div className="logo">REPLATE<span className="dot">.</span></div>
        <div className="nav-menu">
          <button 
            className="nav-text-link" 
            onClick={() => document.getElementById('how-it-works').scrollIntoView({behavior: 'smooth'})}
          >
            How it Works
          </button>
          <button 
            className="nav-login-btn" 
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="hero">
        <div className="hero-glow"></div>
        <div className="hero-content fade-in-up">
          <h1 className="hero-title">
            Hunger is not a supply problem.<br />
            It's a <span className="gradient-text min-h-text">{text}<span className="cursor">|</span></span>
          </h1>
          <p className="hero-desc">
            We use smart logistics to bridge the gap between surplus food and the communities that need it most.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/register')}>
              Donate Food <FaArrowRight />
            </button>
            <button className="btn-secondary" onClick={() => navigate('/register')}>
              Partner as NGO
            </button>
          </div>
        </div>
      </header>

      {/* 3. STATS BANNER */}
      <section className="stats-banner" ref={addToRefs}>
        <div className="stats-container">
          <div className="stat-item floating-slow">
            <span className="stat-huge">40%</span>
            <span className="stat-desc">Food Wasted</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item floating-delayed">
            <span className="stat-huge">190M+</span>
            <span className="stat-desc">Hungry Daily</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item floating-slow">
            <span className="stat-huge">₹92k Cr</span>
            <span className="stat-desc">Annual Loss</span>
          </div>
        </div>
      </section>

      {/* 4. HOW REPLATE WORKS */}
      <section id="how-it-works" className="section-padding" ref={addToRefs}>
        <div className="section-header">
          <h2 className="section-title">How RePlate <span className="highlight-green">Works</span></h2>
        </div>
        
        <div className="workflow-steps">
          {/* Step 1 */}
          <div className="step-card anim-step-1">
            <div className="icon-box"><FaUtensils /></div>
            <h3>Donate</h3>
            <p>List surplus food details in 30 seconds.</p>
          </div>
          <div className="arrow-connector anim-arrow-1">→</div>

          {/* Step 2 */}
          <div className="step-card anim-step-2">
            <div className="icon-box"><FaLeaf /></div>
            <h3>Match</h3>
            <p>AI finds the nearest verified NGO instantly.</p>
          </div>
          <div className="arrow-connector anim-arrow-2">→</div>

          {/* Step 3 */}
          <div className="step-card anim-step-3">
            <div className="icon-box"><FaTruck /></div>
            <h3>Pickup</h3>
            <p>Optimized route for fastest collection.</p>
          </div>
          <div className="arrow-connector anim-arrow-3">→</div>

          {/* Step 4 */}
          <div className="step-card anim-step-4">
            <div className="icon-box"><FaBoxOpen /></div>
            <h3>Deliver</h3>
            <p>Food reaches those in need, safely.</p>
          </div>
        </div>
      </section>

       <div className="section-divider"></div>

      {/* 5. SAFETY SECTION */}
      <section className="section-padding" ref={addToRefs}>
        <div className="safety-grid">
          <div className="safety-text">
            <h2>Safety Isn't <span className="text-red">Optional.</span></h2>
            <p>Trust is our currency. Every donation passes through strict hygiene checkpoints.</p>
            <ul className="trust-list">
              <li><FaCheckCircle className="check-icon" /> <span>Verified NGO Partners (Darpan ID)</span></li>
              <li><FaClock className="check-icon" /> <span>Real-time Freshness Checks</span></li>
              <li><FaShieldAlt className="check-icon" /> <span>Tamper-proof Logistics</span></li>
            </ul>
          </div>
          <div className="safety-image-container glass-effect">
            <img 
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1740&auto=format&fit=crop" 
              alt="Volunteers distributing food" 
              className="safety-img" 
            />
            <div className="img-overlay"></div>
            <div className="verified-badge"><FaCheckCircle /> Verified Partner</div>
          </div>
        </div>
      </section>

      {/* 6. IMPACT COUNTERS */}
      <section className="impact-section" ref={addToRefs}>
        <div className="impact-overlay">
          <h2>Our Impact So Far</h2>
          <div className="counter-grid">
            <div className="counter-item">
              <h3><CountUp end={15000} /></h3>
              <p>Meals Saved</p>
            </div>
            <div className="counter-item">
              <h3><CountUp end={2400} /></h3>
              <p>Pickups Done</p>
            </div>
            <div className="counter-item">
              <h3><CountUp end={120} /></h3>
              <p>NGO Partners</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <footer className="final-cta centered-cta">
        <h2>Be Part of the Solution.</h2>
        <p>Hunger doesn't wait. Neither should we.</p>
        {/* Updated button text and cleaned up classes */}
        <button className="btn-primary" onClick={() => navigate('/register')}>
          Start Donating Now
        </button>
      </footer>
    </div>
  );
};

export default LandingPage;
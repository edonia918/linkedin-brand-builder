import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import './Landing.css'

export function Landing() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleCapture(e: FormEvent) {
    e.preventDefault()
    if (!name || !email) return
    setSubmitted(true)
  }

  return (
    <>
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon">
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2L13 8H17L13.5 11.5L15 17L10 14L5 17L6.5 11.5L3 8H7L10 2Z" fill="white"/>
              </svg>
            </div>
            LaunchBrand
          </Link>
          <ul className="nav-links">
            <li><Link to="/" className="active">Home</Link></li>
            <li><a href="/about.html">About</a></li>
            <li><a href="/how-it-works.html">How It Works</a></li>
            <li><a href="/contact.html">Contact</a></li>
            <li><Link to="/signin" className="nav-cta">Sign In</Link></li>
          </ul>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-content">
              <div className="label">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="6" fill="currentColor"/></svg>
                Join 500+ professionals building their brand
              </div>
              <h1>Stop Burying Your Best Stories. Start Building Your Brand.</h1>
              <p>Your background is a goldmine of stories. We help you extract them, craft them, and share them on LinkedIn in minutes. Perfect for new grads, career changers, and anyone building their professional presence.</p>
              <div className="hero-actions">
                <a href="/how-it-works.html" className="btn btn-primary btn-lg">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5,3 19,12 5,21"/></svg>
                  See How It Works
                </a>
                <Link to="/signin" className="btn btn-secondary btn-lg">Create Your Account</Link>
              </div>
              <div className="hero-stats">
                <div className="hero-stat">
                  <strong>500+</strong>
                  <span>Users Building Brands</span>
                </div>
                <div className="hero-stat">
                  <strong>92%</strong>
                  <span>Love Their Results</span>
                </div>
                <div className="hero-stat">
                  <strong>Real</strong>
                  <span>Stories, Not AI Fluff</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-card-stack">
                <div className="floating-badge floating-badge-1">
                  <div className="dot dot-green"></div>
                  Content Ready
                </div>
                <div className="linkedin-card">
                  <div className="linkedin-card-header">
                    <div className="linkedin-avatar">JD</div>
                    <div className="linkedin-card-header-info">
                      <strong>Jane Doe</strong>
                      <span>Brand Builder at LaunchBrand</span>
                    </div>
                  </div>
                  <p>Your stories are more compelling than you think. Sometimes all you need is the right perspective.</p>
                  <p>That's what we're here for.</p>
                  <div className="linkedin-card-actions">
                    <span>247 Likes</span>
                    <span>58 Comments</span>
                    <span>91 Shares</span>
                  </div>
                </div>
                <div className="floating-badge floating-badge-2">
                  <div className="dot dot-blue"></div>
                  Quality: Authentic
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sign Up CTA */}
      <section className="section" style={{ background: 'var(--bg)', textAlign: 'center', padding: '4rem 0' }}>
        <div className="container">
          <div>
            <h2 style={{ marginBottom: '1rem', fontWeight: 400 }}>Your stories matter. Let's show them off.</h2>
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>In 2 minutes, you'll have a personalized plan to turn your experiences into content that gets noticed by recruiters and your network.</p>
            <Link to="/signin" className="btn btn-primary btn-lg">Create Your Account &rarr;</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="label">Why LaunchBrand</div>
            <h2>Everything you need to go from "What do I even say?" to "Look what I built"</h2>
            <p>Stop staring at a blank page. We handle the structure. You bring your story.</p>
          </div>
          <div className="features-grid">
            <div className="card feature-card">
              <div className="feature-icon feature-icon-blue">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              </div>
              <h3>Story Extraction</h3>
              <p>Your resume is filled with moments you're glossing over. We help you identify the stories that actually matter and frame them in ways your audience cares about.</p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon feature-icon-amber">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <h3>Content Creation</h3>
              <p>A great story needs a great hook. We generate LinkedIn posts with the structure that gets engagement: compelling openings, clear narratives, and a reason to comment.</p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon feature-icon-teal">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <h3>Planning Tools</h3>
              <p>Consistency wins on LinkedIn. Get a 30 day content plan with specific post ideas and optimal publishing times for your industry so you never run out of things to share.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section process-section">
        <div className="container">
          <div className="section-header">
            <div className="label label-accent">Simple Process</div>
            <h2>From "I have nothing to share" to "Check out what I built" in 3 steps</h2>
            <p>No writing experience needed. No overthinking. Just your background and our process.</p>
          </div>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-num">1</div>
              <h3>Share</h3>
              <p>Tell us about your work, projects, or achievements.</p>
            </div>
            <div className="process-step">
              <div className="step-num">2</div>
              <h3>Develop</h3>
              <p>We help you develop your story with authentic insights.</p>
            </div>
            <div className="process-step">
              <div className="step-num">3</div>
              <h3>Publish</h3>
              <p>Share with confidence across your professional network.</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <a href="/how-it-works.html" className="btn btn-primary btn-lg">Explore the Process &rarr;</a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="label">What Users Say</div>
            <h2>Real stories from real people</h2>
          </div>
          <div className="testimonials-grid">
            <div className="card testimonial-card">
              <div className="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <blockquote>"I never knew how to share my professional journey. This helped me tell my story authentically."</blockquote>
              <div className="testimonial-author">
                <div className="author-avatar av-blue">MK</div>
                <div>
                  <strong>Maya K.</strong>
                  <span>Product Manager</span>
                </div>
              </div>
            </div>
            <div className="card testimonial-card">
              <div className="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <blockquote>"Building my LinkedIn presence felt impossible until I found this. Now it feels natural."</blockquote>
              <div className="testimonial-author">
                <div className="author-avatar av-amber">TR</div>
                <div>
                  <strong>Tyler R.</strong>
                  <span>Software Engineer</span>
                </div>
              </div>
            </div>
            <div className="card testimonial-card">
              <div className="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <blockquote>"The guidance was thoughtful and practical. My posts now reflect who I really am."</blockquote>
              <div className="testimonial-author">
                <div className="author-avatar av-teal">SP</div>
                <div>
                  <strong>Sofia P.</strong>
                  <span>Marketing Professional</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Capture */}
      <section className="capture-section">
        <div className="container">
          <div className="capture-inner">
            <div className="capture-content">
              <div className="label" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>Join the Community</div>
              <h2>Start building your brand today.</h2>
              <p>Join professionals who are confidently sharing their stories.</p>
              <ul>
                <li><span className="check-icon">&#10003;</span> Authentic content guidance</li>
                <li><span className="check-icon">&#10003;</span> Planning and timing tools</li>
                <li><span className="check-icon">&#10003;</span> Community support</li>
                <li><span className="check-icon">&#10003;</span> No experience needed</li>
              </ul>
            </div>
            <div>
              <div className="capture-form-box">
                {submitted ? (
                  <div className="form-success">
                    <div className="success-icon">&#10003;</div>
                    <div>
                      <h3>Welcome!</h3>
                      <p>Check your email for next steps.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>Get Started</h3>
                    <p>No credit card required.</p>
                    <form onSubmit={handleCapture} noValidate>
                      <div className="form-group">
                        <label htmlFor="captureName">Your Name</label>
                        <input
                          type="text"
                          id="captureName"
                          className="form-control"
                          placeholder="e.g., Jane Smith"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="captureEmail">Email Address</label>
                        <input
                          type="email"
                          id="captureEmail"
                          className="form-control"
                          placeholder="you@example.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-primary btn-lg">Get Started &rarr;</button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" className="nav-logo">
                <div className="nav-logo-icon">
                  <svg viewBox="0 0 20 20" fill="none"><path d="M10 2L13 8H17L13.5 11.5L15 17L10 14L5 17L6.5 11.5L3 8H7L10 2Z" fill="white"/></svg>
                </div>
                LaunchBrand
              </Link>
              <p>Build your professional brand with authentic, meaningful stories.</p>
            </div>
            <div className="footer-col">
              <h5>Pages</h5>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><a href="/about.html">About</a></li>
                <li><a href="/how-it-works.html">How It Works</a></li>
                <li><a href="/contact.html">Contact</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Product</h5>
              <ul>
                <li><a href="/how-it-works.html">Tool</a></li>
                <li><a href="/how-it-works.html">Examples</a></li>
                <li><a href="/how-it-works.html">Resources</a></li>
                <li><a href="/contact.html">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; 2025 LaunchBrand. All rights reserved.</span>
            <div className="footer-socials">
              <a href="#" aria-label="LinkedIn">in</a>
              <a href="#" aria-label="Twitter">&#120143;</a>
              <a href="#" aria-label="Instagram">ig</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

/* =============================================
   LaunchBrand - Main JavaScript
   ============================================= */

// ── Mobile Menu ──────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });
  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

// ── Auth State & Navigation ───────────────────
(function initAuthNav() {
  const authUser = JSON.parse(sessionStorage.getItem('launchbrandCurrentUser') || 'null');
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelector('.nav-links');
  const mobileMenu = document.querySelector('.mobile-menu');

  function isAuthenticated() {
    return authUser && authUser.email;
  }

  function clearAuth() {
    sessionStorage.removeItem('launchbrandCurrentUser');
  }

  function handleSignOut(e) {
    if (e) e.preventDefault();
    clearAuth();
    window.location.href = 'signin.html';
  }

  function renderAuthNav() {
    if (!navLinks || !mobileMenu) return;

    if (isAuthenticated()) {
      navLinks.innerHTML = `
        <li><a href="workspace.html">Workspace</a></li>
        <li><a href="#" id="signOutLink">Sign Out</a></li>
      `;
      mobileMenu.innerHTML = `
        <a href="workspace.html">Workspace</a>
        <a href="#" id="signOutLinkMobile">Sign Out</a>
      `;
    }
  }

  if (isAuthenticated()) {
    if (path === 'signin.html') {
      window.location.href = 'workspace.html';
      return;
    }
    renderAuthNav();
    const signOutLink = document.getElementById('signOutLink');
    const signOutLinkMobile = document.getElementById('signOutLinkMobile');
    if (signOutLink) signOutLink.addEventListener('click', handleSignOut);
    if (signOutLinkMobile) signOutLinkMobile.addEventListener('click', handleSignOut);
  } else {
    if (path === 'workspace.html') {
      window.location.href = 'signin.html';
      return;
    }
  }
})();

// ── Active Nav Link ───────────────────────────
(function markActiveLink() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

// ── Scroll Fade-in (Intersection Observer) ───
(function initFadeIn() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
})();

// ── Homepage Email Capture Form ───────────────
const emailForm = document.getElementById('emailCaptureForm');
const formSuccess = document.getElementById('formSuccess');

if (emailForm) {
  emailForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('captureName').value.trim();
    const email = document.getElementById('captureEmail').value.trim();

    if (!name || !email) {
      showFormError(emailForm, 'Please fill in all fields.');
      return;
    }
    if (!isValidEmail(email)) {
      showFormError(emailForm, 'Please enter a valid email address.');
      return;
    }

    // Simulate submission
    const btn = emailForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    setTimeout(() => {
      emailForm.style.display = 'none';
      if (formSuccess) formSuccess.style.display = 'flex';
    }, 900);
  });
}

// ── Contact Form ──────────────────────────────
const contactForm = document.getElementById('contactForm');
const contactSuccess = document.getElementById('contactSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    setTimeout(() => {
      contactForm.style.display = 'none';
      if (contactSuccess) contactSuccess.style.display = 'flex';
    }, 1000);
  });
}

// ── AI Demo (How It Works page) ───────────────
const demoForm = document.getElementById('demoForm');
const demoResult = document.getElementById('demoResult');
const demoLoading = document.getElementById('demoLoading');

if (demoForm) {
  demoForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const experience = document.getElementById('experienceInput').value.trim();
    const industry = document.getElementById('industrySelect').value;
    const goal = document.getElementById('goalSelect').value;

    if (!experience) {
      showDemoError('Please describe your experience before generating.');
      return;
    }

    // Hide form, show loading
    demoForm.style.opacity = '0.5';
    demoForm.style.pointerEvents = 'none';
    if (demoLoading) demoLoading.style.display = 'flex';
    if (demoResult) demoResult.style.display = 'none';

    setTimeout(() => {
      const post = buildPost(experience, industry, goal);
      renderPost(post);
      demoForm.style.opacity = '1';
      demoForm.style.pointerEvents = '';
      if (demoLoading) demoLoading.style.display = 'none';
      if (demoResult) {
        demoResult.style.display = 'block';
        demoResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 2200);
  });
}

// Reset demo button
const resetBtn = document.getElementById('resetDemo');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    if (demoResult) demoResult.style.display = 'none';
    document.getElementById('experienceInput').value = '';
  });
}

// Copy post to clipboard
const copyBtn = document.getElementById('copyPost');
if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    const text = document.getElementById('generatedPostText').innerText;
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = '✓ Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy Post'; }, 2000);
    });
  });
}

// ── Post Templates ────────────────────────────
const templates = {
  tech: [
    {
      hook: "I was the least experienced person in the room - and that turned out to be my superpower.",
      body: `Six weeks into my first tech role, I was assigned to lead a feature demo for engineers twice my experience level.\n\nI almost asked to swap with someone else.\n\nInstead, I spent two nights preparing the kind of questions I wished someone had asked when I started.\n\nHere's what I learned that semester about working in tech:\n\n→ Asking "why does this work?" earns more respect than pretending you know\n→ Documentation no one reads is an invitation to create better documentation\n→ The developers who grow fastest are the ones who treat every code review as a teaching moment`,
      cta: "If you're just starting out in tech - your \"beginner's eye\" is a feature, not a bug. Own it.\n\nWhat's one thing you wish you knew before your first tech job? Drop it below 👇",
      hashtags: "#TechCareer #SoftwareDevelopment #NewGrad #CareerGrowth #LinkedInForBeginners",
      score: 91
    },
    {
      hook: "No one told me my first technical project would teach me more about people than code.",
      body: `During my internship, I was handed a bug that had stumped two senior devs for a week.\n\nI stayed late, not because I was expected to - but because I genuinely couldn't let it go.\n\nAt 11:47pm, I found it. A single off-by-one error in a loop no one had questioned in years.\n\nThe next morning, my manager said something that stuck with me:\n\n"The bug isn't the win. The fact that you kept asking 'why' is the win."\n\nThree things I learned from that experience:\n→ Persistence beats raw talent more often than not\n→ Being a beginner means every obstacle is still a surprise - use that energy\n→ Document your solutions. Your future self will thank you.`,
      cta: "To every new grad debugging their first production issue: you're building more than you know.\n\nWhat's the problem you're most proud of solving? Share it below 👇",
      hashtags: "#Programming #TechJobs #CareerAdvice #CodingLife #NewGrad",
      score: 88
    }
  ],
  marketing: [
    {
      hook: "The marketing campaign I'm most proud of is the one that completely failed. At first.",
      body: `In my first marketing role, I pitched a social campaign with total confidence.\n\nWeek one: 0.2% engagement. Half the industry average.\n\nMy first instinct was to hide the numbers. My second, thankfully, was to dig into them.\n\nTurns out, we were talking AT our audience instead of WITH them. We were broadcasting, not connecting.\n\nI rebuilt the strategy around one question: "What does this person actually care about at 7pm on a Tuesday?"\n\nWeek two results: 3x the engagement. One post went unexpectedly viral within our niche.\n\nWhat changed:\n→ We led with their problem, not our product\n→ We used the language they used, not the language we liked\n→ We asked questions instead of making announcements`,
      cta: "The best marketing insight I ever got wasn't in a textbook. It was from a failed campaign.\n\nWhat's your best \"fail forward\" marketing story?",
      hashtags: "#DigitalMarketing #MarketingTips #ContentStrategy #NewGrad #CareerGrowth",
      score: 93
    }
  ],
  finance: [
    {
      hook: "My first financial model had 47 errors and a presentation in 3 hours.",
      body: `Day 12 of my finance internship. I'd been handed my first real model: a DCF valuation for a live client.\n\nI was so focused on looking competent that I didn't ask the questions I needed to ask.\n\nThe result: circular references, broken formulas, and a spreadsheet that crashed twice.\n\nI almost walked out. Instead, I walked to the desk of the most intimidating analyst in the room and said: "I'm stuck and I need help."\n\nShe spent 40 minutes with me. Not out of pity. Because she'd been there.\n\nWhat that experience taught me about a career in finance:\n\n→ Everyone starts with broken models. The good analysts admit it faster.\n→ Asking for help isn't weakness. It's efficiency\n→ The skill ceiling in finance is high. The floor is survivable.`,
      cta: "To every finance student staring at a broken spreadsheet at midnight: fix it. Submit it. Do it better next time.\n\nWhat's your most valuable \"first job\" lesson?",
      hashtags: "#Finance #InvestmentBanking #FinanceCareers #NewGrad #CareerAdvice",
      score: 90
    }
  ],
  healthcare: [
    {
      hook: "I stopped what I was doing to hold a patient's hand for 20 minutes. My supervisor saw me.",
      body: `It was week two of clinical rotations. I had six tasks on my list.\n\nThe patient wasn't asking for anything. They were just scared.\n\nI sat down anyway.\n\nWhen my supervisor found me, I braced for a correction about time management.\n\nInstead, she said: "That is exactly what patient-centered care looks like."\n\nHealthcare taught me something my textbooks never could:\n\n→ Technical excellence gets you in the room\n→ Presence is what patients actually remember\n→ The "soft skills" aren't soft. They're the hardest part\n\nI've met students who can recite every drug interaction but struggle to make eye contact. I've met others who can't ace the exam but make every patient feel truly seen.\n\nThe best clinicians I know have both.`,
      cta: "To every healthcare student overwhelmed by everything they have to learn: don't let the science crowd out the humanity.\n\nWhat moment reminded you why you chose this field?",
      hashtags: "#Healthcare #Nursing #MedicalStudents #ClinicalTraining #HealthcareCareers",
      score: 92
    }
  ],
  general: [
    {
      hook: "I almost didn't put this on my resume. I thought it was too small.",
      body: `It was just a class project. Just a volunteer gig. Just an internship at a place most people hadn't heard of.\n\nSo I buried it at the bottom of my resume and hoped no one would ask about it.\n\nThen in an interview, the recruiter asked about it specifically.\n\nNot the degree. Not the GPA. The thing I almost left off.\n\n"Walk me through how you approached that," she said.\n\nI did. She leaned forward. We talked about it for 20 minutes.\n\nI got the job.\n\nHere's what I learned:\n\n→ Impact isn't always measured in scale. It's measured in intention and outcome\n→ What feels ordinary to you is remarkable to someone who hasn't done it\n→ Your experiences are more hireable than you think when you learn to frame them`,
      cta: "Stop underselling yourself.\n\nWhat experience are YOU not talking about that you should be? Drop it below. I want to hear it 👇",
      hashtags: "#CareerTips #JobSearch #PersonalBrand #LinkedInTips #NewGrad",
      score: 95
    },
    {
      hook: "Nobody taught me how to talk about my work. So I had to figure it out the hard way.",
      body: `For years, when someone asked "what do you do?", I'd minimize.\n\n"Oh, just an internship." "Just a side project." "Nothing major."\n\nI was terrified of sounding like I was bragging.\n\nThen I read something that changed how I see this:\n\n*"If you don't tell your story, someone else will. Or no one will."*\n\nI started treating my experiences like case studies:\n→ What was the problem I was solving?\n→ What did I actually do?\n→ What changed because of it?\n\nThat reframe didn't just help me write a better resume. It helped me understand my own value.\n\nPersonal branding isn't arrogance. It's clarity.`,
      cta: "What's one experience you've been calling \"nothing major\" that might actually be worth sharing?\n\nWrite it below. I'll help you reframe it 👇",
      hashtags: "#PersonalBranding #LinkedInStrategy #CareerDevelopment #Storytelling #EarlyCareer",
      score: 89
    }
  ]
};

function buildPost(experience, industry, goal) {
  const industryKey = templates[industry] ? industry : 'general';
  const pool = templates[industryKey];
  const template = pool[Math.floor(Math.random() * pool.length)];

  // Weave in a snippet from the user's own input
  const snippet = getSnippet(experience);

  return {
    hook: template.hook,
    body: template.body,
    experience_note: snippet ? `\n*(AI-personalized from your input: "${snippet}")*` : '',
    cta: template.cta,
    hashtags: template.hashtags,
    score: template.score
  };
}

function getSnippet(text) {
  if (!text || text.length < 5) return '';
  const sentences = text.match(/[^.!?\n]+[.!?\n]?/g) || [];
  const first = (sentences[0] || text).trim().replace(/[.!?\n]+$/, '');
  return first.length > 80 ? first.substring(0, 77) + '…' : first;
}

function renderPost(post) {
  const hook = document.getElementById('postHook');
  const body = document.getElementById('postBody');
  const cta = document.getElementById('postCta');
  const tags = document.getElementById('postHashtags');
  const score = document.getElementById('postScore');
  const bar = document.getElementById('scoreBar');

  if (hook) hook.textContent = post.hook;
  if (body) body.textContent = post.body;
  if (cta) cta.textContent = post.cta;
  if (tags) tags.textContent = post.hashtags;
  if (score) score.textContent = post.score;
  if (bar) bar.style.width = post.score + '%';

  // Full text for clipboard
  const fullText = document.getElementById('generatedPostText');
  if (fullText) {
    fullText.innerText = `${post.hook}\n\n${post.body}\n\n${post.cta}\n\n${post.hashtags}`;
  }
}

// ── Helpers ───────────────────────────────────
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFormError(form, message) {
  let errEl = form.querySelector('.form-error-msg');
  if (!errEl) {
    errEl = document.createElement('div');
    errEl.className = 'alert alert-error form-error-msg';
    errEl.style.marginTop = '0.75rem';
    form.appendChild(errEl);
  }
  errEl.textContent = message;
  setTimeout(() => errEl.remove(), 4000);
}

function showDemoError(message) {
  let errEl = document.getElementById('demoError');
  if (!errEl) return;
  errEl.textContent = message;
  errEl.style.display = 'flex';
  setTimeout(() => { errEl.style.display = 'none'; }, 4000);
}

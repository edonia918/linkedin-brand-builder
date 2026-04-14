require('dotenv').config();

// ── Startup validation ────────────────────────────────────
const REQUIRED_ENV = ['JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENROUTER_API_KEY'];
const missing = REQUIRED_ENV.filter(k => !process.env[k] || process.env[k].startsWith('your-'));
if (missing.length) {
  console.warn(`WARNING: Missing or placeholder env vars: ${missing.join(', ')} — some features will not work`);
}

const express = require('express');

const cors = require('cors');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const nodemailer = require('nodemailer');
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');


const isDev = process.env.NODE_ENV !== 'production';

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy (required when behind Render/Heroku/nginx for correct IPs)
app.set('trust proxy', 1);

// ── Security middleware ───────────────────────────────────

const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(',').map(o => o.trim())
  : [];
app.use(cors({
  origin: (origin, cb) => {
    // Allow same-origin requests (no origin header) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    // Allow localhost in development
    if (isDev && origin && new URL(origin).hostname === 'localhost') return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static(__dirname));

// File upload configuration — memory storage (no disk writes, works on Vercel)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// ── Auth Middleware ───────────────────────────────────────
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  req.user = data.user;
  next();
}

// Email transporter
const emailTransporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// OpenRouter client
const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

// File processing functions — operate on Buffer directly (memory storage, no disk I/O)
async function extractTextFromBuffer(buffer, mimeType, filename) {
  try {
    if (mimeType === 'application/pdf') {
      const data = await pdfParse(buffer);
      return data.text;
    } else if (mimeType === 'application/msword' ||
               mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (mimeType === 'text/plain' || mimeType === 'application/rtf') {
      return buffer.toString('utf8');
    } else {
      return `Content from file: ${filename}`;
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return `Could not extract text from ${filename}`;
  }
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

async function analyzeDocumentContent(files) {
  const documentContents = [];
  const skills = new Set();
  const experiences = [];
  const achievements = [];
  const education = [];

  for (const file of files) {
    // file.buffer is populated by multer memoryStorage()
    if (IMAGE_TYPES.includes(file.mimetype)) {
      documentContents.push({
        filename: file.originalname,
        content: '',
        type: file.mimetype,
        imageBase64: file.buffer.toString('base64')
      });
      continue;
    }

    const content = await extractTextFromBuffer(file.buffer, file.mimetype, file.originalname);
    documentContents.push({
      filename: file.originalname,
      content: content,
      type: file.mimetype
    });

    // Extract key information
    const lowerContent = content.toLowerCase();

    // Extract skills (common tech/business skills)
    const skillKeywords = [
      'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'azure',
      'project management', 'leadership', 'communication', 'analytics', 'marketing',
      'sales', 'customer service', 'data analysis', 'machine learning', 'ai'
    ];

    skillKeywords.forEach(skill => {
      if (lowerContent.includes(skill)) {
        skills.add(skill);
      }
    });

    // Extract experiences and achievements
    const experiencePatterns = [
      /worked as ([^\n,.]+)/gi,
      /experience in ([^\n,.]+)/gi,
      /responsible for ([^\n,.]+)/gi,
      /led ([^\n,.]+)/gi,
      /managed ([^\n,.]+)/gi,
      /developed ([^\n,.]+)/gi,
      /created ([^\n,.]+)/gi,
      /implemented ([^\n,.]+)/gi
    ];

    experiencePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        experiences.push(...matches.slice(0, 3)); // Limit to 3 per pattern
      }
    });

    // Extract achievements
    const achievementPatterns = [
      /achieved ([^\n,.]+)/gi,
      /accomplished ([^\n,.]+)/gi,
      /improved ([^\n,.]+)/gi,
      /increased ([^\n,.]+)/gi,
      /reduced ([^\n,.]+)/gi,
      /award/gi,
      /recognition/gi,
      /certification/gi
    ];

    achievementPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        achievements.push(...matches.slice(0, 2));
      }
    });

    // Extract education
    const educationPatterns = [
      /bachelor'?s? in ([^\n,.]+)/gi,
      /master'?s? in ([^\n,.]+)/gi,
      /phd in ([^\n,.]+)/gi,
      /degree in ([^\n,.]+)/gi,
      /university/gi,
      /college/gi
    ];

    educationPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        education.push(...matches.slice(0, 2));
      }
    });
  }

  return {
    documentContents,
    extractedData: {
      skills: Array.from(skills),
      experiences: experiences.slice(0, 5),
      achievements: achievements.slice(0, 5),
      education: education.slice(0, 3)
    },
    summary: documentContents.map(doc => doc.content).join('\n\n').substring(0, 12000)
  };
}


// ── Authentication Routes ─────────────────────────────

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) {
      if (authError.code === 'user_already_exists') {
        return res.status(400).json({ message: 'An account with this email already exists. Please sign in instead.' });
      }
      throw authError;
    }

    const authUser = authData.user;
    if (!authUser) throw new Error('Supabase Auth returned no user — email confirmation may be required');

    const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Insert profile row linked to the Supabase Auth UUID
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        first_name: firstName,
        last_name: lastName,
        email,
        trial_end: trialEnd,
        payment_required: false
      })
      .select()
      .single();
    if (userError) throw userError;

    res.json({
      message: 'Account created successfully',
      token: authData.session?.access_token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        trialEnd: user.trial_end
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Account creation failed', error: error.message });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate credentials with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Fetch profile row
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    if (userError || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      message: 'Sign in successful',
      token: authData.session.access_token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        trialEnd: user.trial_end
      }
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Sign in failed', error: error.message });
  }
});

// ── Email Routes ─────────────────────────────

app.post('/api/email/confirmation', async (req, res) => {
  try {
    const { email, type, subject, message } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3D5A50;">${subject}</h2>
          <p>${message}</p>

          ${type === 'signup' ? `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 0; margin: 20px 0;">
              <h3 style="margin-top: 0;">Your Subscription Details:</h3>
              <ul style="list-style: none; padding: 0;">
                <li>📅 <strong>Free Trial:</strong> 7 days</li>
                <li>💰 <strong>Monthly Price:</strong> $18.99</li>
                <li>🔄 <strong>Billing:</strong> Starts after trial ends</li>
                <li>❌ <strong>Cancel Anytime:</strong> No charges if canceled before trial ends</li>
              </ul>
            </div>

            <p><strong>Important:</strong> Your card will be charged $18.99 on ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} unless you cancel your subscription before then.</p>
          ` : ''}

          <p>If you have any questions, please contact our support team.</p>

          <p>Best regards,<br>The LaunchBrand Team</p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            This email was sent to ${email}. If you didn't create an account with LaunchBrand, please ignore this email.
          </p>
        </div>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    res.json({ message: 'Confirmation email sent successfully' });

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

// ── Post Generation Routes ─────────────────────────────

// File upload and post generation route
app.post('/api/generate-posts', requireAuth, upload.array('files', 10), async (req, res) => {
  try {
    const { industry, postType } = req.body;
    const files = req.files;

    console.log(`[generate-posts] industry=${industry} postType=${postType} files=${files ? files.length : 0}`);

    if (!industry || !postType) {
      return res.status(400).json({ message: 'Missing required fields: industry, postType' });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Analyze uploaded documents
    const analysis = await analyzeDocumentContent(files);
    console.log(`[generate-posts] extracted text length=${analysis.documentContents.map(d => d.content).join('').length} skills=${analysis.extractedData.skills.join(',')}`);

    // Generate posts based on analyzed content
    let posts;
    if (!process.env.OPENROUTER_API_KEY) {
      // No API key — use template fallback
      posts = generatePostsFromAnalysis(industry, postType, analysis);
    } else {
      const prompt = buildPostGenerationPrompt(industry, postType, analysis);

      // Build multimodal user message: text prompt + any uploaded images
      const userContent = [{ type: 'text', text: prompt }];
      for (const doc of analysis.documentContents) {
        if (doc.imageBase64) {
          userContent.push({
            type: 'image_url',
            image_url: { url: `data:${doc.type};base64,${doc.imageBase64}` }
          });
        }
      }

      const messages = [
        {
          role: 'system',
          content: 'You are a professional LinkedIn content creator who helps early-career professionals build their personal brand through authentic, engaging posts. Generate high-quality LinkedIn posts that are grounded in the specific content from the uploaded documents — not generic templates. Write in a warm, first-person voice. Never use dashes (- or —) anywhere in the post. Use short paragraphs separated by blank lines instead of long blocks of text or bullet points. Always respond with a raw JSON array only — no code fences, no markdown, no explanation before or after the JSON.'
        },
        { role: 'user', content: userContent }
      ];

      const PRIMARY_MODEL = 'minimax/minimax-m2.7-20260318';
      const BACKUP_MODEL  = 'google/gemma-4-31b-it:free';

      let response;
      try {
        const message = await openrouter.chat.completions.create({
          model: PRIMARY_MODEL,
          max_tokens: 2000,
          messages
        });
        response = message.choices[0].message.content;
        console.log(`[generate-posts] used model=${PRIMARY_MODEL}`);
      } catch (primaryErr) {
        console.warn(`[generate-posts] primary model failed (${primaryErr.message}), falling back to ${BACKUP_MODEL}`);
        const message = await openrouter.chat.completions.create({
          model: BACKUP_MODEL,
          max_tokens: 2000,
          messages
        });
        response = message.choices[0].message.content;
        console.log(`[generate-posts] used model=${BACKUP_MODEL}`);
      }

      // Strip code fences if the model wrapped the JSON in ```json ... ```
      response = response.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

      try {
        const parsed = JSON.parse(response);
        posts = Array.isArray(parsed) ? parsed : parsed.posts || [];
      } catch (parseError) {
        posts = parsePostsFromText(response);
      }
    }

    // Format posts
    const formattedPosts = posts.map((post, index) => ({
      id: index + 1,
      content: post.content || post,
      timestamp: post.timestamp || new Date().toLocaleDateString()
    }));

    // Save to Supabase for session persistence
    const userId = req.user.id;

    // Save user preferences
    await supabase.from('user_preferences').upsert({
      user_id: userId,
      industry,
      post_type: postType,
      updated_at: new Date()
    });

    // Save extracted document text
    for (const doc of analysis.documentContents) {
      await supabase.from('user_documents').insert({
        user_id: userId,
        filename: doc.filename,
        extracted_text: doc.content
      });
    }

    // Save generated posts
    for (const post of formattedPosts) {
      await supabase.from('generated_posts').insert({
        user_id: userId,
        content: post.content,
        post_type: postType,
        industry
      });
    }

    res.json({ posts: formattedPosts });

  } catch (error) {
    console.error('Post generation error:', error);
    res.status(500).json({ message: 'Failed to generate posts', error: error.message });
  }
});

// ── User History Route ────────────────────────────────────

app.get('/api/user/history', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [prefsResult, docsResult, postsResult] = await Promise.all([
      supabase.from('user_preferences').select('*').eq('user_id', userId).single(),
      supabase.from('user_documents').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('generated_posts').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    ]);

    res.json({
      preferences: prefsResult.data || null,
      documents: docsResult.data || [],
      posts: postsResult.data || []
    });

  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch history', error: error.message });
  }
});

function generatePostsFromAnalysis(industry, postType, analysis) {
  const { extractedData, summary } = analysis;
  const industryDisplay = industry.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const typeTemplates = {
    'thought-leadership': [
      `As someone deeply invested in ${industryDisplay}, I've been reflecting on how ${extractedData.skills.slice(0, 2).join(' and ')} are becoming essential competencies in today's market. My experience has shown me that mastering these skills creates real competitive advantages.

💡 Key insight: The intersection of technical expertise and strategic thinking drives innovation. When we combine ${extractedData.skills[2] || 'domain knowledge'} with forward-thinking approaches, we can solve complex challenges that others can't.

How are you staying ahead of industry trends? What skills are you focusing on developing?

#ThoughtLeadership #${industryDisplay.replace(/\s+/g, '')} #ProfessionalDevelopment #IndustryInsights`,
      `The evolution of ${industryDisplay} continues to fascinate me. Having worked extensively with ${extractedData.skills.slice(0, 3).join(', ')}, I've witnessed firsthand how these capabilities are reshaping our industry landscape.

🎯 What stands out: Success increasingly depends on the ability to adapt and learn continuously. The professionals who thrive are those who view every project as a learning opportunity and every challenge as a growth catalyst.

What's your perspective on the future of ${industryDisplay.toLowerCase()}? How are you preparing for these changes?

#IndustryTrends #${industryDisplay.replace(/\s+/g, '')} #FutureOfWork #ContinuousLearning`,
      `One of the most valuable lessons from my ${industryDisplay} journey: expertise is built through deliberate practice and consistent application. The ${extractedData.skills.slice(1, 3).join(' and ')} I've developed didn't come overnight—they required focused effort and real-world application.

🔑 Critical takeaway: Theory without practice is incomplete. The most impactful learning happens when we apply new concepts to solve actual problems and create measurable value.

How do you ensure your learning translates into practical results? Share your approach!

#SkillDevelopment #${industryDisplay.replace(/\s+/g, '')} #ProfessionalGrowth #LearningAndDevelopment`
    ],
    'career-update': [
      `Reflecting on my professional growth in ${industryDisplay} over the past year. The journey of mastering ${extractedData.skills.slice(0, 2).join(' and ')} has been incredibly rewarding and challenging.

🚀 What I've learned: Career advancement comes from both technical mastery and the ability to apply skills strategically. Every project becomes an opportunity to deepen expertise and expand impact.

Grateful for the mentors and colleagues who've shaped my development. What's been your biggest professional takeaway this year?

#CareerGrowth #${industryDisplay.replace(/\s+/g, '')} #ProfessionalDevelopment #SkillBuilding`,
      `An important milestone in my ${industryDisplay} career: the realization that true expertise comes from consistent application and continuous learning. The ${extractedData.skills.slice(0, 3).join(', ')} I've developed have opened new doors and created unexpected opportunities.

💡 Key insight: Professional growth isn't linear—it's about embracing challenges, learning from failures, and persistently building capabilities that create value.

How has your approach to career development evolved? What strategies have worked best for you?

#CareerMilestone #${industryDisplay.replace(/\s+/g, '')} #ProfessionalJourney #ContinuousLearning`,
      `The most significant shift in my ${industryDisplay} career has been moving from technical execution to strategic thinking. While ${extractedData.skills.slice(1, 3).join(' and ')} remain crucial, the real growth comes from understanding how to leverage these skills to drive broader impact.

🎯 What changed: Learning to see the bigger picture and connect individual contributions to organizational success. This perspective shift has been transformative.

How do you balance technical expertise with strategic thinking in your role?

#CareerEvolution #${industryDisplay.replace(/\s+/g, '')} #LeadershipDevelopment #ProfessionalGrowth`
    ],
    'project-showcase': [
      `Excited to share insights from a recent ${industryDisplay} project where we applied ${extractedData.skills.slice(0, 2).join(' and ')} to solve a complex challenge. The experience reinforced the importance of combining technical expertise with collaborative problem-solving.

🔧 What worked: Starting with a clear understanding of the problem, then systematically applying the right tools and methodologies. The result was not just a successful outcome, but also valuable lessons for future initiatives.

What project methodologies have you found most effective in your work?

#ProjectManagement #${industryDisplay.replace(/\s+/g, '')} #ProblemSolving #TeamCollaboration`,
      `One of the most valuable learning experiences in my ${industryDisplay} career came from leading a project that required ${extractedData.skills.slice(0, 3).join(', ')}. The challenge pushed us to think differently and develop innovative solutions.

💡 Key takeaway: Complex problems often require interdisciplinary approaches. When we combine diverse skill sets and perspectives, we create solutions that are more robust and impactful.

How do you approach projects that require skills outside your primary expertise?

#ProjectLeadership #${industryDisplay.replace(/\s+/g, '')} #Innovation #CrossFunctionalCollaboration`,
      `Reflecting on a ${industryDisplay} initiative that demonstrated the power of systematic problem-solving. By applying ${extractedData.skills.slice(1, 3).join(' and ')} strategically, we were able to transform a challenging situation into a successful outcome.

🎯 The process: Define the problem clearly, gather diverse perspectives, apply appropriate methodologies, and iterate based on feedback. This structured approach consistently delivers results.

What's your framework for tackling complex projects? Share your methodology!

#ProjectSuccess #${industryDisplay.replace(/\s+/g, '')} #ProblemSolving #ProcessImprovement`
    ],
    'personal-story': [
      `A pivotal moment in my ${industryDisplay} journey taught me the value of embracing challenges as learning opportunities. When I first encountered the need to develop ${extractedData.skills.slice(0, 2).join(' and ')}, I felt overwhelmed—but that discomfort led to significant growth.

💭 What I learned: Professional development often happens outside our comfort zones. The skills we build through necessity become our greatest strengths.

Have you had a similar experience where a challenge became a catalyst for growth?

#ProfessionalStory #${industryDisplay.replace(/\s+/g, '')} #PersonalGrowth #LearningFromChallenges`,
      `Looking back on my ${industryDisplay} career, the most transformative experiences came from stepping outside my established expertise. Learning ${extractedData.skills.slice(0, 3).join(', ')} required me to unlearn old approaches and embrace new perspectives.

🌟 The breakthrough: Real growth happens when we combine humility with curiosity. Being willing to admit what we don't know opens doors to profound learning and new capabilities.

What's the most significant skill you've had to learn outside your comfort zone?

#CareerStory #${industryDisplay.replace(/\s+/g, '')} #SkillDevelopment #ProfessionalGrowth`,
      `One of the most important lessons from my ${industryDisplay} path: success is built on both technical competence and the ability to learn continuously. The ${extractedData.skills.slice(1, 3).join(' and ')} I've developed represent not just capabilities, but also a mindset of growth.

💡 Core insight: Our most valuable professional asset is our ability to adapt and learn. The skills we build today create the opportunities we pursue tomorrow.

How do you cultivate a growth mindset in your professional life?

#PersonalDevelopment #${industryDisplay.replace(/\s+/g, '')} #GrowthMindset #ContinuousLearning`
    ],
    'advice': [
      `Based on my experience in ${industryDisplay}, here's practical advice for professionals looking to advance: Invest time in developing ${extractedData.skills.slice(0, 2).join(' and ')} early in your career. These foundational competencies create leverage for everything that follows.

💡 Pro tip: Focus on skills that are both immediately valuable and have long-term relevance. Quality over quantity—master a few key areas deeply rather than spreading yourself thin.

What skills are you prioritizing for your professional development?

#CareerAdvice #${industryDisplay.replace(/\s+/g, '')} #SkillDevelopment #ProfessionalGrowth`,
      `Three essential lessons from my ${industryDisplay} journey that I wish I knew earlier:

1. **Continuous learning compounds**: The skills you build today create exponential opportunities tomorrow
2. **Quality relationships matter**: Your network's value lies in mutual growth and support
3. **Embrace strategic risks**: Calculated challenges accelerate development far more than safe paths

🎯 The foundation: Build technical excellence, cultivate meaningful connections, and pursue growth through thoughtful challenges.

What's the most valuable career advice you've received?

#ProfessionalAdvice #${industryDisplay.replace(/\s+/g, '')} #CareerDevelopment #Mentorship`,
      `For ${industryDisplay} professionals at any stage: the most impactful investment you can make is in your ability to ${extractedData.skills.slice(1, 3).join(' and ')}. These capabilities transcend specific tools or technologies—they become your professional superpower.

🔑 Why it matters: In a rapidly evolving field, your capacity to learn, adapt, and apply knowledge strategically becomes your greatest competitive advantage.

How do you stay current with industry developments while building deep expertise?

#CareerStrategy #${industryDisplay.replace(/\s+/g, '')} #ProfessionalDevelopment #FutureReadiness`
    ]
  };

  return typeTemplates[postType] || typeTemplates['thought-leadership'];
}

function buildPostGenerationPrompt(industry, postType, analysis) {
  const { extractedData, documentContents, summary } = analysis;
  const industryDisplay = industry.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const fullDocumentText = documentContents
    ? documentContents.map(d => `[${d.filename}]\n${d.content}`).join('\n\n')
    : summary;

  const typeDescriptions = {
    'thought-leadership': 'thought leadership post sharing a specific insight or opinion drawn from the person\'s real experience',
    'career-update': 'career update post celebrating a real milestone, role change, or accomplishment mentioned in the documents',
    'project-showcase': 'project showcase post highlighting a specific project or achievement from the documents with concrete details',
    'personal-story': 'personal story post about a real challenge, turning point, or lesson learned described in the documents',
    'advice': 'advice post offering practical, specific guidance based on the person\'s actual experiences and skills'
  };

  return `You are writing 3 LinkedIn posts for a real ${industryDisplay} professional. The posts must be grounded in the specific content from their uploaded documents below — not generic advice.

UPLOADED DOCUMENT CONTENT:
${fullDocumentText.substring(0, 12000)}

EXTRACTED PROFILE DATA:
Skills: ${extractedData.skills.join(', ') || 'see documents'}
Experiences: ${extractedData.experiences.join('; ') || 'see documents'}
Achievements: ${extractedData.achievements.join('; ') || 'see documents'}
Education: ${extractedData.education.join('; ') || 'see documents'}

POST TYPE: ${typeDescriptions[postType] || typeDescriptions['thought-leadership']}

STRICT RULES — follow every one:
1. Reference specific details, projects, companies, skills, or accomplishments from the documents. Do not write generic posts.
2. Write in first person, warm and authentic. Sound like a real person, not a press release.
3. ZERO dashes anywhere — no hyphens used as punctuation, no em dashes, no en dashes.
4. Use short paragraphs of 1-3 sentences each, separated by blank lines. Do not write walls of text.
5. No bullet points or numbered lists inside the post body.
6. End each post with a genuine question to spark conversation.
7. Include 3-5 relevant hashtags at the very end.
8. Never mention files, documents, resumes, or uploads.

Return a JSON array of exactly 3 objects, each with a "content" field containing the full post text. Example format:
[{"content": "post text here..."}, {"content": "post text here..."}, {"content": "post text here..."}]`;
}

function parsePostsFromText(text) {
  // Fallback parsing if JSON parsing fails
  // Split on post boundaries (e.g. "Post 1:", "1.", "---")
  const postBlocks = text.split(/(?:^|\n)(?:Post \d+[:\.]|\d+\.\s|---+)/i).filter(s => s.trim());

  if (postBlocks.length >= 2) {
    return postBlocks.slice(0, 3).map((content, index) => ({
      id: index + 1,
      content: content.trim(),
      timestamp: new Date().toLocaleDateString()
    }));
  }

  // If no clear boundaries, treat whole text as one post
  return [{
    id: 1,
    content: text.trim(),
    timestamp: new Date().toLocaleDateString()
  }];
}

// ── Serve Frontend ─────────────────────────────

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Export for Vercel serverless
module.exports = app;

// Start server locally (Vercel ignores this)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`LaunchBrand server running on port ${PORT}`);
    console.log(`Frontend available at http://localhost:${PORT}`);
  });
}

const fs = require('fs');
const path = require('path');

// Test the document analysis and post generation
async function testPostGeneration() {
  try {
    // Simulate the analysis result from our test resume
    const mockAnalysis = {
      extractedData: {
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS', 'Docker', 'Agile', 'Scrum', 'Team Leadership'],
        experiences: [
          'Led development of microservices architecture serving 100K+ users',
          'Implemented CI/CD pipelines reducing deployment time by 60%',
          'Built responsive web applications using React and Node.js'
        ],
        achievements: [
          'Employee of the Year 2022',
          'Led project that increased user engagement by 35%',
          'Mentored junior developers and conducted technical interviews'
        ],
        education: [
          'Bachelor of Science in Computer Science',
          'AWS Certified Solutions Architect',
          'Scrum Master Certification'
        ]
      },
      summary: 'Professional software engineer with extensive experience in full-stack development and team leadership.'
    };

    // Test different post types
    const postTypes = ['thought-leadership', 'career-update', 'project-showcase', 'personal-story', 'advice'];

    console.log('Testing post generation for Technology industry:\n');

    for (const postType of postTypes) {
      console.log(`=== ${postType.toUpperCase()} POSTS ===`);
      const posts = generatePostsFromAnalysis('technology', postType, mockAnalysis);

      posts.forEach((post, index) => {
        console.log(`\nPost ${index + 1}:`);
        console.log(post);
        console.log('---');
      });
      console.log('\n');
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

// Import the function from server.js (simplified version for testing)
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

// Run the test
testPostGeneration();
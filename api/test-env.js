/**
 * Simple environment test endpoint
 */

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  return res.status(200).json({
    test: 'Environment variables test',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    hasGroqKey: !!process.env.GROQ_API_KEY,
    groqKeyLength: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : 0,
    groqKeyPrefix: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 10) + '...' : 'NOT SET',
    allEnvKeys: Object.keys(process.env).filter(k =>
      k.includes('GROQ') || k.includes('VERCEL') || k.includes('NODE')
    ).sort()
  });
};

const AnalysisReport = require('../models/AnalysisReport');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const { analyzeResume } = require('../services/nlpService');

// @desc   Run analysis: resume vs job description
// @route  POST /api/analysis
// @access Protected
const runAnalysis = async (req, res) => {
  try {
    const { resumeId, jobId } = req.body;

    if (!resumeId || !jobId) {
      return res.status(400).json({ message: 'resumeId and jobId are required' });
    }

    // Ensure resume belongs to the logged-in user
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found or access denied' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Run the NLP analysis (TF-IDF primary, Gemini fallback if needed)
    const result = await analyzeResume(
      resume.parsedText,
      job.description,
      job.requiredSkills
    );

    // Save analysis report
    const report = await AnalysisReport.create({
      resumeId: resume._id,
      jobId: job._id,
      userId: req.user._id,
      matchScore: result.matchScore,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
      suggestions: result.suggestions,
      sectionScores: result.sectionScores,
      verdict: result.verdict,
      verdictReason: result.verdictReason,
      confidence: result.confidence,
      usedLLM: result.usedLLM,
    });

    // Populate refs for full response
    const populatedReport = await AnalysisReport.findById(report._id)
      .populate('resumeId', 'originalName fileUrl skills')
      .populate('jobId', 'title company requiredSkills');

    res.status(201).json(populatedReport);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get a single analysis report
// @route  GET /api/analysis/:reportId
// @access Protected
const getReport = async (req, res) => {
  try {
    const report = await AnalysisReport.findOne({
      _id: req.params.reportId,
      userId: req.user._id,
    })
      .populate('resumeId', 'originalName fileUrl skills wordCount')
      .populate('jobId', 'title company description requiredSkills experienceLevel');

    if (!report) {
      return res.status(404).json({ message: 'Report not found or access denied' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get all reports for logged-in user
// @route  GET /api/analysis/user/all
// @access Protected
const getUserReports = async (req, res) => {
  try {
    const reports = await AnalysisReport.find({ userId: req.user._id })
      .populate('resumeId', 'originalName')
      .populate('jobId', 'title company')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Admin: get all reports with user info
// @route  GET /api/analysis/admin/all
// @access Admin
const getAllReports = async (req, res) => {
  try {
    const reports = await AnalysisReport.find()
      .populate('resumeId', 'originalName')
      .populate('jobId', 'title company')
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Admin: get aggregate stats
// @route  GET /api/analysis/admin/stats
// @access Admin
const getAdminStats = async (req, res) => {
  try {
    const [totalReports, totalUsers, shortlisted, rejected, borderline] = await Promise.all([
      AnalysisReport.countDocuments(),
      require('../models/User').countDocuments(),
      AnalysisReport.countDocuments({ verdict: 'shortlisted' }),
      AnalysisReport.countDocuments({ verdict: 'rejected' }),
      AnalysisReport.countDocuments({ verdict: 'borderline' }),
    ]);

    const avgScoreAgg = await AnalysisReport.aggregate([
      { $group: { _id: null, avg: { $avg: '$matchScore' } } },
    ]);

    res.json({
      totalReports,
      totalUsers,
      verdictBreakdown: { shortlisted, rejected, borderline },
      avgMatchScore: avgScoreAgg[0] ? Math.round(avgScoreAgg[0].avg) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { runAnalysis, getReport, getUserReports, getAllReports, getAdminStats };

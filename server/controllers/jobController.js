const Job = require('../models/Job');
const { extractSkills } = require('../services/nlpService');

// @desc   Create a new job (Admin only)
// @route  POST /api/jobs
// @access Admin
const createJob = async (req, res) => {
  try {
    const { title, company, description, requiredSkills, experienceLevel } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    // Auto-extract skills if not provided manually
    const skills =
      requiredSkills && requiredSkills.length > 0
        ? requiredSkills
        : extractSkills(description);

    const job = await Job.create({
      adminId: req.user._id,
      title,
      company: company || '',
      description,
      requiredSkills: skills,
      experienceLevel: experienceLevel || 'any',
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get all active jobs
// @route  GET /api/jobs
// @access Protected (all users)
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true })
      .populate('adminId', 'username')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get single job
// @route  GET /api/jobs/:id
// @access Protected
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('adminId', 'username');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update a job (Admin only)
// @route  PUT /api/jobs/:id
// @access Admin
const updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, adminId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!job) {
      return res.status(404).json({ message: 'Job not found or not authorized' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Delete a job (Admin only)
// @route  DELETE /api/jobs/:id
// @access Admin
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, adminId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or not authorized' });
    }
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createJob, getAllJobs, getJobById, updateJob, deleteJob };

const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { v4: uuidv4 } = require('uuid');
const Resume = require('../models/Resume');
const { extractSkills } = require('../services/nlpService');

// @desc   Upload and parse a resume
// @route  POST /api/resumes/upload
// @access Protected (User)
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please upload a PDF or DOCX file.' });
    }

    const file = req.file;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');

    if (!['pdf', 'docx'].includes(ext)) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: 'Only PDF and DOCX files are supported.' });
    }

    // ── Parse file to extract text ──
    let parsedText = '';
    try {
      if (ext === 'pdf') {
        const dataBuffer = fs.readFileSync(file.path);
        const data = await pdfParse(dataBuffer);
        parsedText = data.text;
      } else if (ext === 'docx') {
        const result = await mammoth.extractRawText({ path: file.path });
        parsedText = result.value;
      }
    } catch (parseErr) {
      console.warn('File parse warning:', parseErr.message);
      parsedText = '';
    }

    // ── Extract skills from parsed text ──
    const skills = extractSkills(parsedText);
    const wordCount = parsedText.split(/\s+/).filter(Boolean).length;

    // ── Extract education and experience signals ──
    const eduMatch = parsedText.match(/(?:education|qualification)[^\n]*\n([^\n]*)/i);
    const expMatch = parsedText.match(/(\d+)\s*\+?\s*years?\s*(?:of)?\s*(?:experience|exp)/i);

    const resume = await Resume.create({
      userId: req.user._id,
      fileName: file.filename,
      originalName: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      fileType: ext,
      parsedText,
      skills,
      education: eduMatch ? eduMatch[1].trim() : '',
      experience: expMatch ? `${expMatch[1]} years` : '',
      wordCount,
    });

    res.status(201).json({
      message: 'Resume uploaded and parsed successfully',
      resume: {
        _id: resume._id,
        originalName: resume.originalName,
        fileUrl: resume.fileUrl,
        skills: resume.skills,
        wordCount: resume.wordCount,
        uploadedAt: resume.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get all resumes for logged-in user
// @route  GET /api/resumes
// @access Protected
const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .select('-parsedText')
      .sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get a single resume by ID
// @route  GET /api/resumes/:id
// @access Protected
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Delete a resume
// @route  DELETE /api/resumes/:id
// @access Protected
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    // Delete file from disk
    const filePath = path.join(__dirname, '..', 'uploads', resume.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await resume.deleteOne();
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Admin: get all resumes
// @route  GET /api/resumes/admin/all
// @access Admin
const getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find()
      .select('-parsedText')
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadResume, getUserResumes, getResumeById, deleteResume, getAllResumes };

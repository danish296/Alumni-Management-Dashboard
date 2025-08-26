
const express = require('express');
const router = express.Router();
const Alumni = require('../models/Alumni');

// Get all alumni
router.get('/', async (req, res) => {
  try {
    const alumni = await Alumni.find().sort({ lastUpdated: -1 });
    res.json(alumni);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single alumni by ID
router.get('/:id', async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);
    if (!alumni) return res.status(404).json({ message: 'Alumni not found' });
    res.json(alumni);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new alumni
router.post('/', async (req, res) => {
  try {
    // Check if alumni with email already exists
    const existingAlumni = await Alumni.findOne({ email: req.body.email });
    if (existingAlumni) {
      return res.status(400).json({ message: 'Alumni with this email already exists' });
    }
    
    const alumni = new Alumni({
      name: req.body.name,
      batch: req.body.batch || 'Unknown',
      department: req.body.department || 'Unknown',
      email: req.body.email,
      company: req.body.company || 'Unknown',
      position: req.body.position || 'Unknown',
      profiles: req.body.profiles || []
    });
    
    const newAlumni = await alumni.save();
    res.status(201).json(newAlumni);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update alumni
router.patch('/:id', async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);
    if (!alumni) return res.status(404).json({ message: 'Alumni not found' });
    
    // Update fields that are sent
    if (req.body.name) alumni.name = req.body.name;
    if (req.body.batch) alumni.batch = req.body.batch;
    if (req.body.department) alumni.department = req.body.department;
    if (req.body.email) alumni.email = req.body.email;
    if (req.body.company) alumni.company = req.body.company;
    if (req.body.position) alumni.position = req.body.position;
    if (req.body.profiles) alumni.profiles = req.body.profiles;
    
    alumni.lastUpdated = Date.now();
    
    const updatedAlumni = await alumni.save();
    res.json(updatedAlumni);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete alumni
router.delete('/:id', async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);
    if (!alumni) return res.status(404).json({ message: 'Alumni not found' });
    
    await alumni.remove();
    res.json({ message: 'Alumni deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Import multiple alumni
router.post('/import', async (req, res) => {
  try {
    const alumniArray = req.body;
    if (!Array.isArray(alumniArray)) {
      return res.status(400).json({ message: 'Request body must be an array of alumni' });
    }
    
    const results = {
      added: 0,
      duplicates: 0,
      errors: 0
    };
    
    for (const alumniData of alumniArray) {
      try {
        // Check for duplicates by email
        const existingAlumni = await Alumni.findOne({ email: alumniData.email });
        if (existingAlumni) {
          results.duplicates++;
          continue;
        }
        
        const alumni = new Alumni({
          name: alumniData.name,
          batch: alumniData.batch || 'Unknown',
          department: alumniData.department || 'Unknown',
          email: alumniData.email,
          company: alumniData.company || 'Unknown',
          position: alumniData.position || 'Unknown',
          profiles: alumniData.profiles || []
        });
        
        await alumni.save();
        results.added++;
      } catch (err) {
        results.errors++;
      }
    }
    
    res.status(201).json({
      message: 'Import complete',
      results
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

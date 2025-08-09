const Appraisal = require('../models/appraisal-form-model');

const submitAppraisal = async (req, res) => {
  try {
    const facultyId = req.user.id; 
    const { researchPublications, seminars, projects, lectures } = req.body;

    let existing = await Appraisal.findOne({ faculty: facultyId });
    if (existing) {
      existing.researchPublications = researchPublications;
      existing.seminars = seminars;
      existing.projects = projects;
      existing.lectures = lectures;
      existing.status = 'pending'; 
      await existing.save();
      return res.json({ message: 'Appraisal updated successfully' });
    }

    const appraisal = new Appraisal({
      faculty: facultyId,
      researchPublications,
      seminars,
      projects,
      lectures,
      status: 'pending',  
    });

    await appraisal.save();
    res.status(201).json({ message: 'Appraisal submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllAppraisals = async (req, res) => {
  try {
    const appraisals = await Appraisal.find().populate('faculty', 'name email');
    res.json(appraisals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const appraisalId = req.params.id;
    const { status, adminComments } = req.body;

    const appraisal = await Appraisal.findById(appraisalId);
    if (!appraisal) return res.status(404).json({ message: 'Appraisal not found' });

    appraisal.status = status.toLowerCase(); // ensure lowercase
    if (adminComments) appraisal.adminComments = adminComments;

    await appraisal.save();
    res.json({ message: `Appraisal ${status.toLowerCase()} successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { submitAppraisal, getAllAppraisals, updateStatus };

const mongoose = require('mongoose');
const Assessment = require('../models/Assessment');
require('dotenv').config({ path: '.env' });

const getAssess = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const assessment = await Assessment.findOne().sort({ createdAt: -1 });
    console.log(JSON.stringify(assessment.metadata, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

getAssess();

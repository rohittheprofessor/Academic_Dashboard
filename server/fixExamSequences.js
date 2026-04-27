require('dotenv').config();
const mongoose = require('mongoose');
const Assessment = require('./models/Assessment');

const fixAssessments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const assessments = await Assessment.find({});
    console.log(`Found ${assessments.length} assessments to check.`);

    let updatedCount = 0;

    for (const assessment of assessments) {
      const tName = (assessment.metadata.testName || 'Internal Assessment').toUpperCase();
      let testType = 'Internal';
      let examSequence = 1;

      if (tName.includes('CT')) {
        testType = 'CT';
        const match = tName.match(/CT[\s-]*(\d+)/);
        if (match) examSequence = parseInt(match[1]);
      } else if (tName.includes('MAKEUP')) {
        testType = 'Makeup';
      } else if (tName.includes('EXTERNAL')) {
        testType = 'External';
      }

      // Only update if it needs changing
      if (assessment.metadata.testType !== testType || assessment.metadata.examSequence !== examSequence) {
        assessment.metadata.testType = testType;
        assessment.metadata.examSequence = examSequence;
        await assessment.save();
        console.log(`Updated ${assessment.metadata.testName} -> Type: ${testType}, Seq: ${examSequence}`);
        updatedCount++;
      }
    }

    console.log(`Finished checking. Updated ${updatedCount} assessments.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixAssessments();

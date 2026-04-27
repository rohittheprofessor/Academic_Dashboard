import { useEffect, useState } from 'react';
import axios from 'axios';

export const useActiveAssessment = () => {
  const [assessmentId, setAssessmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const sessionStr = localStorage.getItem('activeClassSession');
        if (!sessionStr) {
          setError('No class session selected. Please go back to setup.');
          setLoading(false);
          return;
        }

        const session = JSON.parse(sessionStr);
        // Build query params based on session
        // For simplicity, we just fetch all assessments for the teacher and filter, or send query params
        const { data } = await axios.get('/api/assessments');
        
        // Filter assessments that match the chosen context
        const matched = data.filter(a => 
          a.metadata.semester === session.semester &&
          a.metadata.section === session.section &&
          a.metadata.program === session.branch &&
          a.metadata.courseId === session.subject &&
          a.metadata.sessionYear === session.academicYear
        );

        if (matched.length > 0) {
          // Sort by creation date descending
          matched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          const selectedId = localStorage.getItem('selectedAssessmentId');
          const isValidSelection = matched.find(a => a._id === selectedId);
          
          if (selectedId && isValidSelection) {
            setAssessmentId(selectedId);
          } else {
            setAssessmentId(matched[0]._id);
          }
          
          setHasData(true);
        } else {
          setHasData(false);
          setError('No assessments uploaded for this class yet.');
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, []);

  return { assessmentId, loading, error, hasData };
};

import { useState, useRef } from 'react';
import { uploadResume } from '../services/api';

function OnboardingPage({ onComplete }) {
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('fresher');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload your resume PDF to continue.');
      return;
    }
    if (!targetRole.trim()) {
      setError('Please enter your target job role.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload Resume Endpoint
      const response = await uploadResume(file);

      // Pass user profile details to onComplete (which can save to local storage/state)
      onComplete({
        resumeId: response.id,
        targetRole,
        experienceLevel,
        isSetup: true
      });
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload and analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <h1>Welcome Aboard! 🚀</h1>
        <p className="subtitle">Let's set up your profile for personalized interview prep.</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Upload Resume (PDF)</label>
            <div 
              className="upload-area"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleFileClick}
            >
              <div className="upload-icon">📄</div>
              {file ? (
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>{file.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Click or drag to replace</p>
                </div>
              ) : (
                <div>
                  <p style={{ fontWeight: 600 }}>Click to browse or drag PDF here</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Maximum file size: 5MB</p>
                </div>
              )}
            </div>
            <input 
              type="file" 
              accept=".pdf" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
          </div>

          <div className="form-group">
            <label>Target Job Role</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g., AI Engineer, Frontend Developer" 
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Experience Level</label>
            <select 
              className="form-input" 
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
            >
              <option value="fresher">Fresher (0 years)</option>
              <option value="junior">Junior (1-3 years)</option>
              <option value="mid">Mid-Level (3-5 years)</option>
              <option value="senior">Senior (5+ years)</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
            {loading ? (
              <>
                <div className="loading-spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                Analyzing Resume...
              </>
            ) : (
              'Analyze Resume & Setup Profile'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingPage;

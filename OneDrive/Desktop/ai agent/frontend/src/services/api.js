const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/v1` 
  : '/api/v1';

function getHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      // Clear stale session data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userProfile');
      // Throw first so callers can show a proper message, then redirect
      const err = new Error('SESSION_EXPIRED');
      err.status = 401;
      setTimeout(() => { window.location.href = '/auth'; }, 1500);
      throw err;
    }
    throw new Error(data.detail || 'Request failed');
  }
  return data;
}

// ─── Auth ───
export async function register(email, username, password, fullName) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password, full_name: fullName }),
  });
  return handleResponse(res);
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function getProfile() {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function updateProfile(targetRole, experienceLevel) {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ target_role: targetRole, experience_level: experienceLevel }),
  });
  return handleResponse(res);
}

// ─── Chat ───
export async function sendMessageStream(message, sessionId = null, onChunk, onDone, onError) {
  try {
    const res = await fetch(`${API_BASE}/chat/send`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, session_id: sessionId }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || 'Request failed');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Keep the last incomplete line in the buffer
      buffer = lines.pop();
      
      for (const line of lines) {
        if (line.trim().startsWith('data: ')) {
          try {
            const data = JSON.parse(line.trim().slice(6));
            if (data.type === 'token') {
              if (onChunk) onChunk(data.content);
            } else if (data.type === 'done') {
              if (onDone) onDone(data);
            } else if (data.type === 'error') {
              if (onError) onError(new Error(data.content));
            }
          } catch (e) {
            console.error("SSE Parse Error:", e, line);
          }
        }
      }
    }
  } catch (err) {
    if (onError) onError(err);
  }
}

export async function getChatHistory(limit = 20) {
  const res = await fetch(`${API_BASE}/chat/history?limit=${limit}`, { headers: getHeaders() });
  return handleResponse(res);
}

// ─── Resume ───
export async function uploadResume(file) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);
  
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/resume/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });
  return handleResponse(res);
}

export async function listResumes() {
  const res = await fetch(`${API_BASE}/resume/list`, { headers: getHeaders() });
  return handleResponse(res);
}

// ─── Jobs ───
export async function matchJD(jobDescription) {
  const res = await fetch(`${API_BASE}/jobs/match`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ job_description: jobDescription }),
  });
  return handleResponse(res);
}

export async function generateCoverLetter(jobDescription, companyName, jobTitle) {
  const res = await fetch(`${API_BASE}/jobs/cover-letter`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ 
      job_description: jobDescription,
      company_name: companyName,
      job_title: jobTitle
    }),
  });
  return handleResponse(res);
}

// ─── Interview ───
export async function startInterview(topic, difficulty = 'intermediate', numQuestions = 5) {
  const res = await fetch(`${API_BASE}/interview/start`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ topic, difficulty, num_questions: numQuestions }),
  });
  return handleResponse(res);
}

export async function submitAnswer(sessionId, questionId, answer) {
  const res = await fetch(`${API_BASE}/interview/answer`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ session_id: sessionId, question_id: questionId, answer }),
  });
  return handleResponse(res);
}

export async function getInterviewHistory() {
  const res = await fetch(`${API_BASE}/interview/history`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function completeInterview(sessionId) {
  const res = await fetch(`${API_BASE}/interview/complete/${sessionId}`, {
    method: 'POST',
    headers: getHeaders()
  });
  return handleResponse(res);
}

// ─── Roadmap ───
export async function generateRoadmap(targetRole, weeks = 4, weakAreas = []) {
  const res = await fetch(`${API_BASE}/roadmap/generate`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ target_role: targetRole, duration_weeks: weeks, weak_areas: weakAreas }),
  });
  return handleResponse(res);
}

export async function getProgress() {
  const res = await fetch(`${API_BASE}/roadmap/progress`, { headers: getHeaders() });
  return handleResponse(res);
}

// ─── Recruiter ───
export async function getRecruiterSessions() {
  const res = await fetch(`${API_BASE}/recruiter/sessions`, { headers: getHeaders() });
  return handleResponse(res);
}

// ─── Voice ───
export async function transcribeAudio(audioBlob) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/voice/transcribe`, {
    method: 'POST',
    headers,
    body: formData,
  });
  return handleResponse(res);
}

// ─── Analytics ───
export async function getAnalyticsMetrics() {
  const res = await fetch(`${API_BASE}/analytics/metrics`, { headers: getHeaders() });
  return handleResponse(res);
}


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
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Request failed');
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

// ─── Chat ───
export async function sendMessage(message, sessionId = null) {
  const res = await fetch(`${API_BASE}/chat/send`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ message, session_id: sessionId }),
  });
  return handleResponse(res);
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
  const res = await fetch(`${API_BASE}/resume/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
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

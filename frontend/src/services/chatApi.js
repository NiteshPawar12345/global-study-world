import { getApiBase } from '../utils/apiConfig';

const request = async (path, { method = 'GET', body, headers = {} } = {}, token) => {
  if (!token) {
    throw new Error('Authentication token is missing');
  }

  const apiBase = getApiBase();
  const API_BASE = `${apiBase}/api/chat`;

  const config = {
    method,
    headers: {
      ...headers,
      Authorization: `Bearer ${token}`
    }
  };

  if (body instanceof FormData) {
    config.body = body;
  } else if (body !== undefined) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, config);
  const status = response.status;
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || (status === 429 ? 'Too many requests. Please wait a moment.' : 'Chat request failed');
    const error = new Error(message);
    error.status = status;
    throw error;
  }

  return data.data || data;
};

export const startConversationAsStudent = (token, consultantId) => {
  return request('/conversations', {
    method: 'POST',
    body: { consultant_id: consultantId }
  }, token);
};

export const startConversationAsConsultant = (token, studentId) => {
  return request('/conversations', {
    method: 'POST',
    body: { student_id: studentId }
  }, token);
};

export const fetchConversationMessages = (token, conversationId, { page = 1, limit = 50 } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return request(`/conversations/${conversationId}/messages?${params.toString()}`, {}, token);
};

export const sendConversationMessage = (token, conversationId, content, metadata = null) => {
  return request(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: { content, metadata }
  }, token);
};

export const markConversationRead = (token, conversationId) => {
  return request(`/conversations/${conversationId}/read`, {
    method: 'POST'
  }, token);
};

export const fetchChatNotifications = (token) => {
  return request('/notifications', {}, token);
};

export const fetchConversations = (token) => {
  return request('/conversations', {}, token);
};



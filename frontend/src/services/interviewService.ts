const API_BASE_URL = '/api/interview';

export const interviewService = {
  startInterview: async () => {
    const response = await fetch(`${API_BASE_URL}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  sendResponse: async (sessionId: string, response: string) => {
    const result = await fetch(`${API_BASE_URL}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        response: response,
      }),
    });
    return result.json();
  },

  getSummary: async (sessionId: string) => {
    const response = await fetch(`${API_BASE_URL}/${sessionId}/summary`);
    return response.json();
  },

  endInterview: async (sessionId: string) => {
    const response = await fetch(`${API_BASE_URL}/${sessionId}`, {
      method: 'DELETE',
    });
    return response.json();
  },
}; 
import { UserProfile, SymptomLog, MealPlan, FoodCheckResult, Recipe } from '../types';

const API_BASE_URL = 'https://gastroai-backend.onrender.com';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
}

export function getAuthToken() {
  if (!authToken) {
    authToken = localStorage.getItem('authToken');
  }
  return authToken;
}

async function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401 || response.status === 403) {
    // Unauthorized or Forbidden, likely an invalid/expired token
    setAuthToken(null);
    window.location.reload(); // Force a reload to go back to the login screen
    throw new Error('Phiên đăng nhập không hợp lệ.');
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Lỗi không xác định từ server' }));
    throw new Error(errorData.error || `Lỗi HTTP: ${response.status}`);
  }
  return response.json();
}

export async function register(email: string, password: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
}

export async function login(email: string, password: string): Promise<{ token: string; user: { email: string; profile: UserProfile | null; hasApiKey: boolean }; symptoms: SymptomLog[] }> {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse<{ token: string; user: any; symptoms: SymptomLog[] }>(response);
  setAuthToken(data.token);
  return data;
}

export async function fetchMe(): Promise<{ user: { email: string; profile: UserProfile | null; hasApiKey: boolean }; symptoms: SymptomLog[] }> {
    const response = await fetch(`${API_BASE_URL}/api/me`, {
        method: 'GET',
        headers: await getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function saveApiKey(apiKey: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/api-key`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ apiKey }),
  });
  return handleResponse(response);
}

export async function saveUserProfile(profile: UserProfile): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ profile }),
  });
  return handleResponse(response);
}

export async function addSymptom(symptom: SymptomLog): Promise<SymptomLog[]> {
  const response = await fetch(`${API_BASE_URL}/api/symptoms`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ symptom }),
  });
  return handleResponse(response);
}

// --- Gemini Proxy Calls ---

export async function generateMealPlan(profile: UserProfile, symptoms: SymptomLog[]): Promise<MealPlan> {
  const response = await fetch(`${API_BASE_URL}/api/gemini/meal-plan`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ profile, symptoms }),
  });
  return handleResponse(response);
}

export async function checkFoodSafety(profile: UserProfile, foodName: string, foodImage?: { mimeType: string; data: string }): Promise<FoodCheckResult> {
  const response = await fetch(`${API_BASE_URL}/api/gemini/check-food`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ profile, foodName, foodImage }),
  });
  return handleResponse(response);
}

export async function analyzeTriggers(profile: UserProfile, symptoms: SymptomLog[]): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/gemini/analyze-triggers`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ profile, symptoms }),
  });
  const data = await handleResponse<{ analysis: string }>(response);
  return data.analysis;
}

export async function suggestRecipe(profile: UserProfile, request: string): Promise<Recipe> {
  const response = await fetch(`${API_BASE_URL}/api/gemini/suggest-recipe`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ profile, request }),
  });
  return handleResponse(response);
}
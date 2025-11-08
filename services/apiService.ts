import { UserProfile, SymptomLog, MealPlan, FoodCheckResult, Recipe } from '../types';

// *** THAY THẾ URL NÀY BẰNG URL BACKEND CỦA BẠN TRÊN RENDER.COM ***
const API_BASE_URL = 'https://gastroai-backend.onrender.com';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Lỗi không xác định từ server' }));
    throw new Error(errorData.error || `Lỗi HTTP: ${response.status}`);
  }
  return response.json();
}

export async function login(email: string): Promise<{ email: string; userProfile: UserProfile | null; symptoms: SymptomLog[] }> {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
}

export async function saveUserProfile(email: string, profile: UserProfile): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, profile }),
  });
  return handleResponse(response);
}

export async function addSymptom(email: string, symptom: SymptomLog): Promise<SymptomLog[]> {
  const response = await fetch(`${API_BASE_URL}/api/symptoms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, symptom }),
  });
  return handleResponse(response);
}

// --- Gemini Proxy Calls ---

export async function generateMealPlan(profile: UserProfile, symptoms: SymptomLog[]): Promise<MealPlan> {
  const response = await fetch(`${API_BASE_URL}/api/gemini/meal-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, symptoms }),
  });
  return handleResponse(response);
}

export async function checkFoodSafety(profile: UserProfile, foodName: string, foodImage?: { mimeType: string; data: string }): Promise<FoodCheckResult> {
  const response = await fetch(`${API_BASE_URL}/api/gemini/check-food`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, foodName, foodImage }),
  });
  return handleResponse(response);
}

export async function analyzeTriggers(profile: UserProfile, symptoms: SymptomLog[]): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/gemini/analyze-triggers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, symptoms }),
  });
  const data = await handleResponse<{ analysis: string }>(response);
  return data.analysis;
}


export async function suggestRecipe(profile: UserProfile, request: string): Promise<Recipe> {
  const response = await fetch(`${API_BASE_URL}/api/gemini/suggest-recipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, request }),
  });
  return handleResponse(response);
}
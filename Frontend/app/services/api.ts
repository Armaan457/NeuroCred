const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types for API requests and responses
export interface LoanApplicationData {
  no_of_dependents: number;
  education: string;
  self_employed: boolean;
  income_annum: number;
  loan_amount: number;
  loan_term: number;
  cibil_score: number;
}

export interface LoanPredictionResponse {
  approve_chances: number;
  shap_values: Record<string, number>;
  reason: string;
}

export interface CIBILScoreData {
  on_time_payments_percent: number;
  days_late_avg?: number;
  utilization_percent?: number;
  credit_age_years?: number;
  num_secured_loans?: number;
  num_unsecured_loans?: number;
  has_credit_card?: boolean;
  num_inquiries_6months?: number;
  num_new_accounts_6months?: number;
}

export interface CIBILScoreResponse {
  'CIBIL Score': number;
  Breakdown: Record<string, number>;
  Suggestions: string;
}

export interface ChatResponse {
  answer: string;
}

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// API service functions
export const apiService = {
  // Loan prediction
  predictLoanApproval: async (data: LoanApplicationData): Promise<LoanPredictionResponse> => {
    return apiCall<LoanPredictionResponse>('/predict', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // CIBIL score calculation
  calculateCIBILScore: async (data: CIBILScoreData): Promise<CIBILScoreResponse> => {
    return apiCall<CIBILScoreResponse>('/calculate_cibil', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Chatbot
  chat: async (query: string): Promise<ChatResponse> => {
    const params = new URLSearchParams({ query });
    return apiCall<ChatResponse>(`/chat?${params}`, {
      method: 'POST',
    });
  },
};

export default apiService;
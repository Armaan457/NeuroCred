# NeuroCred

NeuroCred is a all in one platform for helping users regarding loans and finances. It provides loan approval prediction, CIBIL score calculation, and a finance chatbot to help users learn about this domains.

## Features (AI/ML)

### 1. Loan Approval Prediction
- Predicts the chances of loan approval based on user inputs.
- Provides SHAP-based explainability for influencing factors.
- Uses Llama-3.1 for generating human-readable insights.

### 2. CIBIL Score Calculation
- Calculates an estimated CIBIL score based on key credit factors.
- Provides a breakdown of score components.
- Offers AI-generated improvement suggestions.

### 3. Loans & Finance Chatbot
- Answers finance and loan-related queries.
- Uses Chroma vector database for retrieving relevant information.
- Powered by Groq LPU for fast inference.

## Tech Stack
- **Backend:** FastAPI
- **AI/ML:** TensorFlow, SHAP and LangChain
- **Database:** Chroma

## Setup

Clone the repository:

```sh
> git clone https://github.com/Armaan457/NeuroCred_ML.git
```

Create and activate a virtual environment:

```sh
> python -m venv venv
> venv\Scripts\activate
```

Install dependencies:

```sh
> pip install -r requirements.txt
```
Run the Backend server:

```sh
> python main.py
```

## API Endpoints

### Loan Approval Prediction
**Endpoint:**
```
POST /predict
```
**Request Body:**
```json
{
    "no_of_dependents": 2,
    "education": "Graduate",
    "self_employed": true,
    "income_annum": 600000,
    "loan_amount": 20000,
    "loan_term": 6,
    "cibil_score": 800
}
```
**Response:**
```json
{
    "approve_chances": 99.66,
    "shap_values": {
        "cibil_score": 0.3648,
        "loan_amount": -0.0553,
        "income_annum": 0.0542,
        "loan_term": 0.0210,
        "self_employed": 0.0042,
        "education": 0.0006,
        "no_of_dependents": 0.0001
    },
    "reason" : "Based on the SHAP values, we can identify the key influencing factors that contributed to the loan approval. Here's a breakdown......."
}
```

### CIBIL Score Calculation
**Endpoint:**
```
POST /calculate_cibil
```
**Request Body:**
```json
{
  "on_time_payments_percent": 95.0,
  "days_late_avg": 5,
  "utilization_percent": 30.0,
  "credit_age_years": 3.5,
  "num_secured_loans": 1,
  "num_unsecured_loans": 2,
  "has_credit_card": true,
  "num_inquiries_6months": 2,
  "num_new_accounts_6months": 1
}
```
**Response:**
```json
{
    "CIBIL Score": 846,
    "Breakdown": {
        "payment_history": 0.9236,
        "credit_utilization": 1.0,
        "credit_age": 0.85,
        "credit_mix": 0.8999,
        "new_credit": 0.7
    },
    "Suggestions": "Based on your credit report, here are some suggestions:....."
}
```

### Chatbot
**Endpoint:**
```
POST /chat
```
**Query Parameters:**
```
?query=What is the best way to improve my credit score?
```
**Response:**
```json
{
    "answer": "The best way to improve your credit score is to make on-time payments and keep your credit utilization below 30%."
}


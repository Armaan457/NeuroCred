import pandas as pd
from models import LoanApplication
import os
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from utils.loader import pipeline, explainer

load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")

llm = ChatGroq(model="llama-3.1-8b-instant", groq_api_key=groq_api_key)

FEATURES = ['no_of_dependents', 'education', 'self_employed', 'income_annum',
            'loan_amount', 'loan_term', 'cibil_score']

async def predict_with_shap(data: LoanApplication):
    education_mapping = {'Graduate': 1, 'Not Graduate': 0}
    education_num = education_mapping.get(data.education, 0)

    input_data = pd.DataFrame([[
        data.no_of_dependents,
        education_num,
        data.self_employed,
        data.income_annum,
        data.loan_amount,
        data.loan_term,
        data.cibil_score
    ]], columns=FEATURES)

    scaler = pipeline.named_steps['scaler']
    model = pipeline.named_steps['model'] 
    
    input_data_scaled = scaler.transform(input_data)
    prediction = model.predict_proba(input_data_scaled)[0][1]

    shap_values = explainer(input_data_scaled)
    shap_dict = dict(zip(FEATURES, shap_values.values[0].round(4)))

    return prediction, shap_dict

async def get_explanation(applicant_dict, shap_dict, prediction):
    prediction_status = 'Approved' if prediction > 0.5 else 'Rejected'
    
    prompt = f"""
    You are an expert financial assistant specializing in loan assessments. Analyze the applicant's financial profile and explain the assessment in a clear, supportive, and easy-to-understand manner.

    DISCLAIMER TO KEEP IN MIND: You are not an official lender. This assessment is an informative guide, not an official lending decision. Final decisions depend on institutional policies and verification.

    Input Data:
    - Predicted Status: {prediction_status}
    - Applicant Profile:
    • Dependents: {applicant_dict.get('no_of_dependents', 'N/A')}
    • Education Level: {applicant_dict.get('education', 'N/A')}
    • Employment Type: {applicant_dict.get('self_employed', 'N/A')}
    • Annual Income: ₹{applicant_dict.get('income_annum', 0):,}
    • Loan Amount: ₹{applicant_dict.get('loan_amount', 0):,}
    • Loan Term: {applicant_dict.get('loan_term', 'N/A')} Years
    • Credit Score: {applicant_dict.get('cibil_score', 'N/A')}

    - Feature Contributions (Direction determines impact):
    • Dependents: {shap_dict.get('no_of_dependents', 0):.4f}
    • Education Level: {shap_dict.get('education', 0):.4f}
    • Employment Type: {shap_dict.get('self_employed', 0):.4f}
    • Annual Income: {shap_dict.get('income_annum', 0):.4f}
    • Loan Amount: {shap_dict.get('loan_amount', 0):.4f}
    • Loan Term: {shap_dict.get('loan_term', 0):.4f}
    • Credit Score: {shap_dict.get('cibil_score', 0):.4f}

    Task:
    Generate a concise, professional explanation structured into 5 sections:

    1. Assessment Summary
    - State the predicted outcome. Frame positive outcomes as encouraging signs and negative outcomes as opportunities to strengthen the application.

    2. Key Strengths
    - Highlight ONLY factors with positive contributions. Explain how they strengthened the application, referencing actual applicant details naturally.

    3. Areas for Improvement
    - Highlight ONLY factors with negative contributions. Explain how they reduced application strength, referencing actual applicant details naturally.

    4. Personalized Recommendations
    - Provide 3–5 practical, actionable recommendations targeting identified weak areas. Avoid generic advice. Frame recommendations as ways to improve profile strength, not as direct guarantees of approval.

    5. Closing
    - End with an encouraging message. Reiterate that this is an informational guide and actual decisions depend on lender policies and documentation.

    Strict Rules & Causality Guardrails:
    - Source of Truth: Feature contribution directions strictly determine strength vs. weakness. Never infer positive/negative impact from raw values alone, and never contradict these values.
    - No False Causality: Describe relationships as associations within the application evaluation (e.g., "Your credit score of {applicant_dict.get('cibil_score', 'N/A')} positively associated with stronger repayment indicators") rather than definitive real-world causes (e.g., "Your low income caused your rejection").
    - No Counterfactual Promises: Do not guarantee outcomes based on parameter changes (e.g., Avoid "If you increase income by X, you will be approved"). Instead, frame recommendations as best practices to strengthen the overall profile.
    - Respect Feature Direction over Stereotypes: If a non-intuitive factor contributed positively/negatively (e.g., a high loan amount contributing positively due to income ratio context), explain it strictly according to its contribution sign, not general rule-of-thumb assumptions.
    - No Technical Jargon: Never mention SHAP, machine learning, models, predictions, algorithms, or feature weights.
    - Forbidden Phrases: Do not use "According to the model...", "The model predicts...", "SHAP shows...", or "The algorithm determined...".
    - Natural Language: Use terms like "Your application...", "Your overall profile...", "Your submitted details...", or "This assessment...".
    - No Raw Metrics: Intertwine actual financial values (e.g., ₹{applicant_dict.get('income_annum', 0):,}) into text naturally, but NEVER reveal the numerical contribution scores.
    """
    response = llm.invoke(prompt)
    return response.content
import pandas as pd
from models.loan_model import LoanApplication
import os
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from utils.loader import model, scaler, explainer

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

    input_data_scaled = scaler.transform(input_data)
    prediction = model.predict(input_data_scaled)[0][0]

    shap_values = explainer(input_data_scaled)
    shap_dict = dict(zip(FEATURES, shap_values.values[0].round(4)))

    return prediction, shap_dict

async def get_explanation(shap_dict, prediction):
    prediction_status = 'Approved' if prediction > 0.5 else 'Rejected'
    
    prompt = f"""
    You are a friendly and knowledgeable loan advisor with years of experience in credit assessment. 
    Your role is to help applicants understand their loan application results in a clear, supportive manner.

    Based on the loan application analysis, here's what I found:
    
    **Application Status: {prediction_status}**
    **Key Factors Analysis:**
    - Number of Dependents Impact: {shap_dict.get('no_of_dependents', 0):.4f}
    - Education Level Impact: {shap_dict.get('education', 0):.4f}
    - Employment Type Impact: {shap_dict.get('self_employed', 0):.4f}
    - Annual Income Impact: {shap_dict.get('income_annum', 0):.4f}
    - Loan Amount Impact: {shap_dict.get('loan_amount', 0):.4f}
    - Loan Term Impact: {shap_dict.get('loan_term', 0):.4f}
    - Credit Score Impact: {shap_dict.get('cibil_score', 0):.4f}

    Please provide a conversational, empathetic explanation that includes:

    1. **Congratulate or gently explain** the decision in a supportive tone
    2. **Highlight the strongest positive factors** that worked in their favor (factors with positive values)
    3. **Identify areas of concern** that may have impacted the decision (factors with negative values)
    4. **Provide 3-4 specific, actionable recommendations** to improve their loan eligibility for future applications
    5. **End with encouragement** and next steps they can take

    Keep the tone conversational, professional, and supportive. Use "you" and "your" to make it personal. 
    Avoid technical jargon and make the explanation easy to understand for someone without financial background.
    Structure your response with clear sections and bullet points where helpful.
    """
    response = llm.invoke(prompt)
    return response.content
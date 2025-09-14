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
    model = pipeline.named_steps['model'].model 
    
    input_data_scaled = scaler.transform(input_data)
    prediction = model.predict(input_data_scaled)[0][0]

    shap_values = explainer(input_data_scaled)
    shap_dict = dict(zip(FEATURES, shap_values.values[0].round(4)))

    return prediction, shap_dict

async def get_explanation(shap_dict, prediction):
    prediction_status = 'Approved' if prediction > 0.5 else 'Rejected'
    
    prompt = f"""
    You are an expert financial modeler. Your role is to analyze key financial factors and provide an educated prediction on the likelihood of a loan application's success. Your goal is to help users understand the driving forces behind the prediction in a clear, supportive, and supportive manner.

    **IMPORTANT:** You are not a bank, official lender, or financial institution. Your analysis is based on a predictive model and should be treated as an informative guide, not an official decision.

    **Input Data:**
    - **Predicted Status:** {prediction_status} (e.g., "Approved" or "Declined")
    - **Key Factors:** A dictionary of factors and their influence on the prediction:
    - Number of Dependents: {shap_dict.get('no_of_dependents', 0):.4f}
    - Education Level: {shap_dict.get('education', 0):.4f}
    - Employment Type: {shap_dict.get('self_employed', 0):.4f}
    - Annual Income: {shap_dict.get('income_annum', 0):.4f}
    - Loan Amount: {shap_dict.get('loan_amount', 0):.4f}
    - Loan Term: {shap_dict.get('loan_term', 0):.4f}
    - Credit Score: {shap_dict.get('cibil_score', 0):.4f}

    **Task:**
    Generate a supportive explanation of the loan application prediction that includes the following:

    1.  **Opening:** Start by sharing the predicted outcome. If the prediction is **positive**, frame it as an encouraging sign. If the prediction is **negative**, explain it gently as an indication of areas that may need improvement.
    2.  **Positive Influences:** Identify and highlight the factors that positively influenced the prediction (where the value is greater than 0).
    3.  **Areas for Focus:** Identify and explain the factors that had a negative impact on the prediction (where the value is less than 0).
    4.  **Recommendations:** Provide 3-4 specific, actionable recommendations to improve their overall financial profile and potentially increase their chances of approval with a real lender.
    5.  **Closing:** End with an encouraging message and a clear, prominent disclaimer that this is a prediction and not a guarantee of a loan approval.

    **Tone & Style:**
    - **Conversational and Personal:** Use "you" and "your."
    - **Clear & Simple:** Avoid jargon.
    - **Structured:** Use clear sections and bullet points.
    - **Maintain a Supportive and Professional Tone.**
    """
    
    response = llm.invoke(prompt)
    return response.content
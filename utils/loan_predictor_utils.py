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
    prompt = f"""
    You are an expert about loan approvals and it's influencing factors
    Shap Values: {shap_dict}
    Prediction: {'Approved' if prediction else 'Rejected'}
    
    Explain the prediction and suggest improvements. DON'T MENTION you used SHAP values
    """
    response = llm.invoke(prompt)
    return response.content
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from tensorflow import keras

app = FastAPI()

# Load model and scaler
model = keras.models.load_model('saved_models/loan_approval_model.keras')
scaler = joblib.load('saved_models/robust_scaler.joblib')

# Define feature columns
FEATURES = ['no_of_dependents', 'education', 'self_employed', 'income_annum',
            'loan_amount', 'loan_term', 'cibil_score']

# Define input data model
class LoanApplication(BaseModel):
    no_of_dependents: int
    education: str
    self_employed: bool
    income_annum: int
    loan_amount: int
    loan_term: int
    cibil_score: int

@app.post("/predict")
async def predict_loan_approval(data: LoanApplication):
    # Convert education to numerical value
    education_mapping = {'Graduate': 1, 'Not Graduate': 0}
    education_num = education_mapping.get(data.education, 0)

    # Create a DataFrame
    input_data = pd.DataFrame([[
        data.no_of_dependents,
        education_num,
        data.self_employed,
        data.income_annum,
        data.loan_amount,
        data.loan_term,
        data.cibil_score
    ]], columns=FEATURES)

    # Scale the input data
    input_data_scaled = scaler.transform(input_data)

    # Make prediction
    prediction = model.predict(input_data_scaled)[0][0]

    result = round(prediction * 100, 2)
    return {"approve_chances": result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
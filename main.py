from fastapi import FastAPI, Query, HTTPException, status
from models.loan_model import LoanApplication
from models.cibil_model import CIBILScoreRequest
from utils.chatbot_utils import chain
from utils.loan_predictor_utils import get_explanation
from utils.cibil_utils import get_improvement_suggestions, CIBILScoreCalculator
from utils.loan_predictor_utils import predict_with_shap
from utils.loader import load_model, load_scaler, load_explainer
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor() as executor:
    model_future = executor.submit(load_model)
    scaler_future = executor.submit(load_scaler)
    explainer_future = executor.submit(load_explainer)

    model = model_future.result()
    scaler = scaler_future.result()
    explainer = explainer_future.result()


app = FastAPI()

calculator = CIBILScoreCalculator()

@app.post("/predict")
async def predict_loan_approval(data: LoanApplication):
    try: 
        prediction, shap_dict = await predict_with_shap(data)
        explanation = await get_explanation(shap_dict, True if prediction > 0.5 else False)

        return {
            "approve_chances": round(prediction * 100, 2),
            "shap_values": shap_dict,
            "reason": explanation
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/calculate_cibil")
async def calculate_cibil(request: CIBILScoreRequest):
    try:
        score, contributions = calculator.calculate_score(request)
        improvement_suggestions = await get_improvement_suggestions(score, contributions)
        
        return {
            "CIBIL Score": score,
            "Breakdown": contributions,
            "Suggestions": improvement_suggestions
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/chat")
async def chat(query: str = Query(..., title="Search Query")):
    try:
        response = await chain.ainvoke(query)
        return {"answer": response.content}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

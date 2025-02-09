from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, Tuple
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import os

from dotenv import load_dotenv
load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")

app = FastAPI()

class CIBILScoreRequest(BaseModel):
    on_time_payments_percent: float
    days_late_avg: float = 0
    utilization_percent: float = 0
    credit_age_years: float = 0
    num_secured_loans: int = 0
    num_unsecured_loans: int = 0
    has_credit_card: bool = False
    num_inquiries_6months: int = 0
    num_new_accounts_6months: int = 0

class CIBILScoreCalculator:
    def __init__(self):
        self.weights = {
            'payment_history': 0.35,
            'credit_utilization': 0.30,
            'credit_age': 0.15,
            'credit_mix': 0.10,
            'new_credit': 0.10
        }
        self.MIN_SCORE = 300
        self.MAX_SCORE = 900
        self.SCORE_RANGE = self.MAX_SCORE - self.MIN_SCORE

    def calculate_payment_history_score(self, on_time_payments_percent: float, days_late_avg: float = 0) -> float:
        base_score = on_time_payments_percent / 100
        if days_late_avg > 0:
            late_penalty = min(days_late_avg / 90, 1)
            base_score *= (1 - late_penalty * 0.5)
        return base_score

    def calculate_credit_utilization_score(self, utilization_percent: float) -> float:
        if utilization_percent <= 10:
            return 0.95
        elif utilization_percent <= 30:
            return 1.0
        elif utilization_percent <= 50:
            return 0.85
        elif utilization_percent <= 75:
            return 0.60
        else:
            return 0.30

    def calculate_credit_age_score(self, years: float) -> float:
        if years >= 5:
            return 1.0
        elif years >= 3:
            return 0.85
        elif years >= 1:
            return 0.70
        else:
            return 0.40

    def calculate_credit_mix_score(self, num_secured_loans: int, num_unsecured_loans: int, has_credit_card: bool) -> float:
        total_products = num_secured_loans + num_unsecured_loans + int(has_credit_card)
        if total_products == 0:
            return 0.30
        diversity_score = min(num_secured_loans, 2) * 0.3 + min(num_unsecured_loans, 2) * 0.2 + int(has_credit_card) * 0.2
        return min(diversity_score, 1.0)

    def calculate_new_credit_score(self, num_inquiries_6months: int, num_new_accounts_6months: int) -> float:
        inquiry_penalty = min(num_inquiries_6months * 0.15, 0.60)
        new_account_penalty = min(num_new_accounts_6months * 0.20, 0.60)
        return 1.0 - max(inquiry_penalty, new_account_penalty)

    def calculate_final_score(self, components: Dict[str, float]) -> Tuple[int, Dict[str, float]]:
        total_score = sum(components[comp] * self.weights[comp] * self.SCORE_RANGE for comp in components)
        final_score = int(round(total_score + self.MIN_SCORE))
        return max(min(final_score, self.MAX_SCORE), self.MIN_SCORE), components

    def calculate_score(self, data: CIBILScoreRequest) -> Tuple[int, Dict[str, float]]:
        components = {
            'payment_history': self.calculate_payment_history_score(data.on_time_payments_percent, data.days_late_avg),
            'credit_utilization': self.calculate_credit_utilization_score(data.utilization_percent),
            'credit_age': self.calculate_credit_age_score(data.credit_age_years),
            'credit_mix': self.calculate_credit_mix_score(data.num_secured_loans, data.num_unsecured_loans, data.has_credit_card),
            'new_credit': self.calculate_new_credit_score(data.num_inquiries_6months, data.num_new_accounts_6months)
        }
        return self.calculate_final_score(components)

calculator = CIBILScoreCalculator()
llm = ChatGroq(model="llama-3.1-8b-instant", groq_api_key = groq_api_key)

@app.post("/calculate_cibil")
async def calculate_cibil(request: CIBILScoreRequest):
    score, contributions = calculator.calculate_score(request)
    improvement_suggestions = await get_improvement_suggestions(score, contributions)
    return {"CIBIL Score": score, "Breakdown": contributions, "Suggestions": improvement_suggestions}


async def get_improvement_suggestions(score: int, breakdown: Dict[str, float]) -> str:
    prompt = f"""
    The user has a CIBIL score of {score}. Here is a breakdown:
    {breakdown}
    Suggest improvements to increase their score.
    Answer in crisp and user-friendly language.
    """
    response = llm.invoke(prompt)
    return response.content

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
import os
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from models import CIBILScoreRequest 
from typing import Dict, Tuple

load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")

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
        return round(base_score, 2)

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
        return round(min(diversity_score, 1.0), 4)

    def calculate_new_credit_score(self, num_inquiries_6months: int, num_new_accounts_6months: int) -> float:
        inquiry_penalty = min(num_inquiries_6months * 0.15, 0.60)
        new_account_penalty = min(num_new_accounts_6months * 0.20, 0.60)
        return round(1.0 - max(inquiry_penalty, new_account_penalty), 4)

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


llm = ChatGroq(model="llama-3.1-8b-instant", groq_api_key=groq_api_key)

async def get_improvement_suggestions(score, breakdown):
    prompt = f"""
    You are an expert financial advisor specializing in credit scores and their improvement.

    **Task:**
    1. Provide actionable strategies to improve a CIBIL score.
    2. Separate the advice into distinct "Short-Term Strategies" and "Long-Term Strategies" sections.
    3. The advice should be general and based on common credit principles, not specific to any provided score or breakdown.
    4. The output should be a helpful, informative response to the user.

    **Constraints:**
    - Do not mention or reference the specific CIBIL score or breakdown provided in the input.
    - Do not mention that you are an AI or that you are generating the advice based on context.
    - Maintain a professional and authoritative tone.
    - Be concise and to the point.
    
    CIBIL score: {score}
    Breakdown: {breakdown}
        """
    response = llm.invoke(prompt)
    return response.content

import os
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from models import CIBILScoreRequest

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
        base = on_time_payments_percent / 100.0

        if on_time_payments_percent < 95:
            base -= (0.95 - on_time_payments_percent / 100) * 1.5

        if days_late_avg > 0:
            late_penalty = min(days_late_avg / 30, 1.0)  
            base *= (1 - late_penalty * 0.4)

        return round(max(min(base, 1.0), 0.0), 4)


    def calculate_credit_utilization_score(self, u: float) -> float:
        if u <= 10:
            return 1.0
        elif u <= 30:
            return 0.90
        elif u <= 50:
            return 0.70
        elif u <= 75:
            return 0.45
        else:
            return 0.20

    def calculate_credit_age_score(self, years: float) -> float:
        if years >= 8:
            return 1.0
        elif years >= 5:
            return 0.90
        elif years >= 3:
            return 0.75
        elif years >= 1:
            return 0.55
        else:
            return 0.35


    def calculate_credit_mix_score(self, sec: int, unsec: int, has_card: bool) -> float:
        score = 0.0
        if sec > 0:
            score += 0.40
        if unsec > 0:
            score += 0.30
        if has_card:
            score += 0.30
        return round(min(score, 1.0), 4)


    def calculate_new_credit_score(self, inquiries: int, new_accounts: int) -> float:
        # each inquiry reduces score heavily
        inquiry_penalty = min(inquiries * 0.12, 0.60)
        new_acct_penalty = min(new_accounts * 0.20, 0.60)
        penalty = max(inquiry_penalty, new_acct_penalty)
        return round(max(1.0 - penalty, 0.2), 4)


    def calculate_final_score(self, components):
        weighted_sum = 0
        for key in components:
            weighted_sum += components[key] * self.weights[key]

        scaled = self.MIN_SCORE + weighted_sum * self.SCORE_RANGE
        final = int(round(scaled))
        return max(min(final, self.MAX_SCORE), self.MIN_SCORE), components

    def calculate_score(self, data: CIBILScoreRequest):
        components = {
            'payment_history': self.calculate_payment_history_score(
                data.on_time_payments_percent, data.days_late_avg
            ),
            'credit_utilization': self.calculate_credit_utilization_score(data.utilization_percent),
            'credit_age': self.calculate_credit_age_score(data.credit_age_years),
            'credit_mix': self.calculate_credit_mix_score(
                data.num_secured_loans, data.num_unsecured_loans, data.has_credit_card
            ),
            'new_credit': self.calculate_new_credit_score(
                data.num_inquiries_6months, data.num_new_accounts_6months
            )
        }
        return self.calculate_final_score(components)


llm = ChatGroq(model="llama-3.1-8b-instant", groq_api_key=groq_api_key)

async def get_improvement_suggestions(input_data, score, breakdown):
    prompt = f"""
    You are an expert financial advisor specializing in credit health and CIBIL score improvement.
    Analyze the provided credit profile to deliver a concise, personalized credit health assessment.

    IMPORTANT:
    This assessment provides financial guidance, not an official credit bureau evaluation. The score breakdown is your absolute source of truth for identifying strengths and weaknesses. Use the applicant's credit profile values exclusively to personalize explanations and recommendations—never invent habits or make unsupported assumptions.

    **Current CIBIL Score:** {score}

    **Score Breakdown (Source of Truth):**
    - Payment History: {breakdown["payment_history"] * 100:.0f}%
    - Credit Utilization: {breakdown["credit_utilization"] * 100:.0f}%
    - Credit Age: {breakdown["credit_age"] * 100:.0f}%
    - Credit Mix: {breakdown["credit_mix"] * 100:.0f}%
    - New Credit: {breakdown["new_credit"] * 100:.0f}%

    **Credit Profile:**
    - On-time Payments: {input_data.get("on_time_payments_percent", 0)}%
    - Average Days Late: {input_data.get("days_late_avg", 0)}
    - Credit Utilization: {input_data.get("utilization_percent", 0)}%
    - Credit Age: {input_data.get("credit_age_years", 0)} years
    - Secured Loans: {input_data.get("num_secured_loans", 0)}
    - Unsecured Loans: {input_data.get("num_unsecured_loans", 0)}
    - Has Credit Card: {"Yes" if input_data.get("has_credit_card", False) else "No"}
    - Credit Inquiries (Last 6 Months): {input_data.get("num_inquiries_6months", 0)}
    - New Accounts (Last 6 Months): {input_data.get("num_new_accounts_6months", 0)}

    ---

    ### Output Structure

    #### 1. Credit Health Summary
    - Explain what the score indicates using these ranges:
    - **750+**: Excellent (focus on maintenance, not overhaul)
    - **700–749**: Good
    - **650–699**: Fair
    - **Below 650**: Needs Improvement
    - Match tone to the score category.

    #### 2. Key Strengths
    - Highlight the strongest contributors based on the score breakdown.
    - Seamlessly integrate exact values from the profile (e.g., "Your credit utilization of 30% is healthy...").

    #### 3. Areas to Improve
    - Focus strictly on the weakest components from the breakdown, ranked by impact.
    - Frame as "optimization opportunities" if the overall score is already excellent (750+).

    #### 4. Personalized Recommendations
    - Provide 3–5 actionable, highly targeted recommendations directly linked to the weakest score components.
    - Tailor each point using the profile data.
    - **Rules:** Never suggest actions that contradict strong areas (e.g., do not suggest lowering utilization if already low, or opening accounts solely to boost age).

    #### 5. Closing
    - End with a short, encouraging message focused on maintenance (if high score) or gradual progress (if lower score).
    """
    response = llm.invoke(prompt)
    return response.content

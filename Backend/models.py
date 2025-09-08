from pydantic import BaseModel

class LoanApplication(BaseModel):
    no_of_dependents: int
    education: str
    self_employed: bool
    income_annum: int
    loan_amount: int
    loan_term: int
    cibil_score: int

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

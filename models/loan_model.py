from pydantic import BaseModel

class LoanApplication(BaseModel):
    no_of_dependents: int
    education: str
    self_employed: bool
    income_annum: int
    loan_amount: int
    loan_term: int
    cibil_score: int

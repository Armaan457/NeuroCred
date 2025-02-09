import streamlit as st
import requests

API_BASE_URL = "http://localhost:8000"

def predict_loan_approval():
    st.header("Loan Approval Prediction")
    
    no_of_dependents = st.number_input("Number of Dependents", min_value=0, step=1)
    education = st.selectbox("Education", ["Graduate", "Not Graduate"])
    self_employed = st.checkbox("Self Employed")
    income_annum = st.number_input("Annual Income", min_value=0, step=1000)
    loan_amount = st.number_input("Loan Amount", min_value=0, step=1000)
    loan_term = st.number_input("Loan Term (months)", min_value=0, step=1)
    cibil_score = st.number_input("CIBIL Score", min_value=300, max_value=900, step=1)
    
    if st.button("Predict Loan Approval"):
        data = {
            "no_of_dependents": no_of_dependents,
            "education": education,
            "self_employed": self_employed,
            "income_annum": income_annum,
            "loan_amount": loan_amount,
            "loan_term": loan_term,
            "cibil_score": cibil_score
        }
        response = requests.post(f"{API_BASE_URL}/predict", json=data)
        result = response.json()
        
        st.write(f"Approval Chances: {result['approve_chances']}%")
        st.write("Key Factors (SHAP scores):", result["shap_values"])
        st.write(result["reason"])

def calculate_cibil_score():
    st.header("CIBIL Score Calculator")
    
    on_time_payments_percent = st.slider("On-Time Payments (%)", 0, 100, 90)
    days_late_avg = st.number_input("Average Days Late", min_value=0, step=1)
    utilization_percent = st.slider("Credit Utilization (%)", 0, 100, 30)
    credit_age_years = st.number_input("Credit Age (years)", min_value=0, step=1)
    num_secured_loans = st.number_input("Number of Secured Loans", min_value=0, step=1)
    num_unsecured_loans = st.number_input("Number of Unsecured Loans", min_value=0, step=1)
    has_credit_card = st.checkbox("Has Credit Card")
    num_inquiries_6months = st.number_input("Number of Credit Inquiries (last 6 months)", min_value=0, step=1)
    num_new_accounts_6months = st.number_input("New Credit Accounts (last 6 months)", min_value=0, step=1)
    
    if st.button("Calculate CIBIL Score"):
        data = {
            "on_time_payments_percent": on_time_payments_percent,
            "days_late_avg": days_late_avg,
            "utilization_percent": utilization_percent,
            "credit_age_years": credit_age_years,
            "num_secured_loans": num_secured_loans,
            "num_unsecured_loans": num_unsecured_loans,
            "has_credit_card": has_credit_card,
            "num_inquiries_6months": num_inquiries_6months,
            "num_new_accounts_6months": num_new_accounts_6months
        }
        response = requests.post(f"{API_BASE_URL}/calculate_cibil", json=data)
        result = response.json()
        
        st.write(f"CIBIL Score: {result['CIBIL Score']}")
        st.write("Score Breakdown (out of 1):", result["Breakdown"])
        st.write("Improvement Suggestions:", result["Suggestions"])

def chat_with_bot():
    st.header("Loan & Finance Chatbot")
    query = st.text_input("Ask a question about loans and finance:")
    
    if st.button("Ask"):
        response = requests.post(f"{API_BASE_URL}/chat", params={"query": query})
        result = response.json()
        st.write(result["answer"])

def main():
    st.title("Loan Assistant")
    option = st.sidebar.selectbox("Choose an option", ["Loan Approval", "CIBIL Score", "Finance Chatbot"])
    
    if option == "Loan Approval":
        predict_loan_approval()
    elif option == "CIBIL Score":
        calculate_cibil_score()
    elif option == "Finance Chatbot":
        chat_with_bot()

if __name__ == "__main__":
    main()

#  NeuroCred

**NeuroCred** is a comprehensive, full-stack fintech platform designed to empower users with AI-driven financial insights and decision-making tools. The platform leverages advanced machine learning models to provide loan approval predictions with explainability, estimates CIBIL scores with personalized improvement guidance, and offers interactive financial counseling via a RAG-powered AI chatbot.

<p align="center">
  <img src="assets/home.png" alt="NeuroCred Home" width="500"/>
</p>

---

## Features

### Loan Approval Prediction & Explainability
- **98% Accurate Loan Approval Prediction:** Predicts loan approval from applicant financial profiles.
- **Decision Explainability:** Highlights the factors influencing each prediction.
- **Natural Language Explanations:** Explains predictions in clear, easy-to-understand language.

<p align="center">
  <img src="assets/loan_pred.png" alt="SHAP Explainability Analysis" width="45%" height="50%"/>
</p>

---

### CIBIL Score Analytics
- **CIBIL Score Estimation:** Estimates CIBIL scores using key credit factors.
- **Credit Health Summary:** Provides an overview of the calculated score.
- **AI Recommendations:** Generates personalized suggestions to improve credit health.

<p align="center">
  <img src="assets/cibil_pred.png" alt="CIBIL Score Analytics" width="45%" height="50%" />
</p>

---

### Financial Assistant
- **Financial Q&A:** Answers questions on loans, credit scores, and personal finance.
- **Retrieval-Augmented Responses:** Uses relevant financial knowledge to answer queries.

<p align="center">
  <img src="assets/cbot.png" alt="Chatbot Conversation Interface" width="45%" height="50%" />
</p>

---

### MLOps
- **Experiment Tracking:** Logs model experiments, metrics, and artifacts.
- **Data Versioning:** Tracks dataset versions for reproducible workflows.

<p align="center">
  <img src="assets/mlflow_dash.png" alt="MLflow Dashboard" width="65%" />
</p>

---

### Authentication & History
- **Secure Authentication:** User signup, login, and JWT-based session management.
- **Password Recovery:** Reset passwords securely via email.
- **History Tracking:** Stores previous loan predictions and CIBIL checks.

---

## Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | Next and Tailwind CSS |
| **Backend** | FastAPI |
| **Database** | MongoDB and ChromaDB |
| **AI / ML** | Scikit-learn, SHAP and LangChain |
| **MLOps** | MLflow and DVC |
| **Authentication** | JWT |

## Developers

- [Armaan Jagirdar](https://github.com/Armaan457)
- [Khusham Bansal](https://github.com/KhushamBansal)
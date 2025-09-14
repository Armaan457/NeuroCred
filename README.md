# NeuroCred

NeuroCred is a comprehensive full stack fintech platform that empowers users with AI-driven financial insights and decision making tools. The platform leverages advanced deep learning models to provide loan approval predictions, CIBIL score calculations, and intelligent financial guidance through an AI chatbot.

## Features

### 1. Loan Approval Prediction
- Predicts the chances of loan approval based on user inputs
- Provides SHAP-based explainability for influencing factors
- Generates human understandable insights

### 2. CIBIL Score Calculation
- Calculates an estimated CIBIL score based on key credit factors
- Provides a breakdown of score components
- Offers AI generated improvement suggestions

### 3. Loans & Finance Chatbot
- Answers finance and loan related queries
- Uses Chroma vector database for retrieving relevant information

## Tech Stack

- **Frontend**: Next, Framer Motion and Tailwind CSS
- **Backend**: FastAPI
- **AI/ML**: TensorFlow, SHAP, LangChain, MLflow

## Setup


### Backend 

1. Clone the repository:
   ```bash
   git clone https://github.com/Armaan457/NeuroCred
   ```
2. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
3. Create and activate a virtual environment:
   - **macOS/Linux:**
     ```bash
     python -m venv env
     source env/bin/activate
     ```
   - **Windows:**
     ```bash
     python -m venv env
     env\Scripts\activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Create a `.env` file and add your Groq API key:
   ```env
   GROQ_API_KEY = ...
   ```

6. Run the server:
   ```bash
   python main.py
   ```

### Frontend 

1. Navigate to the `Frontend` directory:
    ```bash
    cd Frontend
    ```

2. Install dependencies
    ```bash
    npm install
    ```

3. Start development server
    ```bash
    npm run dev
    ```

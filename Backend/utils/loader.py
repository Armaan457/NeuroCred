import keras
import joblib
from concurrent.futures import ThreadPoolExecutor

def load_model():
    return keras.models.load_model('saved_models/loan_approval_model.keras', compile=False)

def load_scaler():
    return joblib.load('saved_models/robust_scaler.joblib')

def load_explainer():
    return joblib.load('saved_models/shap_explainer.joblib')

with ThreadPoolExecutor() as executor:
    model_future = executor.submit(load_model)
    scaler_future = executor.submit(load_scaler)
    explainer_future = executor.submit(load_explainer)

    model = model_future.result()
    scaler = scaler_future.result()
    explainer = explainer_future.result()
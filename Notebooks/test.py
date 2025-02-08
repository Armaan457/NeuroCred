import joblib

scaler = joblib.load(open("robust_scaler.joblib", "rb"))

feature_names = scaler.feature_names_in_

print("Features used during training:", feature_names)
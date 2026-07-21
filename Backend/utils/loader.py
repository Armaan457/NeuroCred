import mlflow
import mlflow.sklearn
import joblib
import os
from concurrent.futures import ThreadPoolExecutor

current_file_dir = os.path.dirname(os.path.abspath(__file__))
mlruns_path = os.path.join(current_file_dir, "..", "..", "Notebooks", "mlruns")
mlruns_path = os.path.abspath(mlruns_path)

mlflow.set_tracking_uri(f"file://{mlruns_path}")
mlflow.set_experiment("loan_approval_experiment")

MODEL_NAME = "loan_approval_model"
MODEL_ALIAS = "production"
client = mlflow.tracking.MlflowClient()


def load_pipeline_and_explainer():
    model_info = client.get_model_version_by_alias(MODEL_NAME, MODEL_ALIAS)
    model_version = model_info.version
    run_id = model_info.run_id

    def load_pipeline():
        return mlflow.sklearn.load_model(f"models:/{MODEL_NAME}@{MODEL_ALIAS}")
    def load_explainer():
        try:
            artifact_path = mlflow.artifacts.download_artifacts(
                run_id=run_id,
                artifact_path="shap_explainer/shap_explainer.joblib",
            )
            return joblib.load(artifact_path)
        except Exception as e:
            print(f"Warning: Could not load SHAP explainer from MLflow: {e}")
            if os.path.exists("saved_models/shap_explainer.joblib"):
                return joblib.load("saved_models/shap_explainer.joblib")
            return None

    with ThreadPoolExecutor() as executor:
        pipeline_future = executor.submit(load_pipeline)
        explainer_future = executor.submit(load_explainer)
        pipeline = pipeline_future.result()
        explainer = explainer_future.result()

    return pipeline, explainer, model_info


pipeline, explainer, model_version = load_pipeline_and_explainer()
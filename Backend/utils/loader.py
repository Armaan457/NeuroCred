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

def load_pipeline_and_explainer():
    def load_pipeline():
        return mlflow.sklearn.load_model("models:/loan_approval_model/latest")

    def load_explainer():
        try:
            client = mlflow.tracking.MlflowClient()
            model_versions = client.get_latest_versions("loan_approval_model", stages=["None"])
            if not model_versions:
                raise Exception("No model versions found")
            
            model_version = model_versions[0]
            run_id = model_version.run_id
            
            artifact_path = mlflow.artifacts.download_artifacts(
                run_id=run_id, 
                artifact_path="shap_explainer/shap_explainer.joblib"
            )
            return joblib.load(artifact_path)
        except Exception as e:
            print(f"Warning: Could not load SHAP explainer from MLflow: {e}")
            if os.path.exists('saved_models/shap_explainer.joblib'):
                return joblib.load('saved_models/shap_explainer.joblib')
            else:
                return None

    with ThreadPoolExecutor() as executor:
        pipeline_future = executor.submit(load_pipeline)
        explainer_future = executor.submit(load_explainer)

        pipeline = pipeline_future.result()
        explainer = explainer_future.result()
    
    return pipeline, explainer

pipeline, explainer = load_pipeline_and_explainer()
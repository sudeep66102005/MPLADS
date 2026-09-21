"""Safe JSON linear-model inference. Loading does not execute serialized Python."""
import json
import math
from datetime import date
from pathlib import Path

FEATURES = ["elapsed_days", "days_to_deadline", "physical_progress_pct", "financial_progress_pct", "progress_gap", "pending_approvals"]

def features(values, as_of):
    start = date.fromisoformat(str(values["start_date"])[:10])
    end = date.fromisoformat(str(values["expected_end_date"])[:10])
    physical = float(values["physical_progress_pct"])
    financial = float(values["financial_progress_pct"])
    approvals = float(values["pending_approvals"])
    if end <= start or not 0 <= physical <= 100 or not 0 <= financial <= 100 or approvals < 0:
        raise ValueError("Invalid project features")
    row = [max(0, (as_of-start).days), (end-as_of).days, physical, financial, financial-physical, approvals]
    if not all(math.isfinite(v) for v in row):
        raise ValueError("Non-finite model input")
    return row

def predict(path, project, as_of, production=False):
    file = Path(path)
    if file.stat().st_size > 1024*1024:
        raise ValueError("Model artifact too large")
    artifact = json.loads(file.read_text(encoding="utf-8"))
    if artifact["format"] != "mplads-linear-delay-v1" or artifact["features"] != FEATURES:
        raise ValueError("Unsupported model artifact")
    if production and artifact["dataKind"] != "observational":
        raise ValueError("Synthetic models cannot be used in production")
    values = {k: getattr(project, k) for k in ["start_date", "expected_end_date", "physical_progress_pct", "financial_progress_pct", "pending_approvals"]}
    x = features(values, as_of)
    numeric = artifact["mean"] + artifact["scale"] + artifact["classifier"]["coef"] + artifact["regressor"]["coef"]
    if any(len(artifact[k]) != len(FEATURES) for k in ["mean", "scale"]) or any(len(artifact[k]["coef"]) != len(FEATURES) for k in ["classifier", "regressor"]):
        raise ValueError("Invalid model dimensions")
    numeric += [artifact["classifier"]["intercept"], artifact["regressor"]["intercept"]]
    if not all(isinstance(v, (int,float)) and math.isfinite(v) for v in numeric) or any(v <= 0 for v in artifact["scale"]):
        raise ValueError("Invalid model coefficients")
    x = [(v-m)/s for v,m,s in zip(x,artifact["mean"],artifact["scale"])]
    def linear(model):
        return sum(a*b for a,b in zip(x,model["coef"])) + model["intercept"]
    logit = max(-500, min(500, linear(artifact["classifier"])))
    return {"probabilityPct": round(100/(1+math.exp(-logit)),1),
            "predictedDelayDays": max(0, round(linear(artifact["regressor"]))),
            "modelVersion": artifact["version"], "dataKind": artifact["dataKind"],
            "datasetSource": artifact["source"], "evaluation": artifact["evaluation"],
            "warning": "Estimate based on historical data; not a guaranteed outcome."}


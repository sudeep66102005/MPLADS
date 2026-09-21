"""Train an exportable delay baseline with a temporal holdout and no project overlap.
python training/train_delay.py history.csv --source "Approved export description" --data-kind observational --output delay-model.json
CSV: project_id,as_of,start_date,expected_end_date,actual_completion_date,physical_progress_pct,financial_progress_pct,pending_approvals
"""
import argparse
import csv
import json
import hashlib
from datetime import date, datetime, timezone
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.ai_engine.delay_model import FEATURES, features

def train(path, source, kind):
    import numpy as np
    from sklearn.preprocessing import StandardScaler
    from sklearn.linear_model import LogisticRegression, Ridge
    from sklearn.metrics import mean_absolute_error, brier_score_loss, precision_score, recall_score
    rows = list(csv.DictReader(Path(path).open(encoding="utf-8-sig", newline="")))
    if len(rows) < 50:
        raise ValueError("At least 50 completed projects are required; substantially more are recommended")
    if len({r["project_id"] for r in rows}) != len(rows):
        raise ValueError("Use exactly one prediction-time snapshot per project to avoid leakage")
    rows.sort(key=lambda r: r["as_of"])
    for r in rows:
        snapshot, completed = date.fromisoformat(r["as_of"]), date.fromisoformat(r["actual_completion_date"])
        if completed <= snapshot:
            raise ValueError("Every snapshot must precede actual completion")
        features(r, snapshot)
    holdout = rows[int(len(rows)*.8):]
    cutoff = date.fromisoformat(holdout[0]["as_of"])
    training = [r for r in rows[:int(len(rows)*.8)] if date.fromisoformat(r["actual_completion_date"]) < cutoff]
    if len(training) < 30:
        raise ValueError("Need at least 30 training projects whose outcomes were known before holdout snapshots")
    def arrays(rs):
        x = np.array([features(r,date.fromisoformat(r["as_of"])) for r in rs])
        y = np.array([max(0,(date.fromisoformat(r["actual_completion_date"])-date.fromisoformat(r["expected_end_date"])).days) for r in rs])
        return x,y
    x,y = arrays(training)
    xt,yt = arrays(holdout)
    if len(set(y > 0)) < 2 or len(set(yt > 0)) < 2:
        raise ValueError("Training and holdout both need delayed and on-time examples")
    scaler = StandardScaler().fit(x)
    classifier = LogisticRegression(max_iter=2000, random_state=42).fit(scaler.transform(x), y > 0)
    regressor = Ridge(alpha=10).fit(scaler.transform(x), y)
    probabilities = classifier.predict_proba(scaler.transform(xt))[:,1]
    days = np.maximum(0,regressor.predict(scaler.transform(xt)))
    evaluation = {"trainProjects":len(training), "holdoutProjects":len(holdout), "split":"temporal; outcomes known before holdout",
                  "cutoff":str(cutoff), "maeDays":float(mean_absolute_error(yt,days)),
                  "baselineMaeDays":float(mean_absolute_error(yt,np.repeat(np.median(y),len(yt)))),
                  "brierScore":float(brier_score_loss(yt>0,probabilities)),
                  "baselineBrierScore":float(brier_score_loss(yt>0,np.repeat(np.mean(y>0),len(yt)))),
                  "precisionAtHalf":float(precision_score(yt>0,probabilities>=.5,zero_division=0)),
                  "recallAtHalf":float(recall_score(yt>0,probabilities>=.5,zero_division=0))}
    return {"format":"mplads-linear-delay-v1","version":datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"),
            "features":FEATURES,"source":source,"dataKind":kind,
            "datasetSha256":hashlib.sha256(Path(path).read_bytes()).hexdigest(),
            "mean":scaler.mean_.tolist(),"scale":scaler.scale_.tolist(),
            "classifier":{"coef":classifier.coef_[0].tolist(),"intercept":float(classifier.intercept_[0])},
            "regressor":{"coef":regressor.coef_.tolist(),"intercept":float(regressor.intercept_)},
            "evaluation":evaluation}

if __name__ == "__main__":
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv_file")
    parser.add_argument("--source",required=True)
    parser.add_argument("--data-kind",choices=["synthetic","observational"],required=True)
    parser.add_argument("--output",required=True)
    args=parser.parse_args()
    result=train(args.csv_file,args.source,args.data_kind)
    Path(args.output).write_text(json.dumps(result,indent=2),encoding="utf-8")
    print(json.dumps(result["evaluation"],indent=2))
    print("Review holdout metrics against baselines before setting DELAY_MODEL_PATH. No automatic promotion.")


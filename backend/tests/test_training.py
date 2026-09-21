"""Synthetic data verifies training mechanics, not real-world prediction accuracy."""
import csv
from datetime import date, timedelta
import pytest
pytest.importorskip("sklearn")
from training.train_delay import train

def test_temporal_training_and_metrics(tmp_path):
    rows=[]
    start=date(2015,1,1)
    for i in range(100):
        as_of=start+timedelta(days=i*15)
        delayed=i%2 == 0
        rows.append({"project_id":str(i),"as_of":str(as_of),"start_date":str(as_of-timedelta(days=40)),
                     "expected_end_date":str(as_of+timedelta(days=30)),
                     "actual_completion_date":str(as_of+timedelta(days=50 if delayed else 20)),
                     "physical_progress_pct":20 if delayed else 75,"financial_progress_pct":80,
                     "pending_approvals":3 if delayed else 0})
    path=tmp_path/"history.csv"
    with path.open("w",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=list(rows[0])); writer.writeheader(); writer.writerows(rows)
    result=train(path,"Synthetic test fixture","synthetic")
    assert result["dataKind"] == "synthetic"
    assert result["evaluation"]["holdoutProjects"] == 20
    assert result["evaluation"]["trainProjects"] >= 30
    assert result["evaluation"]["maeDays"] >= 0
    assert 0 <= result["evaluation"]["brierScore"] <= 1


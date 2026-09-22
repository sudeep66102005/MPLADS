from app.models import Project

def test_cost_monitoring_requires_comparable_source(client,headers):
    h=headers()
    path='/api/v1/projects/1'
    assert client.get(path+'/monitoring',headers=h).json()['costComparison'] is None
    payload={'quantity':10,'unit':'classroom','rateCr':.08,'source':'Pilot engineering estimate, reference 42','asOf':'2026-01-01','comparabilityNote':'Same specification and full construction scope, excluding land.'}
    assert client.post(path+'/cost-benchmark',json=payload,headers=headers('mp')).status_code==403
    assert client.post(path+'/cost-benchmark',json={**payload,'quantity':0},headers=h).status_code==422
    assert client.post(path+'/cost-benchmark',json=payload,headers=h).status_code==201
    data=client.get(path+'/monitoring',headers=h).json()
    assert data['costComparison']['variancePct']==25
    assert data['costComparison']['source']==payload['source']
    assert 'not statutory' in data['recordCompleteness']['definition']
    assert client.get('/api/v1/projects/2/monitoring',headers=headers('mp')).status_code==404

def test_duplicate_work_candidates_are_scoped_and_not_convictions(client,headers,db):
    assert client.get('/api/v1/projects/1/monitoring',headers=headers('mp')).json()['duplicateWorkCandidates']==[]
    p=db.get(Project,2);p.constituency_id=1;db.commit()
    data=client.get('/api/v1/projects/1/monitoring',headers=headers('mp')).json()
    assert data['duplicateWorkCandidates'][0]['possibleSplitWork'] is True
    assert data['duplicateWorkCandidates'][0]['distanceKm']==0
    assert len(data['limits'])==2

def test_financial_history_records_actual_revisions(client,headers):
    h=headers()
    client.patch('/api/v1/projects/1',json={'physicalProgressPct':35},headers=h)
    rows=client.get('/api/v1/projects/1/financial-history',headers=h).json()
    assert rows[-1]['physicalProgressPct']==35 and rows[-1]['spentCr']==.7
    assert client.get('/api/v1/projects/2/financial-history',headers=headers('mp')).status_code==404

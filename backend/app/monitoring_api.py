"""Evidence-qualified monitoring signals, never determinations of fraud."""
from datetime import date
from difflib import SequenceMatcher
from math import radians, sin, cos, asin, sqrt
from fastapi import APIRouter, Depends
from pydantic import Field
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import get_current_user
from app.schemas import CamelModel
from app.access import get_project, project_query, require, MANAGERS, audit
from app.operational_models import AuditEvent, Evidence, ProjectRevision
from app.models import ProjectMilestone
from app.services import analyze

router = APIRouter()
Auth, DB = Depends(get_current_user), Depends(get_db)

class CostBenchmark(CamelModel):
    quantity: float = Field(gt=0)
    unit: str = Field(min_length=1, max_length=80)
    rate_cr: float = Field(gt=0)
    source: str = Field(min_length=5, max_length=1000)
    as_of: date
    comparability_note: str = Field(min_length=10, max_length=2000)

def distance(a, b):
    lat1,lat2 = radians(a.lat),radians(b.lat)
    h = sin((lat2-lat1)/2)**2 + cos(lat1)*cos(lat2)*sin(radians(b.lng-a.lng)/2)**2
    return 6371 * 2 * asin(sqrt(min(1,max(0,h))))

@router.post('/projects/{pid}/cost-benchmark', status_code=201)
def benchmark(pid: int, payload: CostBenchmark, user=Auth, db: Session=DB):
    require(user, MANAGERS)
    get_project(db,user,pid)
    audit(db,user,'cost.benchmark_recorded',pid,**payload.model_dump(mode='json',by_alias=True))
    db.commit()
    return payload

@router.get('/projects/{pid}/monitoring')
def monitoring(pid: int, user=Auth, db: Session=DB):
    p = get_project(db,user,pid)
    candidates=[]
    # Restrict location first; compare only accessible projects. Distance is a candidate signal.
    neighbours = project_query(db,user).filter_by(constituency_id=p.constituency_id,sector=p.sector)
    neighbours = neighbours.filter(type(p).id != pid, type(p).lat.between(p.lat-.01,p.lat+.01), type(p).lng.between(p.lng-.02,p.lng+.02)).order_by(type(p).id).limit(501).all()
    for other in neighbours[:500]:
        km = distance(p,other)
        similar = SequenceMatcher(None,p.name.casefold(),other.name.casefold()).ratio()
        nearby = km <= .5
        overlap = max(p.start_date,other.start_date) <= min(p.expected_end_date,other.expected_end_date)
        if nearby and similar >= .55:
            candidates.append({'projectId':str(other.id),'code':other.code,'name':other.name,'distanceKm':round(km,3),
                               'nameSimilarityPct':round(similar*100,1),'possibleSplitWork':bool(overlap and p.agency_id==other.agency_id),
                               'reason':'Similar name and sector within 500 metres. Compare scope, bills and sanction records.'})
    evidence_count = db.query(Evidence).filter_by(project_id=pid).count()
    milestone_count = db.query(ProjectMilestone).filter_by(project_id=pid).count()
    checks = [{'label':'Photo evidence uploaded','passed':evidence_count>0},
              {'label':'Milestones recorded','passed':milestone_count>0},
              {'label':'Source updated within 30 days','passed':bool(p.updated_at and (date.today()-p.updated_at.date()).days<=30)},
              {'label':'No pending approvals recorded','passed':p.pending_approvals==0}]
    row = db.query(AuditEvent).filter_by(project_id=pid,action='cost.benchmark_recorded').order_by(AuditEvent.id.desc()).first()
    cost = None
    if row:
        d=row.detail
        expected=d['quantity']*d['rateCr']
        cost={**d,'benchmarkTotalCr':expected,'sanctionedAmountCr':p.sanctioned_amount_cr,
              'variancePct':round((p.sanctioned_amount_cr/expected-1)*100,1),
              'warning':'Comparison assumes the supplied quantity and rate cover the same complete scope. Variance alone does not establish inflation.'}
    return {'projectId':str(pid),'asOf':date.today(),'analysis':analyze(p),'costComparison':cost,
            'duplicateWorkCandidates':candidates,'candidateSearchTruncated':len(neighbours)>500,
            'recordCompleteness':{'score':round(100*sum(c['passed'] for c in checks)/len(checks)), 'checks':checks,
                                 'definition':'Documentation checklist; not statutory MPLADS compliance certification.'},
            'limits':['Photos cannot establish work splitting or physical completion by themselves.',
                      'Split-work indicators require a human check of sanction boundaries and applicable rules.']}

@router.get('/projects/{pid}/financial-history')
def financial_history(pid: int, user=Auth, db: Session=DB):
    get_project(db,user,pid)
    rows = db.query(ProjectRevision).filter_by(project_id=pid).order_by(ProjectRevision.id).limit(500)
    return [{'recordedAt':r.created_at,'source':r.source,'sanctionedCr':r.values['sanctionedAmountCr'],
             'releasedCr':r.values['releasedAmountCr'],'spentCr':r.values['expenditureCr'],
             'physicalProgressPct':r.values['physicalProgressPct']} for r in rows]

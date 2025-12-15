import uvicorn
from typing import List, Optional
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from db import SessionLocal, engine
import models
import schemas

# 1. DB Init
try:
    models.Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")
except Exception as e:
    print(f"⚠️ Error creating tables: {e}")

app = FastAPI(title="Job Trends API")

# 2. CORS (Allow Everything)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        return db
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

router = APIRouter()

# --- ANALYTICS ENDPOINT ---
@router.get("/analytics/summary")
def get_analytics():
    defaults = {
        "total_jobs": 0, "avg_salary": 0, "top_skills": [],
        "salary_trend": [], "work_setting": [], "salary_by_experience": [],
        "top_categories": [], "company_size": []
    }
    
    db = get_db()
    if not db:
        print("❌ Database connection failed")
        return defaults

    try:
        total = db.query(models.Job).count()
        print(f"📊 Total jobs in DB: {total}")
        
        if total == 0:
            print("⚠️ No jobs found in database. Run seed_real_data.py first!")
            return defaults

        # Average Salary
        avg = db.query(func.avg(models.Job.min_salary)).scalar() or 0
        
        # Top Skills
        skills_query = (
            db.query(
                models.Skill.skill_name, 
                func.count(models.job_skills.c.job_id).label("count")
            )
            .join(models.job_skills)
            .group_by(models.Skill.skill_name)
            .order_by(func.count(models.job_skills.c.job_id).desc())
            .limit(5)
            .all()
        )
        
        # Salary Trend by Year
        trend_query = (
            db.query(
                models.Job.work_year, 
                func.avg(models.Job.min_salary).label("avg_sal")
            )
            .filter(models.Job.work_year.isnot(None))
            .group_by(models.Job.work_year)
            .order_by(models.Job.work_year)
            .all()
        )
        
        # Work Setting Distribution
        work_setting_query = (
            db.query(
                models.Job.work_setting, 
                func.count(models.Job.job_id).label("count")
            )
            .filter(models.Job.work_setting.isnot(None))
            .group_by(models.Job.work_setting)
            .all()
        )
        
        # Company Size Distribution
        company_size_query = (
            db.query(
                models.Job.company_size, 
                func.count(models.Job.job_id).label("count")
            )
            .filter(models.Job.company_size.isnot(None))
            .group_by(models.Job.company_size)
            .all()
        )

        result = {
            "total_jobs": total,
            "avg_salary": int(avg),
            "top_skills": [{"name": s[0], "count": s[1]} for s in skills_query],
            "salary_trend": [{"year": int(s[0]), "salary": int(s[1])} for s in trend_query],
            "work_setting": [{"name": s[0] or "Unknown", "count": s[1]} for s in work_setting_query],
            "company_size": [{"name": s[0] or "Unknown", "count": s[1]} for s in company_size_query]
        }
        
        print(f"✅ Analytics data prepared: {result['total_jobs']} jobs")
        return result
        
    except Exception as e:
        print(f"❌ Error in analytics: {e}")
        import traceback
        traceback.print_exc()
        return defaults
    finally:
        db.close()

# --- JOBS LIST ---
@router.get("/jobs", response_model=List[schemas.JobResponse])
def get_jobs(search: Optional[str] = None, limit: int = 100):
    db = get_db()
    if not db:
        print("❌ Database connection failed")
        return []
    
    try:
        q = db.query(models.Job)
        
        if search:
            search_pattern = f"%{search}%"
            q = q.filter(
                or_(
                    models.Job.job_title.like(search_pattern),
                    models.Job.location.like(search_pattern),
                    models.Job.job_category.like(search_pattern)
                )
            )
        
        jobs = q.limit(limit).all()
        print(f"📋 Fetched {len(jobs)} jobs")
        return jobs
        
    except Exception as e:
        print(f"❌ Error fetching jobs: {e}")
        import traceback
        traceback.print_exc()
        return []
    finally:
        db.close()

# --- CREATE JOB (NEW ENDPOINT) ---
@router.post("/jobs", response_model=schemas.JobResponse)
def create_job(job: schemas.JobCreate):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        # Find or create company
        company = db.query(models.Company).filter_by(
            company_name=job.company_name
        ).first()
        
        if not company:
            company = models.Company(company_name=job.company_name)
            db.add(company)
            db.commit()
            db.refresh(company)
        
        # Create job
        new_job = models.Job(
            job_title=job.job_title,
            location=job.location,
            min_salary=job.min_salary,
            max_salary=job.max_salary,
            company_id=company.company_id,
            experience_level=job.experience_level,
            work_setting=job.work_setting,
            job_category=job.job_category,
            company_size=job.company_size,
            work_year=job.work_year or 2024
        )
        
        # Add skills if provided
        if job.skills:
            for skill_name in job.skills:
                skill = db.query(models.Skill).filter_by(
                    skill_name=skill_name
                ).first()
                
                if not skill:
                    skill = models.Skill(skill_name=skill_name)
                    db.add(skill)
                
                new_job.skills.append(skill)
        
        db.add(new_job)
        db.commit()
        db.refresh(new_job)
        
        print(f"✅ Created job: {new_job.job_title}")
        return new_job
        
    except Exception as e:
        print(f"❌ Error creating job: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

# --- HEALTH CHECK ---
@router.get("/health")
def health_check():
    db = get_db()
    if not db:
        return {"status": "error", "message": "Database connection failed"}
    
    try:
        count = db.query(models.Job).count()
        db.close()
        return {
            "status": "healthy", 
            "message": f"API is running. {count} jobs in database."
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

app.include_router(router)

@app.on_event("startup")
async def startup_event():
    print("🚀 Starting Job Trends API...")
    print("📍 Visit: http://127.0.0.1:8000/health")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
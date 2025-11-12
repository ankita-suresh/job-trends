# schemas.py
from pydantic import BaseModel
from typing import Optional

class JobBase(BaseModel):
    Job_Title: Optional[str] = None
    Job_Description: Optional[str] = None
    Company_ID: Optional[int] = None
    Location_ID: Optional[int] = None
    Industry_ID: Optional[int] = None
    Salary_USD: Optional[int] = None
    Employment_Type: Optional[str] = None
    Experience_Level: Optional[str] = None
    Work_Setting: Optional[str] = None

class JobCreate(JobBase):
    pass

class JobUpdate(JobBase):
    pass

class JobResponse(JobBase):
    Job_ID: int

    class Config:
        orm_mode = True

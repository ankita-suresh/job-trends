# models.py
from sqlalchemy import Column, Integer, BigInteger, Text
from db import Base

class Job(Base):
    __tablename__ = "jobs"

    # Match the DB columns exactly
    Job_ID = Column(Integer, primary_key=True, autoincrement=True, index=True)
    Job_Title = Column(Text, nullable=True)
    Job_Description = Column(Text, nullable=True)
    Company_ID = Column(BigInteger, nullable=True)
    Location_ID = Column(BigInteger, nullable=True)
    Industry_ID = Column(BigInteger, nullable=True)
    Salary_USD = Column(BigInteger, nullable=True)
    Employment_Type = Column(Text, nullable=True)
    Experience_Level = Column(Text, nullable=True)
    Work_Setting = Column(Text, nullable=True)

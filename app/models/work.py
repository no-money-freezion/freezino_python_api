# app/models/work.py
from enum import StrEnum
from pydantic import BaseModel


class JobTypeEnum(StrEnum):
    office = "office"
    courier = "courier"
    lab_rat = "lab_rat"
    stunt_driver = "stunt_driver"
    drug_dealer = "drug_dealer"
    streamer = "streamer"
    bottle_collector = "bottle_collector"


class WorkStartRequest(BaseModel):
    job_type: JobTypeEnum
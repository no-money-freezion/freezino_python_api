from datetime import datetime
from fastapi import Query
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator
app = FastAPI()

#
@app.get("/api/health")
def health_status():
    return {
       "status": "IT`S ALIVE",
    }


# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=3000)
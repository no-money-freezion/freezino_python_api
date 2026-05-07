from fastapi import APIRouter

router = APIRouter(prefix="/api/loans", tags=["loans"])


@router.get("")
def get_loans():
    return {
        "message": "Loans endpoint is under construction 🔨",
        "status": "coming_soon"
    }


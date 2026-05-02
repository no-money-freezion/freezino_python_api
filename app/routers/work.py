# app/routers/work.py
import sqlite3
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app.db import get_connection
from app.security import get_current_user
from app.data.jobs import JOB_LIST
from app.models.work import WorkStartRequest, JobTypeEnum

router = APIRouter(prefix="/api/work", tags=["work"])


@router.get("/jobs")
def get_work_jobs():
    return JOB_LIST


@router.post("/start")
def start_work_session(work: WorkStartRequest, current_user: Any = Depends(get_current_user)):
    print(f"Пользователь {current_user['username']} хочет работать {work.job_type}")
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM work_sessions WHERE user_id = ? AND jailed = 1 LIMIT 1",
            (current_user["id"],),
        )
        jail_check = cursor.fetchone()
        if jail_check:
            raise HTTPException(status_code=400, detail="Go back to jail cell!")
        time_now = datetime.utcnow()
        time_db = time_now.isoformat()
        end_time = 0
        job = work.job_type
        duration = JOB_LIST[job].get("duration")
        cursor.execute(
            "SELECT user_id FROM work_sessions WHERE user_id = ? AND completed = 0",
            (current_user["id"],),
        )
        rows = cursor.fetchone()

        if rows:
            raise HTTPException(status_code=400, detail="work session already in progress")
        else:
            cursor.execute(
                """
                INSERT INTO work_sessions (
                    user_id,
                    job_type,
                    start_time,
                    duration,
                    completed,
                    earned,
                    end_time,
                    jailed
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    current_user["id"],
                    work.job_type,
                    time_db,
                    duration,
                    0,
                    0,
                    0,
                    0,
                ),
            )
            conn.commit()
            new_session_id = cursor.lastrowid
            return {
                "success": True,
                "data": {
                    "id": new_session_id,
                    "job_type": work.job_type,
                    "start_time": time_db,
                    "duration": duration,
                    "completed": 0,
                    "jailed": 0,
                },
                "description": "Work session started",
            }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=f"Ошибка сервера: {str(e)}") from e
    finally:
        if "conn" in locals():
            conn.close()


@router.get("/status")
def get_status(current_user: Any = Depends(get_current_user)):
    try:
        conn = get_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM work_sessions WHERE user_id = ? AND completed = 0",
            (current_user["id"],),
        )
        rows = cursor.fetchone()

        if rows is None:
            return {
                "success": True,
                "data": {"is_working": False, "time_remaining": 0, "session": 0},
                "message": "No work in progress found",
            }
        else:
            duration = rows["duration"]
            work_name = rows["job_type"]
            datePy = datetime.fromisoformat(rows["start_time"])
            timeCheck = datetime.utcnow() - datePy
            timeLeft = duration - timeCheck.total_seconds()
            message = f"Hey, work here is not done yet. Time left: {timeLeft} seconds"
            if timeLeft < 0:
                message = "Job done!"
                timeLeft = 0
            return {
                "data": {
                    "is_working": True,
                    "time_remaining": timeLeft,
                    "message": message,
                    "session": {
                        "id": current_user["id"],
                        "job_type": work_name,
                        "start_time": datePy,
                    },
                }
            }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=f"Ошибка сервера: {str(e)}") from e
    finally:
        if "conn" in locals():
            conn.close()


@router.get("/history")
def get_history(limit: int = 20, offset: int = 0, current_user: Any = Depends(get_current_user)):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT *
            FROM work_sessions
            WHERE user_id = ?
            AND completed = 1
            ORDER BY end_time DESC
            LIMIT ? OFFSET ?
            """,
            (current_user["id"], limit, offset),
        )
        rows = cursor.fetchall()
        if rows is None:
            raise HTTPException(
                status_code=400, detail="Work sessions does not exist for history log"
            )
        else:
            cursor.execute(
                "SELECT COUNT(*) FROM work_sessions WHERE user_id = ? AND completed = 1",
                (current_user["id"],),
            )
            total = cursor.fetchone()[0]
            sessions = []
            for row in rows:
                sessions.append(
                    {
                        "id": row["id"],
                        "job_type": row["job_type"],
                        "duration": row["duration"],
                        "start_time": row["start_time"],
                        "end_time": row["end_time"],
                        "earned": row["earned"],
                        "completed": row["completed"],
                    }
                )
            return {
                "data": {
                    "sessions": sessions,
                    "total": total,
                }
            }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=f"Ошибка сервера: {str(e)}") from e
    finally:
        if "conn" in locals():
            conn.close()


@router.post("/complete")
def complete_work(current_user: Any = Depends(get_current_user)):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM work_sessions WHERE user_id = ? AND completed = 0 LIMIT 1",
            (current_user["id"],),
        )
        rows = cursor.fetchone()
        if rows is None:
            raise HTTPException(status_code=400, detail="no work session found")
        else:
            check = False
            bonus = 0
            message_bonus = None
            message_jail = None
            duration = rows["duration"]
            work_name = rows["job_type"]
            job_info = JOB_LIST[work_name]
            earned = job_info["reward"]
            date_py = datetime.fromisoformat(rows["start_time"])
            time_check = datetime.utcnow() - date_py
            time_left = duration - time_check.total_seconds()
            bonus_value = job_info.get("money_bonus", 0)
            end_time: int | datetime = 0

            if job_info.get("depends") and bonus_value > 0:
                message_bonus = "No bonus for you"
                bonus = job_info.get("money_bonus", 0)
                req_item = job_info["requirements"]
                message_bonus = f"You have an {req_item}, your bonus is {bonus} dollars"
            if time_left < 0:
                check = True
                time_left = 0
            if check:
                cursor.execute(
                    """
                    UPDATE users
                    SET balance = balance + ? WHERE id = ?
                    """,
                    (
                        earned,
                        current_user["id"],
                    ),
                )
                conn.commit()
                cursor.execute(
                    """
                    UPDATE users
                    SET total_work_time = total_work_time + ? WHERE id = ?
                    """,
                    (
                        duration,
                        current_user["id"],
                    ),
                )
                conn.commit()
                cursor.execute(
                    """
                    UPDATE work_sessions
                    SET completed = 1
                    WHERE user_id = ? AND completed = 0
                    """,
                    (current_user["id"],),
                )
                conn.commit()
                cursor.execute(
                    """
                    UPDATE work_sessions
                    SET earned = ?
                    WHERE user_id = ?
                    """,
                    (
                        earned,
                        current_user["id"],
                    ),
                )
                conn.commit()
                end_time = datetime.utcnow()
                cursor.execute(
                    """
                    UPDATE work_sessions
                    SET end_time = ?
                    WHERE user_id = ?
                    """,
                    (
                        end_time,
                        current_user["id"],
                    ),
                )
                conn.commit()
                total_earned = current_user["total_earned"] + earned
                cursor.execute(
                    """
                    UPDATE users
                    SET total_earned = total_earned + ?
                    WHERE id = ?
                    """,
                    (
                        total_earned,
                        current_user["id"],
                    ),
                )
                conn.commit()
                new_balance = earned + current_user["balance"]
                if job_info.get("punish"):
                    cursor.execute(
                        """
                        UPDATE work_sessions SET jailed = 1 WHERE user_id = ? AND completed = 1
                        """,
                        (current_user["id"],),
                    )
                    message_jail = (
                        "You are going to Jail for 8 game-years, and cant start work anymore"
                    )

                conn.commit()
                return {
                    "success": True,
                    "data": {
                        "earned": earned,
                        "new_balance": new_balance + bonus,
                        "total_earned": total_earned + earned,
                        "end_time": end_time,
                        "bonus": bonus,
                    },
                    "message": "work session completed successfully",
                    "message_bonus": message_bonus,
                    "message_jail": message_jail,
                }
            else:
                return {
                    "success": True,
                    "message": f"Wait {time_left} seconds for your reward",
                }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=f"Ошибка сервера: {str(e)}") from e
    finally:
        if "conn" in locals():
            conn.close()


@router.post("/cancel")
def cancel(current_user: Any = Depends(get_current_user)):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM work_sessions WHERE user_id = ? AND completed = 0 LIMIT 1",
            (current_user["id"],),
        )
        rows = cursor.fetchone()
        if rows is None:
            raise HTTPException(status_code=400, detail="No work session found")
        else:
            cursor.execute(
                """
                DELETE FROM work_sessions WHERE user_id = ? AND completed = 0
                """,
                (current_user["id"],),
            )
            conn.commit()
            return {
                "success": True,
                "message": "work session cancelled successfully",
            }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=f"Ошибка сервера: {str(e)}") from e
    finally:
        if "conn" in locals():
            conn.close()


@router.post("/skip-jail")
def skip_jail(current_user: Any = Depends(get_current_user)):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM work_sessions WHERE user_id = ? AND completed = 1 AND jailed = 1 ",
            (current_user["id"],),
        )
        jail_row = cursor.fetchone()
        if jail_row:
            cursor.execute(
                "UPDATE work_sessions SET jailed = 0 WHERE user_id = ? AND completed = 1",
                (current_user["id"],),
            )
            conn.commit()
            rows = cursor.rowcount
            if rows == 0:
                raise HTTPException(status_code=400, detail="No jail found")
            else:
                return {
                    "success": True,
                    "message_jail": "Jail skipped",
                }
        else:
            return {
                "success": True,
                "message_jail": "User is not jailed",
            }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=f"Ошибка сервера: {str(e)}") from e
    finally:
        if "conn" in locals():
            conn.close()
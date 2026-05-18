import os
import sqlite3

DB_NAME = "freezino.db"


def reset_database():
    if os.path.exists(DB_NAME):
        os.remove(DB_NAME)
        print("Old database deleted.")
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            balance REAL DEFAULT 0,
            avatar TEXT DEFAULT NULL,
            total_work_time INTEGER DEFAULT 0,
            total_earned INTEGER DEFAULT 0,
            total_lost INTEGER DEFAULT 0,
            games_played INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """
    )
    cursor.execute(
        """
        CREATE TABLE work_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            job_type TEXT NOT NULL,
            start_time TEXT NOT NULL,
            duration INTEGER DEFAULT 180,
            completed INTEGER DEFAULT 0,
            earned INTEGER DEFAULT 0,
            end_time TEXT NOT NULL,
            jailed INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """
    )

    conn.commit()
    conn.close()

    print("New clean database created.")


if __name__ == "__main__":
    reset_database()

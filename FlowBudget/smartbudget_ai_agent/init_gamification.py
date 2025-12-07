import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "flowbudget_db")
    )

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    with open('gamification.sql', 'r', encoding='utf-8') as f:
        sql = f.read()
        
    for statement in sql.split(';'):
        if statement.strip():
            try:
                cursor.execute(statement)
                print(f"Executed: {statement[:50]}...")
            except Exception as e:
                print(f"Error executing statement: {e}")
                
    conn.commit()
    cursor.close()
    conn.close()
    print("Gamification tables initialized.")

if __name__ == "__main__":
    init_db()

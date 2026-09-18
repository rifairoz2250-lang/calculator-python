from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import get_connection


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Calculation(BaseModel):
    num1: float
    num2: float
    operator: str


@app.get("/")
def home():
    return {
        "message": "Calculator Backend is Running"
    }


@app.post("/calculate")
def calculate(data: Calculation):

    if data.operator == "+":
        result = data.num1 + data.num2

    elif data.operator == "-":
        result = data.num1 - data.num2

    elif data.operator == "*":
        result = data.num1 * data.num2

    elif data.operator == "/":
        if data.num2 == 0:
            return {
                "error": "Cannot divide by zero"
            }

        result = data.num1 / data.num2

    elif data.operator == "%":
        result = data.num1 % data.num2

    else:
        return {
            "error": "Invalid operator"
        }


    conn = get_connection()
    cursor = conn.cursor()


    cursor.execute(
        """
        INSERT INTO calculations
        (num1, num2, operator, result)
        VALUES (%s, %s, %s, %s)
        """,
        (
            data.num1,
            data.num2,
            data.operator,
            result
        )
    )


    conn.commit()

    cursor.close()
    conn.close()


    return {
        "num1": data.num1,
        "num2": data.num2,
        "operator": data.operator,
        "result": result
    }


@app.get("/history")
def get_history():

    conn = get_connection()
    cursor = conn.cursor()


    cursor.execute(
        """
        SELECT id, num1, num2, operator, result, created_at
        FROM calculations
        ORDER BY id DESC
        """
    )


    rows = cursor.fetchall()


    cursor.close()
    conn.close()


    history = []


    for row in rows:

        history.append({
            "id": row[0],
            "num1": row[1],
            "num2": row[2],
            "operator": row[3],
            "result": row[4],
            "created_at": row[5]
        })


    return history


@app.delete("/history")
def clear_history():

    conn = get_connection()
    cursor = conn.cursor()


    cursor.execute(
        "DELETE FROM calculations"
    )


    conn.commit()


    cursor.close()
    conn.close()


    return {
        "message": "History cleared successfully"
    }
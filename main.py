from fastapi import FastAPI

app = FastAPI(title="Coding Evaluation Platform API")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Coding Evaluation Platform API!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# 실행 방법: 터미널에서 아래 명령어 입력
# uvicorn main:app --reload

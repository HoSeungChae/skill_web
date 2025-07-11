# 1. Python 기반 이미지
FROM python:3.11-slim

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 패키지 파일 복사 및 설치
COPY ./app /app

# 4. 종속성 설치
RUN pip install --upgrade pip
RUN pip install fastapi uvicorn sqlalchemy psycopg2-binary

# 5. 포트 개방
EXPOSE 8000

# 6. 실행
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

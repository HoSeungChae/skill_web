# 1. Node 기반 이미지 사용
FROM node:20-alpine

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 종속성 설치
COPY package.json package-lock.json ./
RUN npm install

# 4. 소스 코드 복사
COPY . .

# 5. 빌드
RUN npm run build

# 6. 포트 개방
EXPOSE 3000

# 7. 실행
CMD ["npm", "run", "start"]

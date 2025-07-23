# 1. Node 기반 이미지 사용
FROM node:20

# 2. 앱 디렉토리 만들고 이동
WORKDIR /usr/src/app

# 3. 의존성 설치용 파일 복사
COPY package*.json ./

# 4. 의존성 설치
RUN npm install

# 5. 소스 전체 복사
COPY . .

# 6. 빌드
RUN npm run build

# 7. 포트 노출 (Remix 기본 포트)
EXPOSE 3000

# 8. 앱 실행
CMD [ "npm", "run", "start" ]

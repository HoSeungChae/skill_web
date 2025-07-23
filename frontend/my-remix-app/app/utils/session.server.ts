// app/utils/session.server.ts
import { createCookieSessionStorage } from "@remix-run/node";

// .env에 정의된 세션 시크릿을 사용하거나 기본값 사용
const sessionSecret = process.env.SESSION_SECRET || "super-secret-default";

if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

// 세션 저장소 생성
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session", // 쿠키 이름
    secrets: [sessionSecret], // 쿠키 서명에 사용할 시크릿
    sameSite: "lax",          // CSRF 방지 설정
    path: "/",                // 모든 경로에 대해 쿠키 적용
    httpOnly: true,           // JS로 접근 불가능
    secure: process.env.NODE_ENV === "production", // 배포 환경에서만 HTTPS 요구
  },
});

// 세션 객체 가져오기 (쿠키 헤더에서)
export const getSession = (cookieHeader?: string | null) => {
  return sessionStorage.getSession(cookieHeader);
};

// 세션 커밋 (응답 헤더에 Set-Cookie로 붙이기)
export const commitSession = sessionStorage.commitSession;

// 세션 삭제 (로그아웃 시 사용)
export const destroySession = sessionStorage.destroySession;

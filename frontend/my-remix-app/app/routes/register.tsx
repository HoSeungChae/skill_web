// app/routes/register.tsx

import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useActionData, Link } from "@remix-run/react";
import * as bcrypt from "bcryptjs";
import { getSession, commitSession } from "~/utils/session.server";
import { db } from "~/utils/db.server";
import { containerStyle } from "app/styles/style.ts";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("login_id")) return redirect("/");
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";
  const confirm = formData.get("confirm")?.toString() || "";

  if (!email || !password || !confirm) {
    return json({ error: "모든 항목을 입력해주세요." }, { status: 400 });
  }
  if (password !== confirm) {
    return json({ error: "비밀번호가 일치하지 않습니다." }, { status: 400 });
  }

  const existingUser = await db.findUserByEmail(email);
  if (existingUser) {
    return json({ error: "이미 등록된 이메일입니다." }, { status: 400 });
  }

  const pw_hash = await bcrypt.hash(password, 10);
  const newUser = await db.insertUserToLoginInfo({ email, pw_hash });

  const session = await getSession();
  session.set("login_id", newUser.login_id);

  return redirect("/user/new", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function Register() {
  const actionData = useActionData<typeof action>();

  return (
    <div style={containerStyle}>
      <h1 style={{ marginBottom: "24px" }}>회원가입</h1>

      {actionData?.error && (
        <p style={{ color: "red", marginBottom: "16px" }}>{actionData.error}</p>
      )}

      <Form method="post" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ textAlign: "left" }}>
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            name="email"
            required
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "4px"
            }}
          />
          <button
            type="button"
            style={{
              marginTop: "8px",
              padding: "6px 12px",
              backgroundColor: "hsl(224, 98%, 58%)",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            이메일 인증코드 발송
          </button>
        </div>

        <div style={{ textAlign: "left" }}>
          <label htmlFor="emailCode">인증코드 입력</label>
          <input
            type="text"
            name="emailCode"
            placeholder="인증코드를 입력하세요"
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "4px"
            }}
          />
          <button
            type="button"
            style={{
              marginTop: "8px",
              padding: "6px 12px",
              backgroundColor: "gray",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            확인
          </button>
        </div>

        <div style={{ textAlign: "left" }}>
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            name="password"
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ textAlign: "left" }}>
          <label htmlFor="confirm">비밀번호 재확인</label>
          <input
            type="password"
            name="confirm"
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "10px",
            backgroundColor: "white",
            color: "hsl(224, 98%, 58%)",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          회원가입
        </button>
      </Form>

      <p style={{ marginTop: "16px", fontSize: "14px" }}>
        이미 계정이 있으신가요?{" "}
        <Link to="/login" style={{ color: "hsl(224, 98%, 58%)", textDecoration: "none" }}>
          로그인
        </Link>
      </p>
    </div>
  );
}

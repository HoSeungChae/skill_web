// app/routes/login.tsx
import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, Link } from "@remix-run/react";
import { getSession, commitSession } from "../utils/session.server";
import { db } from "../utils/db.server";
import bcrypt from "bcryptjs";
import { containerStyle } from "app/styles/style.ts";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  if (userId) {
    return redirect("/"); // 이미 로그인된 경우 홈으로
  }

  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await db.findUserByEmail(email);
  if (!user || !user.pw_hash) {
    return json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 400 });
  }

  const isValid = await bcrypt.compare(password, user.pw_hash);
  if (!isValid) {
    return json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 400 });
  }

  const session = await getSession();
  session.set("userId", user.login_id);

  return redirect("/user/new", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();

  return (
    <div style={containerStyle}>
      <h1 style={{fontSize:"2rem", marginBottom:"1.5rem"}}>로그인</h1>
      <Form method="post">
        <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center"}}>
     <label htmlFor="email" style={{ minWidth: "80px" }}>이메일</label>
     <input
       id="email"
       name="email"
       type="email"
       required
       style={{
         flex: 1,
         padding: "6px",
         borderRadius: "5px",
         }}/>
     </div>
     <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center" }}>
      <label htmlFor="password" style={{ minWidth: "80px" }}>비밀번호</label>
      <input
        id="password"
        name="password"
        type="password"
        required
        style={{
          flex: 1,
         padding: "6px",
         borderRadius: "5px",
         }}/>
    </div>

        {actionData?.error && (
          <p style={{ color: "red" }}>{actionData.error}</p>
        )}
        <button type="submit">로그인</button>
      </Form>

      {/* ✅ 회원가입 링크 추가 */}
      <div style={{
        justifyContent:"center",
        marginTop: "1rem" ,
        display: "flex", 
        gap: "0.3rem",
        fontSize: "14px"}}>
        <span>계정이 없으신가요?</span>
        <Link to="/register" style={{color: "#007bff",
            textDecoration: "none"
         }}>
           회원가입
        </Link>
      </div>
     <Link to="/find-pw" style={{
      color: "#007bff",
      textDecoration: "none",
      fontSize: "14px",
      }}>비밀번호 찾기</Link>
    </div>
  );
}

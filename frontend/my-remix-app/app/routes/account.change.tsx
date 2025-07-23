// account/change.tsx
import { LoaderFunctionArgs, ActionFunctionArgs, redirect, json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import bcrypt from "bcryptjs";
import { getSession } from "~/utils/session.server";
import { db } from "~/utils/db.server"; // ✅ 공유 db 인스턴스 사용

type ActionError = { error: string };

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const loginId = session.get("userId");

  if (!loginId) return redirect("/login");

  return json({ loginId });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const loginId = formData.get("login_id")?.toString();
  const currentPassword = formData.get("current_password")?.toString();
  const newEmail = formData.get("email")?.toString();
  const newPassword = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirm_password")?.toString();

  if (!loginId || typeof loginId !== "string") {
    return json({ error: "세션 정보가 유효하지 않습니다." });
  }

  // 비밀번호 일치 여부 확인
  if (newPassword !== confirmPassword) {
    return json({ error: "새 비밀번호가 일치하지 않습니다." });
  }

  const loginInfo = await db.findUserByLoginId(Number(loginId));
  if (!loginInfo) {
    return json({ error: "사용자 정보를 찾을 수 없습니다." });
  }

  const pwMatches = await bcrypt.compare(currentPassword || "", loginInfo.pw_hash);
  if (!pwMatches) {
    return json({ error: "현재 비밀번호가 올바르지 않습니다." });
  }

  const updates: { email?: string; pw_hash?: string } = {};
  if (newEmail) updates.email = newEmail;
  if (newPassword) updates.pw_hash = await bcrypt.hash(newPassword, 10);

  await db.updateLoginInfo(Number(loginId), updates);
  return redirect("/user");
}

export default function AccountChangePage() {
  const { loginId } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionError>();

  return (
    <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>🔑비밀번호 변경</h1>
      <Form method="post">
        <input type="hidden" name="login_id" value={loginId} />

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="current_password">현재 비밀번호:</label>
          <input type="password" name="current_password" id="current_password" required />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password">새 비밀번호:</label>
          <input type="password" name="password" id="password" required />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="confirm_password">새 비밀번호 확인:</label>
          <input type="password" name="confirm_password" id="confirm_password" required />
        </div>

        <button
          type="submit"
          style={{
            padding: "0.5rem 1.2rem",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          변경하기
        </button>

        {actionData?.error && (
          <p style={{ color: "red", marginTop: "1rem" }}>{actionData.error}</p>
        )}
      </Form>
    </main>
  );
}

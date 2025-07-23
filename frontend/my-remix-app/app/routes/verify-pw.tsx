import { json, redirect, ActionFunctionArgs } from "@remix-run/node";
import { getSession, commitSession } from "~/utils/session.server";
import { db } from "~/utils/db.server";
import bcrypt from "bcryptjs";

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const loginId = session.get("userId");
  const formData = await request.formData();
  const password = formData.get("password")?.toString();

  if (!loginId || !password) {
    return json({ error: "잘못된 접근입니다." }, { status: 400 });
  }

  const user = await db.findUserByLoginId(loginId);
  const isValid = await bcrypt.compare(password, user.pw_hash);

  if (!isValid) {
    return json({ error: "비밀번호가 일치하지 않습니다." }, { status: 401 });
  }

  // ✅ 비밀번호 일치하면 세션에 플래그 추가
  session.set("pwVerified", true);
  return redirect("/account/change", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

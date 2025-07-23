import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, Form, useNavigate } from "@remix-run/react";
import { getSession } from "~/utils/session.server";
import { db } from "~/utils/db.server";
import { useState } from "react";

// 직급 ID → 직급명
const positionMap: Record<number, string> = {
  10: "사원",
  20: "주임",
  30: "대리",
  40: "가장",
  50: "차장",
  60: "부장",
};

// 부서 ID → 부서명
const departmentMap: Record<number, string> = {
  11: "인사그룹",
  12: "경리그룹",
  13: "청무그룹",
  20: "영업보부",
  31: "개발부",
  32: "개발부 한국지사",
  33: "교육그룹",
  34: "AI솔루션그룹",
  41: "제1그룹",
  42: "제2그룹",
  43: "제3그룹",
  44: "제4그룹",
  51: "설계품질그룹",
  52: "토호커사업소",
  53: "후쿠오카사업부",
  54: "스마트에너지솔루션부",
  60: "품질관리부",
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const loginId = session.get("userId");

  if (!loginId) {
    return json({ loginId: null, userInfo: null });
  }

  const userInfo = await db.findUserInfoByLoginId(loginId);
  return json({ loginId, userInfo });
}

export default function Index() {
  const { loginId, userInfo } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleVerify() {
    const res = await fetch("/verify-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.success) {
      navigate("/account/change");
    } else {
      setError("비밀번호가 맞지 않습니다.");
    }
  }

  if (!loginId) {
    return (
      <main style={{ padding: "2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
          👋 환영합니다! 로그인해주세요.
        </h2>
        <Link to="/login">
          <button style={buttonStyle}>🔐 로그인 하러가기</button>
        </Link>
      </main>
    );
  }

  if (!userInfo) {
    return (
      <>
        <main style={{ padding: "2rem", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
            환영합니다! 아직 개인정보가 등록되지 않았습니다.
          </h2>
          <Link to="/user/new">
            <button style={buttonStyle}>➕ 개인정보 입력</button>
          </Link>
        </main>

        <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Form method="post" action="/logout">
            <button style={{ ...buttonStyle, backgroundColor: "#6b7280" }}>🚪 로그아웃</button>
          </Form>
        </div>
      </>
    );
  }

  const positionName = positionMap[userInfo.position_id] || `직급 ID ${userInfo.position_id}`;
  const departmentName = departmentMap[userInfo.department_low_id] || `부서 ID ${userInfo.department_low_id}`;

  return (
    <main style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>
        👋 환영합니다, {userInfo.first_name}{userInfo.last_name} 님!
      </h1>

      <ul style={{ marginTop: "1.5rem", lineHeight: 1.8 }}>
        <li>사원번호: {userInfo.employee_number}</li>
        <li>직급: {positionName}</li>
        <li>부서: {departmentName}</li>
        <li>입사일: {new Date(userInfo.career_start_date).toLocaleDateString("ko-KR")}</li>
      </ul>

      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link to="/certificate/new">
          <button style={buttonStyle}>📄 자격증 입력</button>
        </Link>

        <Link to="/language/new">
          <button style={buttonStyle}>🗣 어학자격증</button>
        </Link>

        <Link to="/user/edit">
          <button style={buttonStyle}>👤 개인정보 수정</button>
        </Link>

        <button style={buttonStyle} onClick={() => setShowModal(true)}>
          🔑PW 변경
        </button>

        <Form method="post" action="/logout">
          <button style={{ ...buttonStyle, backgroundColor: "#6b7280" }}>🚪 로그아웃</button>
        </Form>
      </div>

      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}>
          <div style={{ background: "white", padding: "2rem", borderRadius: "8px", minWidth: "300px" }}>
            <h3 style={{ marginBottom: "1rem" }}>비밀번호 확인</h3>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="현재 비밀번호"
              style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
            />
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button onClick={() => setShowModal(false)} style={{ ...buttonStyle, backgroundColor: "gray" }}>
                취소
              </button>
              <button onClick={handleVerify} style={buttonStyle}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: "0.75rem 1.5rem",
  backgroundColor: "#2563eb",
  color: "#fff",
  fontSize: "1rem",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

// app/routes/usernew.success.tsx
import { Link } from "@remix-run/react";

export default function UserNewSuccess() {
  return (
    <main style={{ maxWidth: 600, margin: "4rem auto", textAlign: "center" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#22c55e" }}>✅ 개인정보 등록 완료!</h1>
      <p style={{ fontSize: "1rem", marginBottom: "2rem" }}>
        이제 서비스를 자유롭게 이용하실 수 있습니다.
      </p>
      <Link to="/">
        <button style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "1rem"
        }}>
          홈으로 이동 →
        </button>
      </Link>
    </main>
  );
}

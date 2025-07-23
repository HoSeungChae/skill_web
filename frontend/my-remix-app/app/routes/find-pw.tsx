import { useState } from "react";
import { containerStyle } from "app/styles/style";

export default function FindPassword() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!name.trim()) {
      setError("이름을 입력해 주세요.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("올바른 이메일을 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);

    // 서버 연동 전임으로 2초 대기 (예시)
    await new Promise((res) => setTimeout(res, 2000));

    setIsSubmitting(false);
    setSuccessMsg("임시 비밀번호를 이메일로 보냈습니다.");
    setName("");
    setEmail("");
  }

  return (
    <div style={containerStyle}>
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 600,
          textAlign: "center",
          marginBottom: "1.5rem",
        }}
      >
        비밀번호 찾기
      </h1>

      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "center",
          textAlign: "center",
          width: "100%",
          maxWidth: 320,
          margin: "0 auto",
        }}
      >
        <label
          htmlFor="name"
          style={{
            fontWeight: 500,
            fontSize: "0.9rem",
            color: "#374151",
            display: "block",
            width: "100%",
          }}
        >
          이름
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              marginTop: "0.5rem",
              width: "100%",
              padding: "0.5rem",
              border: error && !name.trim() ? "1.5px solid red" : "1px solid #D1D5DB",
              borderRadius: "0.25rem",
              outline: "none",
              boxShadow: error && !name.trim() ? "0 0 5px rgba(255,0,0,0.5)" : "none",
              fontSize: "1rem",
            }}
            disabled={isSubmitting}
          />
        </label>

        <label
          htmlFor="email"
          style={{
            fontWeight: 500,
            fontSize: "0.9rem",
            color: "#374151",
            display: "block",
            width: "100%",
          }}
        >
          가입한 이메일
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              marginTop: "0.5rem",
              width: "100%",
              padding: "0.5rem",
              border:
                error && (!emailRegex.test(email) || !email.trim())
                  ? "1.5px solid red"
                  : "1px solid #D1D5DB",
              borderRadius: "0.25rem",
              outline: "none",
              boxShadow:
                error && (!emailRegex.test(email) || !email.trim())
                  ? "0 0 5px rgba(255,0,0,0.5)"
                  : "none",
              fontSize: "1rem",
            }}
            disabled={isSubmitting}
          />
        </label>

        {error && (
          <p style={{ color: "red", fontWeight: 500, marginTop: "-0.5rem" }}>
            {error}
          </p>
        )}

        {successMsg && (
          <p
            style={{
              color: "green",
              fontWeight: 500,
              marginTop: "0.1rem",
              marginBottom: "0.1rem",
            }}
          >
            {successMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "0.75rem",
            backgroundColor: isSubmitting ? "#94a3b8" : "#2563EB",
            color: "white",
            border: "none",
            borderRadius: "0.375rem",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            transition: "background-color 0.2s ease",
            width: "100%",
          }}
        >
          {isSubmitting ? "전송 중..." : "이메일로 임시 비밀번호 받기"}
        </button>
      </form>
    </div>
  );
}
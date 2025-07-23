import { Form } from "@remix-run/react";
import { useState } from "react";

interface LanguageEntry {
  id: number;
  type: "공인시험" | "회화능력";
  language: string;
  examName?: string;
  grade: string;
  acquiredAt?: string;
  speakingLevel?: string;
}

// 향후 외국어에 따라 시험명을 동적으로 설정할 수 있도록 미리 정의된 구조
const examOptionsByLanguage: Record<string, string[]> = {
  일본어: ["JLPT", "JPT"],
  영어: ["TOEIC", "TOEFL", "IELTS"],
  중국어: ["HSK"]
};

const gradeOptions = ["1급", "2급", "3급", "4급", "5급", "6급"];

export default function LanguageNew() {
  const [entries, setEntries] = useState<LanguageEntry[]>([createEmptyEntry(1)]);

  function createEmptyEntry(id: number): LanguageEntry {
    return {
      id,
      type: "공인시험",
      language: "",
      examName: "",
      grade: "",
      acquiredAt: "",
      speakingLevel: "",
    };
  }

  const handleAdd = () => {
    setEntries((prev) => [...prev, createEmptyEntry(prev.length + 1)]);
  };

  const handleRemove = (id: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleChange = (id: number, field: keyof LanguageEntry, value: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value, ...(field === "language" ? { examName: "" } : {}) } : e))
    );
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>🗣 어학능력 등록</h2>

      <Form method="post">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {entries.map((entry) => (
            <div
              key={entry.id}
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "flex-end",
                padding: "1rem",
                border: "1px solid #ccc",
                borderRadius: "6px",
              }}
            >
              <div style={{ flex: 2 }}>
                <label style={labelStyle}>구분
                  <select
                    name={`type-${entry.id}`}
                    value={entry.type}
                    onChange={(e) => handleChange(entry.id, "type", e.target.value)}
                    required
                    style={selectStyle}
                  >
                    <option value="공인시험">공인시험</option>
                    <option value="회화능력">회화능력</option>
                  </select>
                </label>
              </div>
              <div style={{ flex: 2 }}>
                <label style={labelStyle}>외국어명
                  <select
                    name={`language-${entry.id}`}
                    value={entry.language}
                    onChange={(e) => handleChange(entry.id, "language", e.target.value)}
                    required
                    style={selectStyle}
                  >
                    <option value="">선택</option>
                    <option value="일본어">일본어</option>
                    <option value="영어">영어</option>
                    <option value="중국어">중국어</option>
                  </select>
                </label>
              </div>
              <div style={{ flex: 2 }}>
                {entry.type === "공인시험" ? (
                  <label style={labelStyle}>시험명
                    <select
                      name={`examName-${entry.id}`}
                      value={entry.examName}
                      onChange={(e) => handleChange(entry.id, "examName", e.target.value)}
                      required
                      style={selectStyle}
                      disabled={!entry.language}
                    >
                      <option value="">선택</option>
                      {(examOptionsByLanguage[entry.language] || []).map((exam) => (
                        <option key={exam} value={exam}>{exam}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label style={labelStyle}>회화 수준
                    <select
                      name={`speakingLevel-${entry.id}`}
                      value={entry.speakingLevel}
                      onChange={(e) => handleChange(entry.id, "speakingLevel", e.target.value)}
                      required
                      style={selectStyle}
                    >
                      <option value="">선택</option>
                      <option value="일상회화 가능">일상회화 가능</option>
                      <option value="비즈니스 회화가능">비즈니스 회화가능</option>
                      <option value="원어민 수준">원어민 수준</option>
                    </select>
                  </label>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>급수
                  <select
                    name={`grade-${entry.id}`}
                    value={entry.grade}
                    onChange={(e) => handleChange(entry.id, "grade", e.target.value)}
                    required
                    style={selectStyle}
                  >
                    <option value="">선택</option>
                    {gradeOptions.map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>취득일
                  <input
                    type="month"
                    name={`acquiredAt-${entry.id}`}
                    value={entry.acquiredAt}
                    onChange={(e) => handleChange(entry.id, "acquiredAt", e.target.value)}
                    style={inputStyle}
                  />
                </label>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => handleRemove(entry.id)}
                  style={removeButtonStyle}
                >
                  X
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAdd}
            style={addButtonStyle}
          >
            + 어학 추가
          </button>

          <button
            type="submit"
            style={buttonStyle}
          >
            저장
          </button>
        </div>
      </Form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px",
  marginTop: "4px",
  borderRadius: "4px",
  border: "1px solid #ccc",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  fontSize: "0.9rem",
  fontWeight: 500,
};

const addButtonStyle: React.CSSProperties = {
  padding: "0.3rem 0.8rem",
  backgroundColor: "#f1f5f9",
  color: "#2563eb",
  fontWeight: 600,
  border: "1px dashed #2563eb",
  borderRadius: "4px",
  cursor: "pointer",
};

const removeButtonStyle: React.CSSProperties = {
  backgroundColor: "transparent",
  border: "none",
  fontSize: "1.2rem",
  color: "#999",
  cursor: "pointer",
};

const buttonStyle: React.CSSProperties = {
  padding: "0.75rem",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
};

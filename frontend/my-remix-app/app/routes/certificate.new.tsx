import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { getSession } from "~/utils/session.server";
import { db } from "~/utils/db.server";
import { useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const loginId = session.get("userId");
  if (!loginId) return redirect("/login");
  return json({ loginId });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const loginId = session.get("userId");
  if (!loginId) return redirect("/login");

  const formData = await request.formData();
  const certs = JSON.parse(formData.get("certificates") as string);

  for (const cert of certs) {
    const { cert_name, issuer, issue_date, expire_date } = cert;
    if (!cert_name || !issuer || !issue_date) continue;

    await db.insertUserCertificate({
      login_id: loginId,
      cert_name,
      issuer,
      issue_date,
      expire_date: expire_date || null,
      create_user: "system",
      update_user: "system",
    });
  }

  return redirect("/");
}

export default function CertificateNew() {
  const actionData = useActionData<typeof action>();
  const [certificates, setCertificates] = useState([
    { cert_name: "", issuer: "", issue_date: "", expire_date: "" },
  ]);

  const handleChange = (index: number, field: string, value: string) => {
    const newCerts = [...certificates];
    newCerts[index][field] = value;
    setCertificates(newCerts);
  };

  const handleAdd = () => {
    setCertificates([...certificates, { cert_name: "", issuer: "", issue_date: "", expire_date: "" }]);
  };

  const handleRemove = (index: number) => {
    const newCerts = certificates.filter((_, i) => i !== index);
    setCertificates(newCerts);
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        📄 자격증 정보 등록
      </h2>

      {actionData?.error && (
        <p style={{ color: "red", marginBottom: "1rem" }}>{actionData.error}</p>
      )}

      <Form method="post">
        <input type="hidden" name="certificates" value={JSON.stringify(certificates)} />

        {certificates.map((cert, index) => (
          <div key={index} style={{ display: "flex", gap: "1rem", alignItems: "flex-end", marginBottom: "1rem", border: "1px solid #ccc", padding: "1rem", borderRadius: "6px" }}>
            <div style={{ flex: 2 }}>
              <label style={labelStyle}>자격증 명
                <input
                  type="text"
                  value={cert.cert_name}
                  onChange={(e) => handleChange(index, "cert_name", e.target.value)}
                  required
                  style={inputStyle}
                />
              </label>
            </div>
            <div style={{ flex: 2 }}>
              <label style={labelStyle}>발행처
                <input
                  type="text"
                  value={cert.issuer}
                  onChange={(e) => handleChange(index, "issuer", e.target.value)}
                  required
                  style={inputStyle}
                />
              </label>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>취득일
                <input
                  type="month"
                  value={cert.issue_date}
                  onChange={(e) => handleChange(index, "issue_date", e.target.value)}
                  required
                  style={inputStyle}
                />
              </label>
            </div>
            <div>
              <button type="button" onClick={() => handleRemove(index)} style={removeButtonStyle}>X</button>
            </div>
          </div>
        ))}

        <div style={{ marginBottom: "1rem" }}>
          <button type="button" onClick={handleAdd} style={addButtonStyle}>+ 자격증 추가</button>
        </div>

        <button type="submit" style={buttonStyle}>등록</button>
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

const buttonStyle: React.CSSProperties = {
  padding: "0.5rem 1.5rem",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
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

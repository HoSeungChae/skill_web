// 📁 app/routes/user/new.tsx
import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { getSession } from "~/utils/session.server";
import { db } from "~/utils/db.server";
import { useState } from "react";
import {
  containerStyle, nameRowStyle, nameLabelStyle, nameInputStyle,
  birthlabelStyle, birthspanStyle, birthinputStyle,
  phoneLabelStyle, phoneSpanStyle, phoneInputStyle,
  addressLabelStyle, addressSpanStyle, addressInputStyle
} from "~/styles/style";

const departmentOptions: Record<string, { title: string; id: number }[]> = {
  "개발본부": [
    { title: "개발부", id: 31 },
    { title: "개발부 한국지사", id: 32 },
    { title: "교육그룹", id: 33 },
    { title: "AI솔루션그룹", id: 34 },
  ],
  "ICT본부": [
    { title: "제1그룹", id: 41 },
    { title: "제2그룹", id: 42 },
    { title: "제3그룹", id: 43 },
    { title: "제4그룹", id: 44 },
  ],
  "사회인프라사업부": [
    { title: "설계품질그룹", id: 51 },
    { title: "토호쿠사업소", id: 52 },
    { title: "후쿠오카사업부", id: 53 },
    { title: "스마트에너지솔루션부", id: 54 },
  ],
  "경영지원실": [
    { title: "인사그룹", id: 11 },
    { title: "경리그룹", id: 12 },
    { title: "총무그룹", id: 13 },
  ],
  "영업본부": [
    { title: "영업본부", id: 20 },
  ],
  "품질관리부": [
    { title: "품질관리부", id: 60 },
  ],
};

const addressOptions = [
  { title: "오사키", id: 10100100 },
  { title: "긴자", id: 10200200 },
  { title: "우메다", id: 20100300 },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const loginId = session.get("userId");
  if (!loginId) return redirect("/login");

  const loginInfo = await db.findLoginInfoById(loginId);
  if (!loginInfo) return redirect("/login");

  const userInfo = await db.findUserInfoByLoginId(loginId);
  if (userInfo) return redirect("/");

  return json({ loginId, email: loginInfo.email });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const loginId = session.get("userId");
  if (!loginId) return redirect("/login");

  const formData = await request.formData();

  const loginInfo = await db.findLoginInfoById(loginId);
  const email = loginInfo.email;

  const birth_date = formData.get("birth") as string;
  const nationality = formData.get("nationality") as string;
  const employee_number = formData.get("employee_number") as string;
  const position = formData.get("position") as string;
  const address_low_code = formData.get("address_low_code") as string;

  if (!birth_date || !/\d{4}-\d{2}-\d{2}/.test(birth_date)) {
    return json({ error: "유효한 생년월일 형식을 입력해주세요 (YYYY-MM-DD)." }, { status: 400 });
  }
  if (!nationality || !employee_number || !address_low_code) {
    return json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
  }

  const validPositions = [
    "staff", "assistant_manager", "manager",
    "senior_manager", "deputy_general_manager", "general_manager",
  ];
  if (!validPositions.includes(position)) {
    return json({ error: "유효한 직급을 선택해주세요." }, { status: 400 });
  }

  await db.insertUserInfo({
    loginId,
    email,
    first_name: formData.get("first") as string,
    last_name: formData.get("last") as string,
    first_name_kana: formData.get("first_kana") as string,
    last_name_kana: formData.get("last_kana") as string,
    birth_date,
    nationality,
    employee_number,
    phone_number: formData.get("phonenumber") as string,
    address: Number(address_low_code),
    gender_id:
      formData.get("gender") === "male"
        ? 1
        : formData.get("gender") === "female"
        ? 2
        : 3,
    position_id: {
      staff: 10,
      assistant_manager: 20,
      manager: 30,
      senior_manager: 40,
      deputy_general_manager: 50,
      general_manager: 60,
    }[position],
    upper_department: formData.get("upper_department") as string,
    lower_department: Number(formData.get("lower_department")),
    career_start_date: formData.get("career_start_date") as string,
  });

  return redirect("/");
}

export default function NewUserForm() {
  const { loginId, email } = useLoaderData<typeof loader>();
  const [upperDept, setUpperDept] = useState("");
  const [lowerDept, setLowerDept] = useState("");

  return (
    <Form method="post" style={{ maxWidth: 800, margin: "auto", padding: "2rem" }}>
      <h1>개인정보 등록 (Login ID: {loginId})</h1>

      <p style={nameRowStyle}>
        <span style={nameLabelStyle}>Name</span>
        <input name="first" placeholder="First" type="text" required style={nameInputStyle} />
        <input name="last" placeholder="Last" type="text" required style={nameInputStyle} />
      </p>

      <p style={nameRowStyle}>
        <span style={nameLabelStyle}>Name Kana</span>
        <input name="first_kana" placeholder="First Kana" type="text" required style={nameInputStyle} />
        <input name="last_kana" placeholder="Last Kana" type="text" required style={nameInputStyle} />
      </p>

      <label style={birthlabelStyle}>
        <span style={birthspanStyle}>Email</span>
        <input name="email" type="email" value={email} readOnly style={{ ...birthinputStyle, backgroundColor: "#f5f5f5", color: "#888" }} />
      </label>

      <label style={birthlabelStyle}>
        <span style={birthspanStyle}>Birth</span>
        <input name="birth" type="date" required style={birthinputStyle} />
      </label>

      <label style={birthlabelStyle}>
        <span style={birthspanStyle}>Nationality</span>
        <input name="nationality" type="text" required style={birthinputStyle} />
      </label>

      <label style={birthlabelStyle}>
        <span style={birthspanStyle}>Employee Number</span>
        <input name="employee_number" type="text" required style={birthinputStyle} />
      </label>

      <fieldset style={{ border: "none", padding: 0, marginBottom: "1rem" }}>
        <legend style={{ marginBottom: "0.5rem" }}>Gender</legend>
        <div style={{ display: "flex", gap: "1rem" }}>
          <label><input type="radio" name="gender" value="male" required /> Male</label>
          <label><input type="radio" name="gender" value="female" /> Female</label>
          <label><input type="radio" name="gender" value="others" /> Others</label>
        </div>
      </fieldset>

      <label style={phoneLabelStyle}>
        <span style={phoneSpanStyle}>Phone number</span>
        <input name="phonenumber" placeholder="08012345678" type="tel" required style={phoneInputStyle} />
      </label>

      <label style={addressLabelStyle}>
        <span style={addressSpanStyle}>Address</span>
        <select name="address_low_code" required style={addressInputStyle}>
          <option value="">Choose</option>
          {addressOptions.map(({ title, id }) => (
            <option key={id} value={id}>{title}</option>
          ))}
        </select>
      </label>

      <fieldset style={{ border: "none", padding: 0, marginBottom: "1rem" }}>
        <label htmlFor="position" style={{ display: "block", marginBottom: "0.5rem" }}>Position</label>
        <select
          name="position"
          id="position"
          required
          style={{ padding: "0.5rem", fontSize: "14px", borderRadius: "4px", border: "1px solid #ccc", minWidth: "200px" }}
        >
          <option value="">직급 선택</option>
          <option value="staff">사원</option>
          <option value="assistant_manager">주임</option>
          <option value="manager">대리</option>
          <option value="senior_manager">과장</option>
          <option value="deputy_general_manager">차장</option>
          <option value="general_manager">부장</option>
        </select>
      </fieldset>

      <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", marginBottom: "1rem" }}>
        <label style={{ display: "flex", flexDirection: "column", minWidth: "180px" }}>
          <span style={{ marginBottom: "6px", fontWeight: 400, fontSize: 14 }}>Main department</span>
          <select
            name="upper_department"
            value={upperDept}
            onChange={(e) => {
              setUpperDept(e.target.value);
              setLowerDept("");
            }}
            required
            style={{ padding: "6px 10px", fontSize: "14px", borderRadius: "4px", border: "1px solid #ccc" }}
          >
            <option value="">Choose</option>
            {Object.keys(departmentOptions).map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </label>

        {upperDept && (
          <label style={{ display: "flex", flexDirection: "column", minWidth: "180px" }}>
            <span style={{ marginBottom: "6px", fontWeight: 400, fontSize: 14 }}>Sub department</span>
            <select
              name="lower_department"
              value={lowerDept}
              onChange={(e) => setLowerDept(e.target.value)}
              required
              style={{ padding: "6px 10px", fontSize: "14px", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="">Choose</option>
              {departmentOptions[upperDept].map(({ title, id }) => (
                <option key={id} value={id}>{title}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span>Career start date</span>
        <input name="career_start_date" type="date" required />
      </label>

      <p style={{ marginTop: "1rem" }}>
        <button type="submit">등록</button>
      </p>
    </Form>
  );
}

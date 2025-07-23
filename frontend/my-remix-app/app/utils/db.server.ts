import { Pool } from "pg";
import dotenv from "dotenv";

// .env 파일 로드
dotenv.config();

// PostgreSQL 연결 풀 생성
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;

export const db = {
  // 이메일로 login_info에서 유저 찾기
  async findUserByEmail(email: string) {
    const result = await pool.query(
      `SELECT * FROM login_info 
       WHERE email = $1 AND is_deleted = FALSE`,
      [email]
    );
    return result.rows[0];
  },

  // login_info 테이블에 유저 삽입
  async insertUserToLoginInfo({
    email,
    pw_hash,
    role_id = 20,
  }: {
    email: string;
    pw_hash: string;
    role_id?: number;
  }) {
    const result = await pool.query(
      `INSERT INTO login_info
        (email, pw_hash, role_id, create_user, update_user)
       VALUES ($1, $2, $3, $1, $1)
       RETURNING *`,
      [email, pw_hash, role_id]
    );
    return result.rows[0];
  },

  // login_id 기준으로 user_info에 등록된 사용자 찾기
  async findUserInfoByLoginId(login_id: number) {
    const result = await pool.query(
      `SELECT * FROM user_info 
       WHERE login_id = $1 AND is_deleted = FALSE`,
      [login_id]
    );
    return result.rows[0];
  },

  async getUserInfoByLoginId(loginId: number) {
    const result = await pool.query(
      `SELECT * FROM user_info WHERE login_id = $1 AND is_deleted = FALSE`,
      [loginId]
    );
    return result.rows[0];
  },

  // 🔽 로그인 ID 기준으로 email만 가져오기
  async findLoginInfoById(login_id: number) {
    const result = await pool.query(
      `SELECT email FROM login_info 
       WHERE login_id = $1 AND is_deleted = FALSE`,
      [login_id]
    );
    return result.rows[0];
  },

  // 🔽 로그인 ID 기준으로 전체 login_info 가져오기 (pw 포함)
  async findUserByLoginId(login_id: number) {
    const result = await pool.query(
      `SELECT * FROM login_info 
       WHERE login_id = $1 AND is_deleted = FALSE`,
      [login_id]
    );
    return result.rows[0];
  },

  // 🔽 로그인 정보 수정 (email, pw_hash)
  async updateLoginInfo(login_id: number, updates: { email?: string; pw_hash?: string }) {
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, val] of Object.entries(updates)) {
      fields.push(`${key} = $${index++}`);
      values.push(val);
    }

    if (fields.length === 0) return;

    values.push(login_id);
    await pool.query(
      `UPDATE login_info 
       SET ${fields.join(", ")}, update_user = 'system', updated_at = CURRENT_TIMESTAMP
       WHERE login_id = $${index}`,
      values
    );
  },

  async insertUserInfo(data: any) {
    const {
      loginId,
      email,
      first_name,
      last_name,
      first_name_kana,
      last_name_kana,
      birth_date,
      nationality,
      employee_number,
      phone_number,
      address,
      gender_id,
      position_id,
      upper_department,
      lower_department,
      career_start_date,
    } = data;

    console.log("insertUserInfo data:", {
      loginId,
      email,
      first_name,
      last_name,
      first_name_kana,
      last_name_kana,
      birth_date,
      nationality,
      employee_number,
      phone_number,
      address,
      gender_id,
      position_id,
      lower_department,
      career_start_date,
    });

    try {
      await pool.query(
        `INSERT INTO user_info (
          login_id, email, first_name, last_name, first_name_kana, last_name_kana,
          birth_date, nationality, employee_number, phone_number, address_low_code,
          gender_id, position_id, department_low_id, career_start_date,
          create_user, update_user
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, $13, $14, $15,
          'system', 'system'
        )`,
        [
          loginId,
          email,
          first_name,
          last_name,
          first_name_kana,
          last_name_kana,
          birth_date,
          nationality,
          employee_number,
          phone_number,
          address,
          gender_id,
          position_id,
          lower_department,
          career_start_date,
        ]
      );
    } catch (error: any) {
      console.error("insertUserInfo query error:", error);
      throw error;
    }
  },
};

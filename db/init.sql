-- 1. 로그인 정보 테이블
CREATE TABLE IF NOT EXISTS login_info (
    email VARCHAR(254) PRIMARY KEY,
    pw_hash VARCHAR(100) NOT NULL,
    login_fail_count INTEGER DEFAULT 0,
    last_login TIMESTAMPTZ
);

-- 2. 성별 테이블
CREATE TABLE IF NOT EXISTS gender (
    gender_id INTEGER PRIMARY KEY,
    gender_title VARCHAR(20) NOT NULL
);

-- 3. 직급 테이블
CREATE TABLE IF NOT EXISTS position (
    position_id INTEGER PRIMARY KEY,
    position_title VARCHAR(50) NOT NULL
);

-- 4-1. 주소 상위 테이블
CREATE TABLE IF NOT EXISTS address_high (
    address_high_code INTEGER PRIMARY KEY,
    address_high_title VARCHAR(50) NOT NULL
);

-- 4-2. 주소 중간 테이블
CREATE TABLE IF NOT EXISTS address_mid (
    address_mid_code INTEGER PRIMARY KEY,
    address_mid_title VARCHAR(50) NOT NULL,
    address_high_code INTEGER NOT NULL,
    CONSTRAINT fk_mid_high FOREIGN KEY (address_high_code)
        REFERENCES address_high(address_high_code)
);

-- 4-3. 주소 하위 테이블
CREATE TABLE IF NOT EXISTS address_low (
    address_low_code INTEGER PRIMARY KEY,
    address_low_title VARCHAR(50) NOT NULL,
    address_mid_code INTEGER NOT NULL,
    CONSTRAINT fk_low_mid FOREIGN KEY (address_mid_code)
        REFERENCES address_mid(address_mid_code)
);

-- 5-1. 부서 상위 테이블
CREATE TABLE IF NOT EXISTS department_parent (
    department_parent_id INTEGER PRIMARY KEY,
    department_parent_title VARCHAR(50) NOT NULL
);

-- 5-2. 부서 하위 테이블
CREATE TABLE IF NOT EXISTS department_child (
    department_child_id INTEGER PRIMARY KEY,
    department_child_title VARCHAR(50) NOT NULL,
    department_parent_id INTEGER NOT NULL,
    CONSTRAINT fk_child_parent FOREIGN KEY (department_parent_id)
        REFERENCES department_parent(department_parent_id)
);

-- 6. 사용자 정보 테이블
CREATE TABLE IF NOT EXISTS user_info (
    serial_number SERIAL PRIMARY KEY,
    email VARCHAR(254) NOT NULL,
    first_name VARCHAR(15) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    first_name_kana VARCHAR(20) NOT NULL,
    last_name_kana VARCHAR(25) NOT NULL,
    birth_date DATE NOT NULL,
    nationality VARCHAR(50) NOT NULL,
    gender_id INTEGER NOT NULL,
    phone_number VARCHAR(11) NOT NULL,
    employee_number VARCHAR(10) UNIQUE NOT NULL,
    position_id INTEGER NOT NULL,
    address_low_code INTEGER NOT NULL,
    department_child_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT user_info_email_key UNIQUE (email),
    CONSTRAINT fk_user_email FOREIGN KEY (email) REFERENCES login_info(email)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_user_gender FOREIGN KEY (gender_id) REFERENCES gender(gender_id),
    CONSTRAINT fk_user_position FOREIGN KEY (position_id) REFERENCES position(position_id),
    CONSTRAINT fk_user_address_low FOREIGN KEY (address_low_code) REFERENCES address_low(address_low_code),
    CONSTRAINT fk_user_department_child FOREIGN KEY (department_child_id) REFERENCES department_child(department_child_id)
);

-- 7. 사용자 전체 주소 뷰
CREATE VIEW user_with_address AS
SELECT
    u.serial_number,
    u.email,
    u.first_name,
    u.last_name,
    CONCAT_WS(' ',
        ah.address_high_title,
        am.address_mid_title,
        al.address_low_title
    ) AS full_address
FROM user_info u
JOIN address_low al ON u.address_low_code = al.address_low_code
JOIN address_mid am ON al.address_mid_code = am.address_mid_code
JOIN address_high ah ON am.address_high_code = ah.address_high_code;

-- 8. 사용자 부서 뷰
CREATE VIEW view_user_department AS
SELECT
    u.serial_number,
    u.email,
    u.first_name,
    u.last_name,
    dc.department_child_title AS team,
    dp.department_parent_title AS division
FROM user_info u
JOIN department_child dc ON u.department_child_id = dc.department_child_id
JOIN department_parent dp ON dc.department_parent_id = dp.department_parent_id;

-- 9. 자격증 정보 테이블
CREATE TABLE certificate_info (
    cert_id SERIAL PRIMARY KEY,
    cert_name VARCHAR(100) NOT NULL,
    issuer VARCHAR(100) NOT NULL,
    valid_period INTEGER  -- 단위: 년, NULL이면 무기한
);

-- 10. 사용자 자격증 테이블
CREATE TABLE user_certificate (
    user_certificate_id SERIAL PRIMARY KEY,
    employee_number VARCHAR(10) NOT NULL,
    cert_id INTEGER NOT NULL,
    issue_date DATE NOT NULL,
    expire_date DATE,
    score VARCHAR(50),

    CONSTRAINT unique_user_cert UNIQUE (employee_number, cert_id),
    CONSTRAINT fk_user_cert_employee FOREIGN KEY (employee_number)
        REFERENCES user_info(employee_number) ON DELETE CASCADE,
    CONSTRAINT fk_user_cert_cert FOREIGN KEY (cert_id)
        REFERENCES certificate_info(cert_id) ON DELETE CASCADE
);

-- 11. 트리거 함수 생성
CREATE OR REPLACE FUNCTION set_expire_date()
RETURNS TRIGGER AS $$
DECLARE
    valid_years INTEGER;
BEGIN
    SELECT valid_period INTO valid_years
    FROM certificate_info
    WHERE cert_id = NEW.cert_id;

    IF NEW.expire_date IS NULL AND valid_years IS NOT NULL THEN
        NEW.expire_date := NEW.issue_date + (valid_years || ' years')::INTERVAL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. 트리거 생성
DROP TRIGGER IF EXISTS trg_set_expire_date ON user_certificate;

CREATE TRIGGER trg_set_expire_date
BEFORE INSERT ON user_certificate
FOR EACH ROW
EXECUTE FUNCTION set_expire_date();

-- 13. 사용자 자격증 통합 뷰
CREATE OR REPLACE VIEW user_cert_overview AS
SELECT
    u.employee_number,
    u.first_name,
    u.last_name,
    ci.cert_id,
    ci.cert_name,
    ci.issuer,
    ci.valid_period,
    uc.issue_date,
    uc.expire_date,
    uc.score
FROM user_certificate uc
JOIN user_info u ON uc.employee_number = u.employee_number
JOIN certificate_info ci ON uc.cert_id = ci.cert_id;



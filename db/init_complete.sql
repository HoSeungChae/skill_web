--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg120+1)
-- Dumped by pg_dump version 17.5 (Debian 17.5-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: set_expire_date(); Type: FUNCTION; Schema: public; Owner: myuser
--

CREATE FUNCTION public.set_expire_date() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    period_text VARCHAR(20);
    period_num INTEGER;
BEGIN
    -- expire_date가 이미 지정된 경우, 건드리지 않음
    IF NEW.expire_date IS NOT NULL THEN
        RETURN NEW;
    END IF;

    -- cert_id에 해당하는 valid_period 가져오기
    SELECT valid_period INTO period_text
    FROM certificate_info
    WHERE cert_id = NEW.cert_id;

    -- 무기한 처리
    IF period_text = '무기한' THEN
        NEW.expire_date := 'infinity';

    -- 숫자 + '년' 형식 처리 (예: 2년, 5년)
    ELSIF period_text ~ '^[0-9]+년$' THEN
        period_num := substring(period_text from '^[0-9]+')::INTEGER;
        NEW.expire_date := NEW.issue_date + (period_num || ' years')::INTERVAL;

    -- 형식이 이상하면 예외 발생
    ELSE
        RAISE EXCEPTION 'Invalid valid_period format: %', period_text;
    END IF;

    RETURN NEW;
END;
$_$;


ALTER FUNCTION public.set_expire_date() OWNER TO myuser;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: address_high; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.address_high (
    address_high_code integer NOT NULL,
    address_high_title character varying(50) NOT NULL
);


ALTER TABLE public.address_high OWNER TO myuser;

--
-- Name: address_low; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.address_low (
    address_low_code integer NOT NULL,
    address_low_title character varying(50) NOT NULL,
    address_mid_code integer NOT NULL
);


ALTER TABLE public.address_low OWNER TO myuser;

--
-- Name: address_mid; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.address_mid (
    address_mid_code integer NOT NULL,
    address_mid_title character varying(50) NOT NULL,
    address_high_code integer NOT NULL
);


ALTER TABLE public.address_mid OWNER TO myuser;

--
-- Name: certificate_info; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.certificate_info (
    cert_id integer NOT NULL,
    cert_name character varying(100) NOT NULL,
    issuer character varying(100) NOT NULL,
    valid_period character varying(20) NOT NULL
);


ALTER TABLE public.certificate_info OWNER TO myuser;

--
-- Name: certificate_info_cert_id_seq; Type: SEQUENCE; Schema: public; Owner: myuser
--

CREATE SEQUENCE public.certificate_info_cert_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.certificate_info_cert_id_seq OWNER TO myuser;

--
-- Name: certificate_info_cert_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myuser
--

ALTER SEQUENCE public.certificate_info_cert_id_seq OWNED BY public.certificate_info.cert_id;


--
-- Name: department_child; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.department_child (
    department_child_id integer NOT NULL,
    department_child_title character varying(50) NOT NULL,
    department_parent_id integer NOT NULL
);


ALTER TABLE public.department_child OWNER TO myuser;

--
-- Name: department_parent; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.department_parent (
    department_parent_id integer NOT NULL,
    department_parent_title character varying(50) NOT NULL
);


ALTER TABLE public.department_parent OWNER TO myuser;

--
-- Name: gender; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.gender (
    gender_id integer NOT NULL,
    gender_title character varying(20) NOT NULL
);


ALTER TABLE public.gender OWNER TO myuser;

--
-- Name: login_info; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.login_info (
    email character varying(254) NOT NULL,
    pw_hash character varying(100) NOT NULL,
    login_fail_count integer DEFAULT 0,
    last_login timestamp with time zone
);


ALTER TABLE public.login_info OWNER TO myuser;

--
-- Name: position; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public."position" (
    position_id integer NOT NULL,
    position_title character varying(50) NOT NULL
);


ALTER TABLE public."position" OWNER TO myuser;

--
-- Name: user_certificate; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.user_certificate (
    user_certificate_id integer NOT NULL,
    employee_number character varying(10) NOT NULL,
    cert_id integer NOT NULL,
    issue_date date NOT NULL,
    expire_date date,
    score character varying(50)
);


ALTER TABLE public.user_certificate OWNER TO myuser;

--
-- Name: user_info; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.user_info (
    serial_number integer NOT NULL,
    email character varying(254) NOT NULL,
    first_name character varying(15) NOT NULL,
    last_name character varying(20) NOT NULL,
    first_name_kana character varying(20) NOT NULL,
    last_name_kana character varying(25) NOT NULL,
    birth_date date NOT NULL,
    nationality character varying(50) NOT NULL,
    gender_id integer NOT NULL,
    phone_number character varying(11) NOT NULL,
    employee_number character varying(10) NOT NULL,
    position_id integer NOT NULL,
    address_low_code integer NOT NULL,
    department_child_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_info OWNER TO myuser;

--
-- Name: user_cert_overview; Type: VIEW; Schema: public; Owner: myuser
--

CREATE VIEW public.user_cert_overview AS
 SELECT u.employee_number,
    u.first_name,
    u.last_name,
    ci.cert_id,
    ci.cert_name,
    ci.issuer,
    ci.valid_period,
    uc.issue_date,
    uc.expire_date,
    uc.score
   FROM ((public.user_certificate uc
     JOIN public.user_info u ON (((uc.employee_number)::text = (u.employee_number)::text)))
     JOIN public.certificate_info ci ON ((uc.cert_id = ci.cert_id)));


ALTER VIEW public.user_cert_overview OWNER TO myuser;

--
-- Name: user_certificate_user_certificate_id_seq; Type: SEQUENCE; Schema: public; Owner: myuser
--

CREATE SEQUENCE public.user_certificate_user_certificate_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_certificate_user_certificate_id_seq OWNER TO myuser;

--
-- Name: user_certificate_user_certificate_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myuser
--

ALTER SEQUENCE public.user_certificate_user_certificate_id_seq OWNED BY public.user_certificate.user_certificate_id;


--
-- Name: user_info_serial_number_seq; Type: SEQUENCE; Schema: public; Owner: myuser
--

CREATE SEQUENCE public.user_info_serial_number_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_info_serial_number_seq OWNER TO myuser;

--
-- Name: user_info_serial_number_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myuser
--

ALTER SEQUENCE public.user_info_serial_number_seq OWNED BY public.user_info.serial_number;


--
-- Name: user_with_address; Type: VIEW; Schema: public; Owner: myuser
--

CREATE VIEW public.user_with_address AS
 SELECT u.serial_number,
    u.email,
    u.first_name,
    u.last_name,
    concat_ws(' '::text, ah.address_high_title, am.address_mid_title, al.address_low_title) AS full_address
   FROM (((public.user_info u
     JOIN public.address_low al ON ((u.address_low_code = al.address_low_code)))
     JOIN public.address_mid am ON ((al.address_mid_code = am.address_mid_code)))
     JOIN public.address_high ah ON ((am.address_high_code = ah.address_high_code)));


ALTER VIEW public.user_with_address OWNER TO myuser;

--
-- Name: view_user_department; Type: VIEW; Schema: public; Owner: myuser
--

CREATE VIEW public.view_user_department AS
 SELECT u.serial_number,
    u.email,
    u.first_name,
    u.last_name,
    dc.department_child_title AS team,
    dp.department_parent_title AS division
   FROM ((public.user_info u
     JOIN public.department_child dc ON ((u.department_child_id = dc.department_child_id)))
     JOIN public.department_parent dp ON ((dc.department_parent_id = dp.department_parent_id)));


ALTER VIEW public.view_user_department OWNER TO myuser;

--
-- Name: certificate_info cert_id; Type: DEFAULT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.certificate_info ALTER COLUMN cert_id SET DEFAULT nextval('public.certificate_info_cert_id_seq'::regclass);


--
-- Name: user_certificate user_certificate_id; Type: DEFAULT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.user_certificate ALTER COLUMN user_certificate_id SET DEFAULT nextval('public.user_certificate_user_certificate_id_seq'::regclass);


--
-- Name: user_info serial_number; Type: DEFAULT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.user_info ALTER COLUMN serial_number SET DEFAULT nextval('public.user_info_serial_number_seq'::regclass);


--
-- Data for Name: address_high; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.address_high (address_high_code, address_high_title) FROM stdin;
1	Hokkaido
2	Aomori
3	Iwate
4	Miyagi
5	Akita
6	Yamagata
7	Fukushima
8	Ibaraki
9	Tochigi
10	Gunma
11	Saitama
12	Chiba
13	Tokyo
14	Kanagawa
15	Niigata
16	Toyama
17	Ishikawa
18	Fukui
19	Yamanashi
20	Nagano
21	Gifu
22	Shizuoka
23	Aichi
24	Mie
25	Shiga
26	Kyoto
27	Osaka
28	Hyogo
29	Nara
30	Wakayama
31	Tottori
32	Shimane
33	Okayama
34	Hiroshima
35	Yamaguchi
36	Tokushima
37	Kagawa
38	Ehime
39	Kochi
40	Fukuoka
41	Saga
42	Nagasaki
43	Kumamoto
44	Oita
45	Miyazaki
46	Kagoshima
47	Okinawa
\.


--
-- Data for Name: address_low; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.address_low (address_low_code, address_low_title, address_mid_code) FROM stdin;
131101	Kamata	1311
131102	Omori	1311
131103	Ikegami	1311
131104	Denenchofu	1311
131105	Magome	1311
131106	Senzokuike	1311
131107	Chidori	1311
131108	Higashiyukigaya	1311
131109	Shimo-maruko	1311
131110	Yaguchi	1311
131111	Tamagawa	1311
131112	Kugahara	1311
131113	Unoki	1311
131114	Chidori	1311
131115	Kamata-honcho	1311
131116	Nishikamata	1311
131117	Higashirokugo	1311
131118	Higashimagome	1311
131801	Nishinippori	1318
131802	Higashinippori	1318
131803	Nippori	1318
131804	Arakawa	1318
131805	Machiya	1318
\.


--
-- Data for Name: address_mid; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.address_mid (address_mid_code, address_mid_title, address_high_code) FROM stdin;
1301	Chiyoda-ku	13
1302	Chuo-ku	13
1303	Minato-ku	13
1304	Shinjuku-ku	13
1305	Bunkyo-ku	13
1306	Taito-ku	13
1307	Sumida-ku	13
1308	Koto-ku	13
1309	Shinagawa-ku	13
1310	Meguro-ku	13
1311	Ota-ku	13
1312	Setagaya-ku	13
1313	Shibuya-ku	13
1314	Nakano-ku	13
1315	Suginami-ku	13
1316	Toshima-ku	13
1317	Kita-ku	13
1318	Arakawa-ku	13
1319	Itabashi-ku	13
1320	Nerima-ku	13
1321	Adachi-ku	13
1322	Katsushika-ku	13
1323	Edogawa-ku	13
2701	Abeno-ku	27
2702	Asahi-ku	27
2703	Chuo-ku	27
2704	Fukushima-ku	27
2705	Higashinari-ku	27
2706	Higashisumiyoshi-ku	27
2707	Higashiyodogawa-ku	27
2708	Ikuno-ku	27
2709	Joto-ku	27
2710	Kita-ku	27
2711	Konohana-ku	27
2712	Minato-ku	27
2713	Miyakojima-ku	27
2714	Naniwa-ku	27
2715	Nishinari-ku	27
2716	Nishiyodogawa-ku	27
2717	Suminoe-ku	27
2718	Sumiyoshi-ku	27
2719	Taisho-ku	27
2720	Tennoji-ku	27
2721	Tsurumi-ku	27
2722	Yodogawa-ku	27
2723	Hirano-ku	27
2724	Nishikujo-ku	27
\.


--
-- Data for Name: certificate_info; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.certificate_info (cert_id, cert_name, issuer, valid_period) FROM stdin;
1	정보처리기사	한국산업인력공단	무기한
2	SQLD	한국데이터산업진흥원	5년
3	ADsP	한국데이터산업진흥원	5년
4	컴퓨터활용능력 1급	대한상공회의소	무기한
5	리눅스마스터 2급	한국정보통신진흥협회	무기한
6	AWS Certified Solutions Architect – Associate	Amazon Web Services	3년
7	Microsoft Azure Fundamentals	Microsoft	무기한
8	정보보안기사	한국인터넷진흥원	무기한
9	TOEIC SW	ETS	2년
10	MOS Master	Microsoft	무기한
11	TOEIC	ETS	2년
12	TOEFL	ETS	2년
13	JLPT N1	일본국제교류기금	무기한
14	OPIc AL	ACTFL / YBM	2년
15	HSK 6급	중국한어수평고시	2년
\.


--
-- Data for Name: department_child; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.department_child (department_child_id, department_child_title, department_parent_id) FROM stdin;
101	인사그룹	1
102	경리그룹	1
103	총무그룹	1
201	영업본부	2
301	제1개발부	3
302	제2개발부	3
303	한국지사	3
304	교육그룹	3
305	AI솔루션그룹	3
401	제1그룹	4
402	제2그룹	4
403	제3그룹	4
404	제4그룹	4
501	설계·품질그룹	5
502	토호쿠사업소	5
503	후쿠오카사업소	5
504	스마트에너지솔루션부	5
601	품질관리부	6
\.


--
-- Data for Name: department_parent; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.department_parent (department_parent_id, department_parent_title) FROM stdin;
1	경영지원실
2	영업본부
3	개발본부
4	ICT본부
5	사회인프라사업부
6	품질관리부
\.


--
-- Data for Name: gender; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.gender (gender_id, gender_title) FROM stdin;
1	남성
2	여성
3	기타
\.


--
-- Data for Name: login_info; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.login_info (email, pw_hash, login_fail_count, last_login) FROM stdin;
chae@example.com	$2b$12$testchaepwhash12345678901234567890123456789012345678	0	\N
hong@example.com	$2b$12$testhongpwhash12345678901234567890123456789012345678	0	\N
sunshin@example.com	$2b$12$testsunpwhash123456789012345678901234567890123456	0	\N
sonhm@example.com	$2b$12$testsonpwhash1234567890123456789012345678901234567	0	\N
seonggae@example.com	$2b$12$testseongpwhash123456789012345678901234567890123	0	\N
\.


--
-- Data for Name: position; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public."position" (position_id, position_title) FROM stdin;
1	인턴
2	사원
3	주임
4	대리
5	과장
6	차장
7	부장
\.


--
-- Data for Name: user_certificate; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.user_certificate (user_certificate_id, employee_number, cert_id, issue_date, expire_date, score) FROM stdin;
4	ais2407002	11	2023-02-10	2025-02-10	870
5	ais2407002	13	2022-06-01	infinity	합격
6	ais2407003	6	2021-05-15	2024-05-15	취득
7	ais2407003	8	2020-10-10	infinity	취득
8	ais2407004	14	2023-08-20	2025-08-20	AL
9	ais2407005	4	2020-03-30	infinity	1급
10	ais2407005	5	2020-04-15	infinity	취득
11	ais2407005	3	2022-06-10	2027-06-10	취득
12	ais2407001	1	2022-01-01	infinity	합격
\.


--
-- Data for Name: user_info; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.user_info (serial_number, email, first_name, last_name, first_name_kana, last_name_kana, birth_date, nationality, gender_id, phone_number, employee_number, position_id, address_low_code, department_child_id, created_at, updated_at) FROM stdin;
6	chae@example.com	Ho Seung	Chae	ホスン	チェ	1997-01-01	Korea	1	01012345678	ais2407001	2	131101	301	2025-07-11 01:00:40.20541+00	2025-07-11 01:00:40.20541+00
7	hong@example.com	Gil Dong	Hong	ギルドン	ホン	1990-05-20	Korea	1	01098765432	ais2407002	3	131102	201	2025-07-11 01:00:40.20541+00	2025-07-11 01:00:40.20541+00
8	sunshin@example.com	Sun Shin	Lee	スンシン	リー	1980-10-15	Korea	1	01011223344	ais2407003	6	131103	401	2025-07-11 01:00:40.20541+00	2025-07-11 01:00:40.20541+00
9	sonhm@example.com	Heung Min	Son	フンミン	ソン	1992-07-08	Korea	1	01055667788	ais2407004	5	131104	302	2025-07-11 01:00:40.20541+00	2025-07-11 01:00:40.20541+00
10	seonggae@example.com	Seong Gae	Lee	ソンゲ	リー	1985-03-18	Korea	1	01066778899	ais2407005	4	131105	101	2025-07-11 01:00:40.20541+00	2025-07-11 01:00:40.20541+00
\.


--
-- Name: certificate_info_cert_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myuser
--

SELECT pg_catalog.setval('public.certificate_info_cert_id_seq', 15, true);


--
-- Name: user_certificate_user_certificate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myuser
--

SELECT pg_catalog.setval('public.user_certificate_user_certificate_id_seq', 12, true);


--
-- Name: user_info_serial_number_seq; Type: SEQUENCE SET; Schema: public; Owner: myuser
--

SELECT pg_catalog.setval('public.user_info_serial_number_seq', 10, true);


--
-- Name: address_high address_high_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.address_high
    ADD CONSTRAINT address_high_pkey PRIMARY KEY (address_high_code);


--
-- Name: address_low address_low_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.address_low
    ADD CONSTRAINT address_low_pkey PRIMARY KEY (address_low_code);


--
-- Name: address_mid address_mid_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.address_mid
    ADD CONSTRAINT address_mid_pkey PRIMARY KEY (address_mid_code);


--
-- Name: certificate_info certificate_info_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.certificate_info
    ADD CONSTRAINT certificate_info_pkey PRIMARY KEY (cert_id);


--
-- Name: department_child department_child_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.department_child
    ADD CONSTRAINT department_child_pkey PRIMARY KEY (department_child_id);


--
-- Name: department_parent department_parent_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.department_parent
    ADD CONSTRAINT department_parent_pkey PRIMARY KEY (department_parent_id);


--
-- Name: gender gender_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.gender
    ADD CONSTRAINT gender_pkey PRIMARY KEY (gender_id);


--
-- Name: login_info login_info_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.login_info
    ADD CONSTRAINT login_info_pkey PRIMARY KEY (email);


--
-- Name: position position_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public."position"
    ADD CONSTRAINT position_pkey PRIMARY KEY (position_id);


--
-- Name: user_certificate unique_user_cert; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.user_certificate
    ADD CONSTRAINT unique_user_cert UNIQUE (employee_number, cert_id);


--
-- Name: user_certificate user_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.user_certificate
    ADD CONSTRAINT user_certificate_pkey PRIMARY KEY (user_certificate_id);


--
-- Name: user_info user_info_email_key; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT user_info_email_key UNIQUE (email);


--
-- Name: user_info user_info_employee_number_key; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT user_info_employee_number_key UNIQUE (employee_number);


--
-- Name: user_info user_info_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT user_info_pkey PRIMARY KEY (serial_number);


--
-- Name: user_certificate trg_set_expire_date; Type: TRIGGER; Schema: public; Owner: myuser
--

CREATE TRIGGER trg_set_expire_date BEFORE INSERT ON public.user_certificate FOR EACH ROW EXECUTE FUNCTION public.set_expire_date();


--
-- Name: department_child fk_child_parent; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.department_child
    ADD CONSTRAINT fk_child_parent FOREIGN KEY (department_parent_id) REFERENCES public.department_parent(department_parent_id);


--
-- Name: address_low fk_low_mid; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.address_low
    ADD CONSTRAINT fk_low_mid FOREIGN KEY (address_mid_code) REFERENCES public.address_mid(address_mid_code);


--
-- Name: address_mid fk_mid_high; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.address_mid
    ADD CONSTRAINT fk_mid_high FOREIGN KEY (address_high_code) REFERENCES public.address_high(address_high_code);


--
-- Name: user_info fk_user_address_low; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT fk_user_address_low FOREIGN KEY (address_low_code) REFERENCES public.address_low(address_low_code);


--
-- Name: user_certificate fk_user_cert_cert; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.user_certificate
    ADD CONSTRAINT fk_user_cert_cert FOREIGN KEY (cert_id) REFERENCES public.certificate_info(cert_id) ON DELETE CASCADE;


--
-- Name: user_certificate fk_user_cert_employee; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.user_certificate
    ADD CONSTRAINT fk_user_cert_employee FOREIGN KEY (employee_number) REFERENCES public.user_info(employee_number) ON DELETE CASCADE;


--
-- Name: user_info fk_user_department_child; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT fk_user_department_child FOREIGN KEY (department_child_id) REFERENCES public.department_child(department_child_id);


--
-- Name: user_info fk_user_email; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT fk_user_email FOREIGN KEY (email) REFERENCES public.login_info(email) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_info fk_user_gender; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT fk_user_gender FOREIGN KEY (gender_id) REFERENCES public.gender(gender_id);


--
-- Name: user_info fk_user_position; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT fk_user_position FOREIGN KEY (position_id) REFERENCES public."position"(position_id);


--
-- PostgreSQL database dump complete
--


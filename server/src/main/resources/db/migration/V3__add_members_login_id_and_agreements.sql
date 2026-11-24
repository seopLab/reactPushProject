-- V3: 회원가입 저장용 컬럼 추가 (로그인 아이디, 약관 동의)
-- id 는 내부 번호(다른 테이블이 참조)라 그대로 두고, 사용자가 정하는 아이디는 login_id 로 따로 둔다
-- 기존 행이 있을 수 있어 login_id 는 null 허용. 가입 시 필수 검사는 서버에서 한다
alter table members add column login_id varchar(20);
alter table members add constraint uq_members_login_id unique (login_id);
alter table members add column terms_agreed_at timestamp;                         -- 필수 약관(이용약관·개인정보) 동의 시각
alter table members add column location_agreed boolean not null default false;
alter table members add column notification_agreed boolean not null default false;

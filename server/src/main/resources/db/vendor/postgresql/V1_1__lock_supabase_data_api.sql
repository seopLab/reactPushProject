-- PostgreSQL(Supabase)에서만 실행된다 (application.yml 의 flyway.locations: db/vendor/{vendor}). H2 에선 건너뜀.
-- Supabase 는 public 스키마 테이블을 REST(Data API)로 anon·authenticated 역할에 열어 둔다.
-- 이 앱은 Spring 서버(postgres 역할)로만 DB 를 쓰므로, 공개 키로 테이블을 읽고 쓰지 못하게 막는다.
-- 이후 postgres 역할이 만드는 테이블(V2, V3 ...)에도 자동으로 적용된다.

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;

alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on functions from anon, authenticated;

-- V2: members 의 위도·경도 컬럼 삭제 (회원 위치는 region_name 으로만 관리)
-- housing_notices 의 lat, lng 는 공고 위치라 그대로 둔다
alter table members drop column lat;
alter table members drop column lng;

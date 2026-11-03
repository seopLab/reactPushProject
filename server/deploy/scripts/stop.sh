#!/bin/bash
# 배포 전에 기존 서버를 멈춘다 (처음 배포라 서비스가 없어도 실패로 치지 않음)
systemctl stop cheongyak-server || true

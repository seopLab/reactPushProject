#!/bin/bash
# 새 jar 로 서버를 켠다
set -e
chown -R ubuntu:ubuntu /opt/cheongyak-server
systemctl daemon-reload
systemctl enable cheongyak-server
systemctl restart cheongyak-server

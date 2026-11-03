#!/bin/bash
# 서버가 살아났는지 최대 60초 동안 확인
for i in $(seq 1 30); do
  if curl -fs http://localhost:8080/actuator/health > /dev/null; then
    echo "server is up"
    exit 0
  fi
  sleep 2
done
echo "server did not start" >&2
exit 1

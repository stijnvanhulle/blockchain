#!/usr/bin/env bash

set -e


sudo service docker restart 
cd /tmp/
if [ ! -f /tmp/.env ]; then
    sudo docker run --rm --name example -v "$PWD":/tmp -w /tmp node:latest npm run set:env
fi
/usr/local/bin/docker-compose -f /tmp/docker-compose.yml down -v
/usr/local/bin/docker-compose -f /tmp/docker-compose.yml up --build -d




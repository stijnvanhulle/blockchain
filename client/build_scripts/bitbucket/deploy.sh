#!/usr/bin/env bash

if [ -z "$USER" ]; then
    echo 'No USER found'
    exit 1
fi

if [ -z "$IP" ]; then
    echo 'No IP found'
    exit 1
fi

if [ -z "$DEPLOY_FOLDER" ]; then
    echo 'No DEPLOY_FOLDER found'
    exit 1
fi

scp -rp {build,config}/ docker-compose.yml .env Dockerfile root@$IP:$DEPLOY_FOLDER
ssh -t $USER@$IP 'bash -i -c "cd $DEPLOY_FOLDER && docker-compose down -v && docker-compose up --build -d"'
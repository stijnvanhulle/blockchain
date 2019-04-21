#!/usr/bin/env bash
rm -f .env -f
echo -e "NODE_ENV=$NODE_ENV \nPORT=$PORT \nAWS_accessKeyId=$AWS_ACCESS_KEY_ID \nAWS_secretAccessKey=$AWS_SECRET_ACCESS_KEY \nAWS_region=$AWS_DEFAULT_REGION\nGIT_TOKEN=$GIT_TOKEN\nCOMPONENT_VERSION=$COMPONENT_VERSION\nPROXY=$PROXY" >> .env
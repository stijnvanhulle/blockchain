#!/usr/bin/env bash

set -e

sudo pip install docker-compose
sudo usermod -aG docker ${USER}
sudo service docker restart 
sudo docker rm docker-nginx -f
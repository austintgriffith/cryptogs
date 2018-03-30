#!/bin/bash
sudo certbot certonly --webroot -w /home/ubuntu/concurrence.io/Web/public -d stage.cryptogs.io
sudo cp /etc/letsencrypt/live/stage.cryptogs.io/fullchain.pem .
sudo cp /etc/letsencrypt/live/stage.cryptogs.io/privkey.pem .

#!/bin/bash
docker rm -f cryptogs-redis
docker run --name cryptogs-redis -v ${PWD}/redisdata:/data -p 57290:6379 -d redis redis-server --appendonly yes

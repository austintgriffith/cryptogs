#!/bin/bash
docker rm -f cryptogs
docker run --name="cryptogs" \
        --log-opt max-size=25m \
        --log-opt max-file=4 \
        -c 5120 \
        -m 2g \
        -v ${PWD}/../src:/root/app \
        -p 56834:8000 \
        -d cryptogs

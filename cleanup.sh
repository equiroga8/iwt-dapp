#!/bin/bash
rm -rf db
killall -s KILL node
fuser -k 8000/tcp
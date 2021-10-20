#!/bin/bash
fileName=twitterplay_fb_$(date +"%Y%m%d_%H-%M-%S")
tar --exclude='public/processed_files/*' --exclude='public/tweet_files/*' --exclude='utils/redis/node_modules/*' --exclude='utils/IgnoreList/node_modules/*' --exclude='utils/node_modules/*' --exclude='public/*.pos' --exclude='public/*.neg' --exclude='public/*.xls' -zcvf  ../$fileName.tar.gz app config public utils views changes.txt server.js favicon.ico package.json msg.txt thirdparty backup.sh clean_project.sh ApplicationAccess.log iisnode.yml servers web.config 

#!/bin/bash

kubectl -n service rollout restart deployment tp-mongo-express --namespace=tp-mongo-namespace

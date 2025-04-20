#!/usr/bin/env bash

if [[ ! -d "$HOME/Documents/Project/Project-kelas-008/.env" ]]; then
	touch ../.env
	printf "PORT=3001\nNODE_ENV=development" > ../.env
fi

cd ../ && npm i
cd ./src/server && npm i npm install express typescript ts-node @types/node @types/express --save-dev

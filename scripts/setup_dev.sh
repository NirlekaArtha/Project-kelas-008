#!/usr/bin/env bash

if [[ ! -d "$HOME/Documents/Project/Project-kelas-008/.env" ]]; then
	printf "PORT=3001\nNODE_ENV=development" > .env
fi

npm i

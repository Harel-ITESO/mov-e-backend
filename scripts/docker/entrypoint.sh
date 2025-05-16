#!/bin/sh

npx prisma migrate deploy
npx prisma db push

node main.js

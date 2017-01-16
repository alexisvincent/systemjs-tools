#!/usr/bin/env bash
cd ..
yarn
cd test/public
jspm install
cd ..
node ../dist/cli.js serve
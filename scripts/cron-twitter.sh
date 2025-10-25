#!/bin/bash

# Twitter Auto-Poster Cron Wrapper
# This script ensures the correct working directory for cron

cd /Users/ai.place/Crypto || exit 1
/opt/homebrew/bin/node scripts/twitter-scheduler.js

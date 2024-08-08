# start.sh
#!/bin/bash

# Activate the virtual environment
source ../myenv/bin/activate

# Start the Python server in the background
python3 scripts/server.py &

# Start the Node.js server
node index.js &

# Start the cron job
node cron-job/scheduleCache.js

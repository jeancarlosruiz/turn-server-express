#!/bin/bash

# Start script for TURN server and Express API

set -e

echo "🚀 Starting TURN Server with Express API"

# Get external IP if not set
if [ -z "$EXTERNAL_IP" ]; then
    echo "📡 Detecting external IP address..."
    EXTERNAL_IP=$(curl -s https://api.ipify.org)
    echo "✅ Detected external IP: $EXTERNAL_IP"
fi

# Update turnserver.conf with environment variables
echo "⚙️  Configuring coturn..."
sed -i "s/realm=.*/realm=${TURN_REALM:-turn.example.com}/" /etc/turnserver.conf
sed -i "s/static-auth-secret=.*/static-auth-secret=${TURN_STATIC_AUTH_SECRET}/" /etc/turnserver.conf
sed -i "s/listening-port=.*/listening-port=${TURN_PORT:-3478}/" /etc/turnserver.conf
sed -i "s/tls-listening-port=.*/tls-listening-port=${TURN_TLS_PORT:-5349}/" /etc/turnserver.conf

# Add external IP if available
if [ ! -z "$EXTERNAL_IP" ]; then
    if grep -q "^external-ip=" /etc/turnserver.conf; then
        sed -i "s/^# external-ip=.*/external-ip=$EXTERNAL_IP/" /etc/turnserver.conf
        sed -i "s/^external-ip=.*/external-ip=$EXTERNAL_IP/" /etc/turnserver.conf
    else
        echo "external-ip=$EXTERNAL_IP" >> /etc/turnserver.conf
    fi
    
    if grep -q "^relay-ip=" /etc/turnserver.conf; then
        sed -i "s/^# relay-ip=.*/relay-ip=$EXTERNAL_IP/" /etc/turnserver.conf
        sed -i "s/^relay-ip=.*/relay-ip=$EXTERNAL_IP/" /etc/turnserver.conf
    else
        echo "relay-ip=$EXTERNAL_IP" >> /etc/turnserver.conf
    fi
fi

# Create log directory
mkdir -p /var/log
touch /var/log/turnserver.log
chmod 666 /var/log/turnserver.log

# Start coturn in background
echo "🔄 Starting coturn TURN server..."
turnserver -c /etc/turnserver.conf &

# Wait a moment for coturn to start
sleep 2

# Start Express API
echo "🌐 Starting Express API..."
cd /app
npm start

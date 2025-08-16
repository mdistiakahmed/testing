#!/bin/bash

# Copy Crawlee project to EC2 Script
# Usage: ./copy-to-ec2.sh

# Configuration
EC2_HOST="ec2-54-210-79-100.compute-1.amazonaws.com" # ⬅️ Replace with your EC2 public DNS or IP
USERNAME="ec2-user"                                      # ⬅️ Replace if using a different AMI user
PEM_FILE="aws-ssh-pem-key.pem"                               # ⬅️ Replace with your PEM key file name
REMOTE_DIR="/home/$USERNAME/crawlee"

# Check PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo "❌ PEM file not found: $PEM_FILE"
    exit 1
fi

chmod 600 "$PEM_FILE"

echo "🚀 Copying all files to EC2..."
scp -i "$PEM_FILE" -r . "$USERNAME@$EC2_HOST:$REMOTE_DIR"

if [ $? -ne 0 ]; then
    echo "❌ Failed to copy project to EC2"
    exit 1
else
    echo "✅ Successfully copied all files to EC2"
fi


echo "✅ Copy complete!"
echo ""
echo "💡 Connect with:"
echo "   ssh -i $PEM_FILE $USERNAME@$EC2_HOST"
echo "   cd crawlee-project"

# 2. Install Docker
# sudo yum install docker -y

# 3. Enable and start Docker service
# sudo systemctl enable --now docker

# install git
# sudo yum install git -y

# clone public repo
# git clone https://github.com/username/repo.git

# gives files executable permission

#chmod +x docker-build.sh

# give code write permission
# mkdir storage
# sudo chmod -R 777 storage

# sudo ./docker-run.sh

# */15 * * * * cd /home/ec2-user/testing && /bin/bash -lc "./docker-run.sh" >> /home/ec2-user/scraper.log 2>&1

# ssh -i "aws-ssh-pem-key.pem" ec2-user@ec2-54-210-79-100.compute-1.amazonaws.com
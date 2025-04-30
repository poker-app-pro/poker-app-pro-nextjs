#!/bin/bash

# Check for an input argument for AWS_PROFILE
if [ -z "$1" ]; then
    echo "Enter the AWS profile you want to use: "
    read AWS_PROFILE
else
    AWS_PROFILE=$1
fi

# Export the AWS_PROFILE environment variable
export AWS_PROFILE=$AWS_PROFILE
echo "AWS_DEFAULT_PROFILE set to $AWS_PROFILE"

# Check if the script is being run in a git repository
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "Error: This script must be run inside a git repository."
    exit 1
fi

# Delete the sandbox using npx ampx
echo "Deleting sandbox with 'npx ampx sandbox delete'..."
npx ampx sandbox delete --yes
if [ $? -ne 0 ]; then
    echo "Sandbox deletion was not confirmed. Skipping sandbox recreation."
    exit 0
fi

# Pull the latest changes from the repository
echo "Pulling the latest changes from the git repository..."
git pull
if [ $? -ne 0 ]; then
    echo "Error: Failed to pull changes."
    exit 1
fi

# Run npm initialization
echo "Running 'npm init'..."
npm i -y
if [ $? -ne 0 ]; then
    echo "Error: npm initialization failed."
    exit 1
fi

# Recreate the sandbox using npx ampx
echo "Creating sandbox with 'npx ampx sandbox --no-watch'..."
npx ampx sandbox --once
if [ $? -ne 0 ]; then
    echo "Error: Failed to create sandbox."
    exit 1
fi

echo "Script completed successfully."

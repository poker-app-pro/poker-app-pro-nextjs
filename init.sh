#!/bin/bash

# Check for an input argument for AWS_PROFILE
if [ -z "$1" ]; then
    profiles=()
    if [ -f "$HOME/.aws/config" ]; then
        while IFS= read -r line; do
            line="${line#"${line%%[![:space:]]*}"}"
            case "$line" in
                "[profile "*"]")
                    name="${line#\[profile }"
                    name="${name%\]}"
                    profiles+=("$name")
                    ;;
                "[default]")
                    profiles+=("default")
                    ;;
            esac
        done < "$HOME/.aws/config"
    fi
    if [ -f "$HOME/.aws/credentials" ]; then
        while IFS= read -r line; do
            line="${line#"${line%%[![:space:]]*}"}"
            if [[ "$line" =~ ^\[.+\]$ ]]; then
                name="${line#\[}"
                name="${name%\]}"
                profiles+=("$name")
            fi
        done < "$HOME/.aws/credentials"
    fi

    declare -A seen
    unique_profiles=()
    for p in "${profiles[@]}"; do
        [ -n "$p" ] || continue
        if [ -z "${seen[$p]+x}" ]; then
            seen[$p]=1
            unique_profiles+=("$p")
        fi
    done

    if [ "${#unique_profiles[@]}" -eq 0 ]; then
        echo "Enter the AWS profile you want to use: "
        read AWS_PROFILE
    else
        echo "Available AWS profiles:"
        for i in "${!unique_profiles[@]}"; do
            idx=$((i + 1))
            echo "  $idx) ${unique_profiles[$i]}"
        done
        while true; do
            echo "Select a profile by number (1-${#unique_profiles[@]}) or enter a name:"
            read selection
            if [[ "$selection" =~ ^[0-9]+$ ]]; then
                if [ "$selection" -ge 1 ] && [ "$selection" -le "${#unique_profiles[@]}" ]; then
                    AWS_PROFILE="${unique_profiles[$((selection - 1))]}"
                    break
                fi
            elif [ -n "$selection" ]; then
                AWS_PROFILE="$selection"
                break
            fi
        done
    fi
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

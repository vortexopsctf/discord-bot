# Use Node.js LTS (20) on Alpine Linux for a small footprint
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files first to leverage Docker cache for dependencies
COPY package*.json ./

# Install only production dependencies
# - npm ci is faster and more reliable than npm install for CI/CD/Docker
# - --only=production skips devDependencies (like eslint)
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# config.json is in .dockerignore to prevent secrets from being baked into the image
# It must be mounted at runtime (e.g., -v $(pwd)/config.json:/usr/src/app/config.json)

# Start the bot
CMD ["npm", "start"]

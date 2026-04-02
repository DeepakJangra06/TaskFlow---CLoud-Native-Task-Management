# Dockerfile

# Use a Node.js base image
FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Change permissions before building
RUN chmod -R 755 ./node_modules

# Build the application
RUN npm run build

# Expose the port
EXPOSE 8080

# Start the application
CMD [ "npm", "start" ]
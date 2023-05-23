# Use an official Node.js runtime as the base image
FROM node:14.20.1

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port on which your API will run
EXPOSE 8050

# Set the command to run your API when the container starts
CMD [ "npm" , "run" , "start" ]

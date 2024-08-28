# Stage 1: Build stage
FROM python:3.9-slim AS build

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the requirements file into the container
COPY requirements.txt .

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    && pip install --no-cache-dir dlib \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y --auto-remove build-essential cmake \
    && rm -rf /var/lib/apt/lists/*

# Stage 2: Final stage
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the installed dependencies from the build stage
COPY --from=build /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=build /usr/local/bin /usr/local/bin

# Copy the rest of the application code
COPY . .

# Command to run the application
CMD ["python", "face-recognition.py"]
# pull official base image
FROM  python:3.12.3-bullseye

# set working directory
WORKDIR /backend

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED=1

# install system dependencies
RUN apt-get update && apt-get install -y netcat

# install dependencies
RUN pip install --upgrade pip
COPY ./requirements.txt .
RUN pip install -r requirements.txt

# copy entrypoint.sh
COPY ./entrypoint.sh .
RUN sed -i 's/\r$//g' /backend/entrypoint.sh
RUN chmod +x /backend/entrypoint.sh

# copy from the current directory of the Dockerfile to /api in the image
COPY . . 

# run entrypoint.sh
ENTRYPOINT ["/backend/entrypoint.sh"]
FROM node:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json .
RUN ls /usr/src/app

RUN npm install
RUN echo "*********************** npm install succeeded"

COPY . /usr/src/app
RUN ls /usr/src/app

EXPOSE 3000
CMD [ "npm", "start" ]
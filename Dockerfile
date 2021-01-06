FROM node:15.5
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
# COPY ./app/ ./
# RUN npm install
CMD ["node", "atread.js"]

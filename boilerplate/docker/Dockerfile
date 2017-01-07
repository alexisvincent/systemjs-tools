FROM node:7.4

WORKDIR /usr/app

ENTRYPOINT systemjs
CMD serve

EXPOSE 443

## Uncomment if you use JSPM
# RUN npm install --global jspm@beta

COPY src /usr/app/public

# Uncomment if you are using node_modules
# RUN npm install

# Uncomment if you use JSPM
# RUN jspm install


FROM node:7.4

WORKDIR /usr/app

# Install yarnpkg
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb http://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && \
    apt-get install -y yarn && \
    rm -rf /var/lib/apt/lists/*

RUN yarn global add systemjs-tools

## Uncomment if you use JSPM
# RUN npm install --global jspm@beta

COPY src /usr/app/

# Uncomment if you are using node_modules
RUN yarn install

# Uncomment if you use JSPM
# RUN jspm install

CMD systemjs serve
EXPOSE 443
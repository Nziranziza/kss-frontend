FROM ubuntu:20.04
RUN apt-get update && apt-get install -y sudo
RUN adduser --disabled-password \
--gecos '' docker-deployer
RUN adduser docker-deployer sudo
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> \
/etc/sudoers

USER docker-deployer
RUN sudo apt-get update && \
    DEBIAN_FRONTEND=noninteractive sudo apt-get install -y tzdata && \
    sudo apt-get update && \
    sudo apt-get install -y curl apt-transport-https ca-certificates build-essential && \
    curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash - && \
    sudo apt-get install -y nodejs && \
    sudo apt-get update -y && sudo apt upgrade -y && \
    sudo npm install express --save &&\
    #sudo npm -g install create-react-app
    sudo npm install - g @angular/cli

RUN sudo npm install --global yarn
RUN sudo apt-get update && \
    sudo apt-get install nginx -y && \
    sudo service nginx restart

WORKDIR /home/docker-deployer/
COPY smartkungahara.rw.conf /etc/nginx/sites-available/
RUN sudo ln -s /etc/nginx/sites-available/smartkungahara.rw.conf /etc/nginx/sites-enabled
RUN sudo rm -rf /etc/nginx/sites-available/default
RUN sudo rm -rf /etc/nginx/sites-enabled/default
RUN sudo service nginx restart

WORKDIR /home/docker-deployer/
COPY --chown=docker-deployer:docker-deployer ./package.json ./
COPY --chown=docker-deployer:docker-deployer . .
EXPOSE 5050

RUN npm i 
#RUN npm run build
RUN ng build --configuration=staging
RUN sudo service nginx restart

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
    curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash - && \
    sudo apt-get install -y nodejs && \
    sudo apt-get update -y && sudo apt upgrade -y && \
    sudo npm install -g @angular/cli


RUN sudo apt-get update && \
    sudo apt-get install nginx -y && \
    sudo service nginx restart

WORKDIR /home/docker-deployer/
COPY smartkungahara-srv-01.conf /etc/nginx/sites-available/
COPY smartkungahara-srv-02.conf /etc/nginx/sites-available/
#RUN sudo ln -s /etc/nginx/sites-available/smartkungahara.rw.conf /etc/nginx/sites-enabled
RUN sudo rm -rf /etc/nginx/sites-available/default
RUN sudo rm -rf /etc/nginx/sites-enabled/default
RUN sudo service nginx restart

WORKDIR /home/docker-deployer/
COPY --chown=docker-deployer:docker-deployer ./package.json ./
COPY --chown=docker-deployer:docker-deployer . .
EXPOSE 5050

RUN npm i --legacy-peer-deps
RUN ng build --prod --aot --configuration=staging

RUN sudo service nginx restart

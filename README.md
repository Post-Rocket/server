# Server

[https://github.com/Post-Rocket/server](Github repo)

Tutorial:
https://medium.com/@shreshthbansal2505/hosting-a-node-js-and-express-js-app-on-aws-ec2-a-step-by-step-guide-d2d345b74a1f

## Update submodules

Go to the repo where this module has been installed and type:

    git submodule update --init --recursive
    git submodule foreach --recursive git pull origin main
    git commit -am "update submodules"
    git push

You may need to sudo the commands to get access rights.

## Installs for ec2
    sudo yum install -y nodejs npm

or

    sudo get-apt install -y nodejs npm

    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
    source ~/.bash_profile
    nvm install --lts

To test node:

    node -e "console.log('Running Node.js ' + process.version)"

Install process management:

    npm install -g pm2

then to start the server:
    
    pm2 start index.js

to monitor the server:

    pm2 status

## Pushing code from github to ec2

Tutorials:

- https://docs.aws.amazon.com/codedeploy/latest/userguide/tutorials-github.html
- https://docs.aws.amazon.com/codedeploy/index.html
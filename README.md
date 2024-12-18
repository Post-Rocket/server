# Server

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

## Pushing code from github to ec2
CodeDeploy: https://docs.aws.amazon.com/codedeploy/index.html
Tutorial: https://docs.aws.amazon.com/codedeploy/latest/userguide/tutorials-github.html
1. How To run:
====

You have to have npm, python and node installed!

git clone https://github.com/arnif/WEPO-chat.git

npm -d install

chmod +x runclient.bat (*nix only)

./runclient.bat

node chatserver.js

Now the chat should be availeble at http://localhost:8000


2. How to develop:
====

npm install bower -g

npm install grunt-cli --save-dev

make changes to any .js file in src/js/

grunt

make sure there are no errors.

Run the program (1).

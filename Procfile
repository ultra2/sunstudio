web: node --inspect=10000 web.js
web2: node_modules/.bin/cf-node-debug -a local:debug:a web.js
webDebug: node-inspector --web-port $PORT --web-host $IP
webInspect: node --inspect=$PORT --debug-brk web.js


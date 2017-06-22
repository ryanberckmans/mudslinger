Mudslinger is a web based MUD client written in Typescript. 
It consists of a Node.js / Express web server and a HTML/CSS/Javascript frontend.

The Node.js server makes telnet connections to the target host/port and acts as a telnet proxy for the frontend application.

It can be configured to connect only to a specific host/port or allow connections to any host/port.

Live version at: [http://mudslinger.rooflez.com](http://mudslinger.rooflez.com)

# Features #
* ANSI color
* XTERM 256 colors
* MXP support (<image>, <send>, <a>, <i>, <b>, <u>, and <s> tags)
* Triggers (basic and regex)
* Aliases (basic and regex)
* Scripting support (Javascript)


# Getting started #
1. Run ``npm install`` in the root directory.
2. ``npm run build`` to build the server and client.
3. Edit `configClient.js` and `configServer.js` as needed.
4. ``npm start`` to start the server.

# License
See ``LICENSE`` file.
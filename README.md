The Aarchon Web Client is a web based MUD client for Aarchon MUD. It consists of a flask based Python web server and a HTML/CSS/Javascript frontend.

The Flask webserver makes telnet connections to the target host/port and acts as a telnet proxy for the frontend application. 


# Python version #
Target is Python 2.7. 
Python 3 compatibility is untested.

# Requirements #

Python hard requirements:

* flask
* flask-socketio

Python optional requirements:

* gunicorn
* eventlet

# Getting started #
1. Install flask and flask-socketio.
2. Edit config.py to set the target host/port for telnet connections.

## Without gunicorn/eventlet ##
1. Run app.py to start the server (debug mode).

## With gunicorn/eventlet ##
1. Install gunicorn and eventlet.
2. Edit guni.sh to set the web application host and port.
3. Run guni.sh to start the server.

# License
See ``LICENSE`` file.
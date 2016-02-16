#!venv/bin/python2.7
import time
import threading
from telnetlib import Telnet
from flask import Flask, jsonify, render_template, request, redirect, url_for
from flask.ext.socketio import SocketIO, emit
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.bcrypt import Bcrypt
from flask.ext.login import LoginManager,login_user
from flask_wtf import Form
from wtforms import TextField, PasswordField
from wtforms.validators import DataRequired, Length, Email, EqualTo

app = Flask(__name__)
app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
from models import *
#app.config['SERVER_NAME'] = 'vps.rooflez.com'
login_manager = LoginManager()
login_manager.init_app(app)


socketio=SocketIO(app)

telnets={}

class TelnetConn:
    def __init__(self, roomid):
        self.telnet=None
        self.roomid=roomid
        self.lock=threading.Lock()

    def start(self):
        self.t=threading.Thread( target=self._listen )
        self.t.daemon=True
        self.t.start()

    def _write(self, cmd):
        self.lock.acquire()
        try:
            self.telnet.write(str(cmd))
        except:
            with app.test_request_context('/telnet'):
                socketio.emit('telnet_error', {},
                        room=self.roomid,
                        namsepace='telnet' )
        finally:
            self.lock.release()

    def write(self, cmd):
        t=threading.Thread( target= self._write, kwargs={'cmd': cmd})
        t.daemon=True
        t.start()

    def _listen(self):
        self.telnet=Telnet('aarchonmud.com', 7000)

        with app.test_request_context('/telnet'):
            socketio.emit('telnet_connect', {},
                    room=self.roomid,
                    namespace='/telnet')

        while True:

            self.lock.acquire()
            d=self.telnet.read_very_eager()
            self.lock.release()
            if d != '':
                with app.test_request_context('/telnet'):
                    socketio.emit('telnet_data', {'data':d},
                            room=self.roomid,
                            namespace='/telnet' )
            time.sleep(0.020)



@socketio.on('connect', namespace='/telnet')
def ws_connect():
    print('connect running')
    emit('ws_connect', {}, namespace="/telnet")

@socketio.on('disconnect', namespace='/telnet')
def ws_disconnect():
    print('disconnect running')
    emit('ws_disconnect', {}, namespace="/telnet")

@socketio.on('open_telnet', namespace='/telnet')
def ws_open_telnet(message):
    print 'opening telnet'
    tn = TelnetConn(request.sid)
    tn.start()
    telnets[request.sid] = tn

@socketio.on('send_command', namespace='/telnet')
def ws_send_command(message):
    cmd = message['data']
    telnets[request.sid].write(cmd+"\n")


@app.route("/")
def client():
    print "client.html baby"
    return render_template('client.html')

@app.route("/resize")
def resize():
    print "resize"
    return render_template('resize.html')


#login_manager.login_view = "users.login"

@login_manager.user_loader
def load_user(user_id):
    User.query.filter(User.id == int(user_id)).first()


class LoginForm(Form):
    username = TextField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])


class RegisterForm(Form):
    username = TextField(
        'username',
        validators=[DataRequired(), Length(min=3, max=25)]
    )
    email = TextField(
        'email',
        validators=[DataRequired(), Email(message=None), Length(min=6, max=40)]
    )
    password = TextField(
        'password',
        validators=[DataRequired(), Length(min=6, max=25)]
    )
    confirm = PasswordField(
        'Repeat password',
        validators=[
            DataRequired(), EqualTo('password', message='Passwords must match.')
        ]
    )

@app.route("/login", methods=['GET', 'POST'])
def login():
    error = None
    form = LoginForm(request.form)
    if request.method == 'POST':
        if form.validate_on_submit():
            user = User.query.filter_by(name=request.form['username']).first()
            if user is not None and bcrypt.check_password_hash(
                user.password, request.form['password']
            ):
                login_user(user)
                flash('You were logged in. Go Crazy.')
                return redirect(url_for('home.home'))

            else:
                error = 'Invalid username or password.'
    return render_template('login.html', form=form, error=error)

@app.route("/register", methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        user = User(
            name=form.username.data,
            email=form.email.data,
            password=form.password.data
        )
        db.session.add(user)
        db.session.commit()
        login_user(user)
        return redirect(url_for('client'))
    return render_template("register.html", form=form)

if __name__ == "__main__":
    app.debug=True
    # app.run('0.0.0.0')
    socketio.run(app, '0.0.0.0'  )
    # db.create_all()
    # db.session.commit()

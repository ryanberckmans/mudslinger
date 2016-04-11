#!venv/bin/python2.7
import traceback
from Queue import Queue
import time
import threading
from telnetlib import Telnet, IAC, DO, WILL, SB, SE
from flask import Flask, jsonify, render_template, request, redirect, url_for, flash, g
from flask.ext.socketio import SocketIO, emit
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.bcrypt import Bcrypt
from flask.ext.login import LoginManager, login_user, logout_user, \
        current_user, login_required
from flask_wtf import Form
from wtforms import TextField, PasswordField
from wtforms.validators import DataRequired, Length, Email, EqualTo
import re


app = Flask(__name__)
app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
from models import *
#app.config['SERVER_NAME'] = 'vps.rooflez.com'
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'


socketio=SocketIO(app)

telnets={}

class TelnetConn:
    ttypes = [ 'ArcWeb', 'ANSI' ]
    MSDP_VARS = [
        'CHARACTER_NAME',
        'HEALTH', 'HEALTH_MAX',
        'MANA', 'MANA_MAX',
        'MOVEMENT', 'MOVEMENT_MAX',
        'EXPERIENCE_TNL', 'EXPERIENCE_MAX',
        'OPPONENT_HEALTH', 'OPPONENT_HEALTH_MAX',
        'OPPONENT_NAME',
        'STR', 'STR_PERM',
        'CON', 'CON_PERM',
        'VIT', 'VIT_PERM',
        'AGI', 'AGI_PERM',
        'DEX', 'DEX_PERM',
        'INT', 'INT_PERM',
        'WIS', 'WIS_PERM',
        'DIS', 'DIS_PERM',
        'CHA', 'CHA_PERM',
        'LUC', 'LUC_PERM',
        'ROOM_NAME', 'ROOM_EXITS',
        'AFFECTS',
        'LUA_EDIT']

    def __init__(self, roomid):
        self.telnet=None
        self.roomid=roomid
        self.write_lock=threading.Lock()
        self.ttype_index = 0
        self.write_queue = Queue()

        self.abort = False

    def start(self):
        self.t=threading.Thread( target=self._listen )
        self.t.daemon=True
        self.t.start()

        self.wt = threading.Thread(target=self._write)
        self.wt.daemon=True
        self.wt.start()

    def stop(self):
        self.abort = True
        self.telnet.close()
        
    def _write(self):
        while True:
            if self.abort:
                return

            cmd = self.write_queue.get(True, None)
            self.write_lock.acquire()
            print("locked")
            try:
                self.telnet.write(str(cmd))
            except:
                socketio.emit('telnet_error', {},
                        room=self.roomid,
                        namespace='telnet' )
            finally:
                self.write_lock.release()
                print("unlocked")

    def write(self, cmd):
        self.write_queue.put(cmd)
        #self._write(cmd)

    def sock_write(self, cmd):
        print("sock_write")
        self.write_lock.acquire()
        print("slocked")
        self.telnet.get_socket().sendall(cmd)
        self.write_lock.release()
        print("sunlocked")
    
    def handle_msdp(self, msdp):
        env={'ind': 0}

        def get_msdp_table():
            print "TBL"
            env['ind'] += 1
            rtn = {}
            while msdp[env['ind']] != MSDP.TABLE_CLOSE:
                kv = get_msdp_var()
                rtn[kv[0]] = kv[1]
            
            return rtn 

        def get_msdp_array():
            print ("ARRY")
            env['ind'] += 1
            rtn = []
            while msdp[env['ind']] != MSDP.ARRAY_CLOSE:
                v = get_msdp_val()
                rtn.append(v)

            return rtn

        def get_msdp_val():
            env['ind'] += 1

            if env['ind'] >= len(msdp):
                return ''

            if msdp[env['ind']] == MSDP.ARRAY_OPEN:
                return get_msdp_array()
            elif msdp[env['ind']] == MSDP.TABLE_OPEN:
                return get_msdp_table()
                
            # normal var
            start_ind = env['ind'] 
            while env['ind'] < len(msdp) and msdp[env['ind']] not in (MSDP.VAR, MSDP.VAL, MSDP.ARRAY_CLOSE, MSDP.TABLE_CLOSE):
                env['ind'] += 1 
            
            return msdp[start_ind:env['ind']]

        def get_msdp_var():
            env['ind'] += 1
            start_ind = env['ind']

            while msdp[env['ind']] != MSDP.VAL:
                env['ind'] += 1 

            return ( msdp[start_ind:env['ind']], get_msdp_val() )
        

        result = get_msdp_var()
        #with app.test_request_context('/telnet'):
        print result
        socketio.emit('msdp_var', { 'var': result[0], 'val': result[1]},
                    room=self.roomid,
                    namespace='/telnet')

    def write_msdp_var(self, var, val):
        print("write_msdp_var")
        seq = IAC + SB + TELNET_OPTIONS.MSDP + MSDP.VAR + str(var) + MSDP.VAL + str(val) + IAC + SE
        print("Seq:",seq)
        self.sock_write(seq)
        

    def _negotiate(self, socket, command, option):
        # print 'Got ',ord(command),ord(option)
        if command == WILL:
            if option == TELNET_OPTIONS.MSDP:
                self.sock_write(IAC + DO + TELNET_OPTIONS.MSDP)
                
                self.write_msdp_var('CLIENT_ID', "ArcWeb");
                for var_name in self.MSDP_VARS:
                    self.write_msdp_var("REPORT", var_name)
            
        if command == DO:
            if option == TELNET_OPTIONS.TTYPE:
                self.sock_write(IAC + WILL + TELNET_OPTIONS.TTYPE)
            elif option == TELNET_OPTIONS.MXP:
                self.sock_write(IAC + WILL + TELNET_OPTIONS.MXP)
        elif command == SE:
            d = self.telnet.read_sb_data()
            # print 'got',[ord(x) for x in d]
            
            if d == TELNET_OPTIONS.TTYPE + SUB_NEGOTIATION.SEND:
                self.sock_write(IAC + SB + TELNET_OPTIONS.TTYPE + SUB_NEGOTIATION.IS + self.ttypes[self.ttype_index] + IAC + SE)
                self.ttype_index += 1
                if self.ttype_index > len(self.ttypes)-1:
                    self.ttype_index = len(self.ttypes)-1
            elif d[0] == TELNET_OPTIONS.MSDP:
                # print 'get the msdp'
                self.handle_msdp(d[1:])
            

    def _listen(self):
        self.ttype_index = 0
        # self.telnet=Telnet('aarchonmud.com', 7000)
        self.telnet=Telnet('rooflez.com', 7101)

        self.telnet.set_option_negotiation_callback(self._negotiate)

        socketio.emit('telnet_connect', {},
                    room=self.roomid,
                    namespace='/telnet')

        while True:
            if self.abort:
                return
            d = None
            try:
                d = self.telnet.read_very_eager()
            except EOFError:
                socketio.emit('telnet_disconnect', {},
                            room=self.roomid,
                            namespace='/telnet' )
                return

            except Exception as ex:
                with app.text_request_context('/telnet'):
                    socketio.emit('telnet_error', {'message': ex.message},
                            room=self.roomid,
                            namespace='/telnet')
                return

            if d is not None and d != '':
                socketio.emit('telnet_data', {'data':d},
                            room=self.roomid,
                            namespace='/telnet' )
            time.sleep(0.050)

@socketio.on('ack_rx', namespace='/telnet')
def ws_ack_rx(message):
    print("ack_rx running")
    tn = telnets.get(request.sid, None)
    if tn is None:
        print("OMG")
        return

    print "Message ",  message
    try:
        tn.write_msdp_var("ACK_RX", message)
    except Exception as e:
        print "help"
        print e.message
        print traceback.print_exc()

    print "FINISSIMO"

@socketio.on('save_lua', namespace='/telnet')
def ws_save_lua(message):
    print("save_lua running")
    tn = telnets.get(request.sid, None)
    if tn is None:
        return

    tn.write_msdp_var("LUA_EDIT", message['data']) 

@socketio.on('connect', namespace='/telnet')
def ws_connect():
    print('connect running')
    emit('ws_connect', {}, namespace="/telnet")

@socketio.on('disconnect', namespace='/telnet')
def ws_disconnect():
    print('disconnect running ' + request.sid)
    if request.sid in telnets:
        tn = telnets[request.sid]
        tn.stop()
        del telnets[request.sid]
    # emit('ws_disconnect', {}, namespace="/telnet")

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
@login_required
def resize():
    print "resize"
    return render_template('resize.html')


#login_manager.login_view = "users.login"

@login_manager.user_loader
def load_user(user_id):
    #User.query.filter(User.id == int(user_id)).first()
    return User.query.get(user_id)


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
    password = PasswordField(
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
    if g.user is not None and g.user.is_authenticated:
        return redirect(url_for('client'))

    error = None
    form = LoginForm(request.form)
    if request.method == 'POST':
        if form.validate_on_submit():
            user = User.query.filter_by(name=request.form['username']).first()
            if user is not None and bcrypt.check_password_hash(
                user.password, request.form['password']):
                login_user(user)
                # flash('You were logged in. Go Crazy.')
                print user
                return redirect(url_for('client'))

            else:
                error = 'Invalid username or password.'
    return render_template('login.html', form=form, error=error)

@app.route("/logout", methods=['GET'])
@login_required
def logout():
    logout_user()
    return redirect(url_for('client'))


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

@app.before_request
def before_request():
    g.user = current_user

class TELNET_OPTIONS(object):
    TTYPE = chr(24)
    MSDP = chr(69)
    MXP = chr(91)

class SUB_NEGOTIATION(object):
    IS = chr(0)
    SEND = chr(1)
    ACCEPTED = chr(2)
    REJECTED = chr(3)

class MSDP(object):
    VAR = chr(1)
    VAL = chr(2)
    TABLE_OPEN = chr(3)
    TABLE_CLOSE = chr(4)
    ARRAY_OPEN = chr(5)
    ARRAY_CLOSE = chr(6)

if __name__ == "__main__":
    # app.debug=True
    # app.run('0.0.0.0')
    db.create_all()
    socketio.run(app, '0.0.0.0', port=5000 )
    # db.session.commit()

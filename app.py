try:
    import eventlet
    eventlet.monkey_patch()
except ImportError:
    pass
from Queue import Queue
import time
import threading
from telnetlib import Telnet, IAC, DO, WILL, WONT, SB, SE
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

import config


app = Flask(__name__)


socketio = SocketIO(app)


telnets = {}


class TelnetConn:
    ttypes = [config.CLIENT_NAME, 'ANSI', '-256color']
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
        'ROOM_NAME', 'ROOM_EXITS', 'ROOM_VNUM', 'ROOM_SECTOR',
        'EDIT_MODE', 'EDIT_VNUM',
        'AFFECTS']

    def __init__(self, room_id, player_ip):
        self.telnet = None
        self.read_thread = None
        self.write_thread = None

        self.room_id = room_id
        self.player_ip = player_ip
        self.write_lock = threading.Lock()
        self.ttype_index = 0
        self.write_queue = Queue()

        self.abort = False

    def start(self):
        self.read_thread = threading.Thread(target=self._listen)
        self.read_thread.daemon = True
        self.read_thread.start()

        self.write_thread = threading.Thread(target=self._write)
        self.write_thread.daemon=True
        self.write_thread.start()

    def stop(self):
        self.abort = True
        self.telnet.close()
        
    def _write(self):
        while True:
            if self.abort:
                return

            cmd = self.write_queue.get(True, None)
            with self.write_lock:
                try:
                    self.telnet.write(str(cmd))
                except Exception as ex:
                    print ex
                    socketio.emit('telnet_error', {'data': str(ex)},
                                  room=self.room_id,
                                  namespace='/telnet')

    def write(self, cmd):
        self.write_queue.put(cmd)

    def sock_write(self, cmd):
        with self.write_lock:
            self.telnet.get_socket().sendall(cmd)

    def handle_msdp(self, msdp):

        result = parse_msdp(msdp)
        # except Exception as e:
        #     print e

        socketio.emit('msdp_var', {'var': result[0], 'val': result[1]},
                      room=self.room_id,
                      namespace='/telnet')

    def write_msdp_var(self, var, val):
        seq = IAC + SB + TelnetOpts.MSDP + MSDP.VAR + str(var) + MSDP.VAL + str(val) + IAC + SE
        self.sock_write(seq)

    def _negotiate(self, socket, command, option):
        if command == WILL:
            if option == TelnetOpts.ECHO:
                socketio.emit('server_echo', {'data': True}, room=self.room_id, namespace="/telnet")
            elif option == TelnetOpts.MSDP:
                self.sock_write(IAC + DO + TelnetOpts.MSDP)
                
                self.write_msdp_var('CLIENT_ID', "ArcWeb")
                for var_name in self.MSDP_VARS:
                    self.write_msdp_var("REPORT", var_name)
        elif command == WONT:
            if option == TelnetOpts.ECHO:
                socketio.emit('server_echo', {'data': False}, room=self.room_id, namespace="/telnet")
        elif command == DO:
            if option == TelnetOpts.TTYPE:
                self.sock_write(IAC + WILL + TelnetOpts.TTYPE)
            elif option == TelnetOpts.MXP:
                self.sock_write(IAC + WILL + TelnetOpts.MXP)
        elif command == SE:
            d = self.telnet.read_sb_data()
            
            if d == TelnetOpts.TTYPE + TelnetSubNeg.SEND:
                if self.ttype_index >= len(self.ttypes):  # We already sent them all, so send the player IP
                    ttype = self.player_ip
                else:
                    ttype = self.ttypes[self.ttype_index]
                    self.ttype_index += 1
                self.sock_write(IAC + SB + TelnetOpts.TTYPE + TelnetSubNeg.IS + ttype + IAC + SE)
            elif d[0] == TelnetOpts.MSDP:
                self.handle_msdp(d[1:])

    def _listen(self):
        self.ttype_index = 0
        self.telnet = Telnet(config.GAME_HOST, config.GAME_IP)

        self.telnet.set_option_negotiation_callback(self._negotiate)

        socketio.emit('telnet_connect', {},
                      room=self.room_id,
                      namespace='/telnet')

        while True:
            if self.abort:
                socketio.emit('telnet_disconnect', {},
                              room=self.room_id,
                              namespace='/telnet')
                return
            d = None
            try:
                d = self.telnet.read_very_eager()
            except EOFError:
                socketio.emit('telnet_disconnect', {},
                              room=self.room_id,
                              namespace='/telnet')
                return

            except Exception as ex:
                with app.test_request_context('/telnet'):
                    socketio.emit('telnet_error', {'data': ex.message},
                                  room=self.room_id,
                                  namespace='/telnet')
                return

            if d is not None and d != '':
                socketio.emit('telnet_data', {'data': d},
                              room=self.room_id,
                              namespace='/telnet' )
            time.sleep(0.050)


@socketio.on('request_test_socket_response', namespace='/telnet')
def asdf(message):
    emit('reply_test_socket_response', {}, namespace='/telnet')


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


@socketio.on('open_telnet', namespace='/telnet')
def ws_open_telnet(message):
    print 'opening telnet'
    tn = TelnetConn(request.sid, request.remote_addr)
    tn.start()
    telnets[request.sid] = tn


@socketio.on('close_telnet', namespace='/telnet')
def ws_close_telnet(message):
    print 'closing telnet'
    tn = telnets.get(request.sid, None)
    if tn is not None:
        tn.stop()
        del telnets[request.sid]


@socketio.on('send_command', namespace='/telnet')
def ws_send_command(message):
    cmd = message['data']
    if request.sid not in telnets:
        socketio.emit('telnet_error', {'data': 'Telnet connection does not exist.'},
                      room=request.sid,
                      namespace='/telnet')

    cmd = cmd.encode('utf-8', 'replace')
    telnets[request.sid].write(cmd+"\n")


@app.route("/")
def client():
    return render_template('client.html')


class TelnetCmds(object):
    SE = chr(240)  # End of subnegotiation parameters
    NOP = chr(241)  # No operation
    DM = chr(242)  # Data mark
    BRK = chr(243)  # Break
    IP = chr(244)  # Suspend
    AO = chr(245)  # Abort output
    AYT = chr(246)  # Are you there
    EC = chr(247)  # Erase character
    EL = chr(248)  # Erase line
    GA = chr(249)  # Go ahead
    SB = chr(250)  # Go Subnegotiation
    WILL = chr(251)  # will
    WONT = chr(252)  # wont
    DO = chr(253)  # do
    DONT = chr(254)  # dont
    IAC = chr(255)  # interpret as command
TelnetCmdLookup = {v: k for k, v in TelnetCmds.__dict__.iteritems()}


class TelnetOpts(object):
    ECHO = chr(1)
    SUPPRESS_GA = chr(3)
    STATUS = chr(5)
    TIMING_MARK = chr(6)
    TTYPE = chr(24)
    WINDOW_SIZE = chr(31)
    CHARSET = chr(42)
    MSDP = chr(69)
    MCCP = chr(70)
    MSP = chr(90)
    MXP = chr(91)
    ATCP = chr(200)
TelnetOptLookup = {v: k for k, v in TelnetOpts.__dict__.iteritems()}


class TelnetSubNeg(object):
    IS = chr(0)
    SEND = chr(1)
    ACCEPTED = chr(2)
    REJECTED = chr(3)
TelnetSubNegLookup = {v: k for k, v in TelnetSubNeg.__dict__.iteritems()}


class MSDP(object):
    VAR = chr(1)
    VAL = chr(2)
    TABLE_OPEN = chr(3)
    TABLE_CLOSE = chr(4)
    ARRAY_OPEN = chr(5)
    ARRAY_CLOSE = chr(6)
MSDPLookup = {v: k for k, v in MSDP.__dict__.iteritems()}


def _get_msdp_table(msdp):
    # skip first char which should be MSDP.TABLE_OPEN
    i = 1

    rtn = {}
    while msdp[i] != MSDP.TABLE_CLOSE:
        k, v, j = _get_msdp_var(msdp[i:])
        i += j
        rtn[k] = v

    i += 1
    return rtn, i


def _get_msdp_array(msdp):
    # skip first char which should be MSDP.ARRAY_OPEN
    i = 1

    rtn = []
    while msdp[i] != MSDP.ARRAY_CLOSE:
        v, j = _get_msdp_val(msdp[i:])
        i += j
        rtn.append(v)

    i += 1
    return rtn, i


def _get_msdp_val(msdp):
    # skip first char which should be MSDP.VAL
    i = 1

    if i >= len(msdp):
        return '', i

    if msdp[i] == MSDP.ARRAY_OPEN:
        rtn, j = _get_msdp_array(msdp[i:])
        i += j
        return rtn, i
    elif msdp[i] == MSDP.TABLE_OPEN:
        rtn, j = _get_msdp_table(msdp[i:])
        i += j
        return rtn, i

    # normal var
    start_ind = i
    while True:
        if i >= len(msdp):
            break
        if msdp[i] in (MSDP.VAR, MSDP.VAL, MSDP.ARRAY_CLOSE, MSDP.TABLE_CLOSE):
            break
        i += 1

    return msdp[start_ind:i], i


def _get_msdp_var(msdp):
    # skip first char which should be MSDP.VAR
    i = 1

    while msdp[i] != MSDP.VAL:
        i += 1

    var = msdp[1:i]
    val, j = _get_msdp_val(msdp[i:])
    i += j

    return var, val, i


def parse_msdp(msdp):
    # At the highest level, msdp value should always come as a VAR/VAL pair.
    # print ''.join([('{' + MSDPLookup[c] + '}') if c in MSDPLookup else c for c in msdp])
    var, val, j = _get_msdp_var(msdp)

    return var, val


if __name__ == "__main__":
    import sys
    # Running directly is assumed for debug/development
    serve_host = '0.0.0.0'
    serve_port = 5000

    if len(sys.argv) > 1:
        serve_host = sys.argv[1]
    if len(sys.argv) > 2:
        serve_port = int(sys.argv[2])

    app.debug = True
    socketio.run(app, serve_host, port=serve_port)

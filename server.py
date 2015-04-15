
import socket
import sys
from _thread import *

HOST = '0.0.0.0'
PORT = 3001

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
print('Socket created')

try:
	s.bind((HOST, PORT))
except socket.error as msg:
	print('Bind failed. Error code : ' + str(msg[0]) + ' Message ' + msg[1])
	sys.exit()

print('Socket bind complete')

s.listen(30)
print('Socket now listening')

def clientthreat(conn):
	while True:
		data = conn.recv(1024)
		if not data:
			break
		print((data[5:8]).decode('utf-8'));
	conn.close()

while 1:
	conn, addr = s.accept()
	#print('Connected with ' + addr[0] + ':' + str(addr[1]))

	start_new_thread(clientthreat,(conn,))

s.close()

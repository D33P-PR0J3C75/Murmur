# imports
from flask import Flask
from flask_socketio import SocketIO, emit

# data
users = []
messages = []

# app
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# functions
@socketio.on("connect")
def on_connect():
  print("Connected")

@socketio.on("disconnect")
def on_disconnect():
  print("Disconnected")

@socketio.on("send_message")
def on_message(data):
  print("Received:", data)
  messages.append(data)
  emit(
    "new_message",
    data,
    broadcast=True
  )

@app.route("/")
def index():
  return "Murmur is running."

if __name__ == "__main__":
  socketio.run(
    app,
    host="0.0.0.0",
    port=5000,
    debug=True
  )

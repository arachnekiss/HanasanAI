from app import app, socketio  # noqa: F401

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)

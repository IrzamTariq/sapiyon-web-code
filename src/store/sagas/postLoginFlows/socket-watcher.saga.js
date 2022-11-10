import { eventChannel } from 'redux-saga';
import { take, call, put } from 'redux-saga/effects';
import socket from '../../../services/socket';

function createSocketChannel(socket) {
  return eventChannel(emitter => {
    socket.on('reconnecting', () => {
      emitter({ type: 'SOCKET_RECONNECTING' });
    });

    socket.on('reconnect', () => {
      emitter({ type: 'SOCKET_RECONNECTED' });
    });

    socket.on('reconnect_error', e => {
      emitter({ type: 'SOCKET_RECONNECT_ERROR' });
    });

    return () => {
      socket.off('reconnect');
      socket.off('reconnecting');
      socket.off('reconnect_error');
    };
  });
}

export default function* socketWatcherSaga() {
  const socketChannel = yield call(createSocketChannel, socket);
  while (true) {
    let action = yield take(socketChannel);
    yield put(action);
  }
}

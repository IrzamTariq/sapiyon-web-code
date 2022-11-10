import logger from "logger";
import { eventChannel } from "redux-saga";
import { call, put, take } from "redux-saga/effects";

import client from "../../../services/client";

// this function creates an event channel from a given socket
// Setup subscription to incoming `ping` events
function createSocketChannel(socket, servicePath, entityName) {
  // `eventChannel` takes a subscriber function
  // the subscriber function takes an `emit` argument to put messages onto the channel
  return eventChannel((emit) => {
    const handleCreated = (payload) => {
      // puts event payload into the channel
      // this allows a Saga to take this payload from the returned channel
      emit({ type: `SERVICE_WATCHER_${entityName}_CREATED`, payload });
    };

    const handlePatched = (payload) => {
      // puts event payload into the channel
      // this allows a Saga to take this payload from the returned channel
      emit({ type: `SERVICE_WATCHER_${entityName}_PATCHED`, payload });
    };

    const handleRemoved = (payload) => {
      // puts event payload into the channel
      // this allows a Saga to take this payload from the returned channel
      emit({ type: `SERVICE_WATCHER_${entityName}_REMOVED`, payload });
    };

    const handleError = (errorEvent) => {
      // create an Error object and put it into the channel
      emit({
        type: `SERVICE_WATCHER_${entityName}_ERROR`,
        payload: errorEvent,
      });
    };

    // setup the subscription
    socket.service(servicePath).on("created", handleCreated);
    socket.service(servicePath).on("patched", handlePatched);
    socket.service(servicePath).on("removed", handleRemoved);
    socket.service(servicePath).on("error", handleError);

    // the subscriber must return an unsubscribe function
    // this will be invoked when the saga calls `channel.close` method
    const unsubscribe = () => {
      socket.service(servicePath).off("created", handleCreated);
      socket.service(servicePath).off("patched", handlePatched);
      socket.service(servicePath).off("removed", handleRemoved);
      socket.service(servicePath).off("error", handleError);
    };

    return unsubscribe;
  });
}

const serviceWatcher = (servicePath = "", entityName = "") => {
  return function* watch() {
    const socketChannel = yield call(
      createSocketChannel,
      client,
      servicePath,
      entityName,
    );

    while (true) {
      try {
        // An error from socketChannel will cause the saga jump to the catch block
        const action = yield take(socketChannel);
        yield put(action);
      } catch (err) {
        logger.error("socket error:", err);
        // socketChannel is still open in catch block
        // if we want end the socketChannel, we need close it explicitly
        // socketChannel.close()
      }
    }
  };
};
export default serviceWatcher;

import feathersClient from "@feathersjs/client";

import socket from "./socket";

const client = feathersClient();

client.configure(
  feathersClient.socketio(socket, {
    timeout: 60000,
  }),
);
client.configure(feathersClient.authentication());

client.on("reauthentication-error", (e) => {
  try {
    client.reAuthenticate();
  } catch (error) {
    // console.log(error);
  }
});

function getClientInfo() {
  return {
    type: "web",
  };
}

function addClientInfo() {
  return (context) => {
    const { query = {} } = context.params;

    const updatedQuery = { ...query, client: getClientInfo() };

    context.params.query = updatedQuery;
    return context;
  };
}

client.hooks({
  before: {
    all: [addClientInfo()],
  },
});

export default client;

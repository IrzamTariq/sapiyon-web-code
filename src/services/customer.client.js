import feathersClient from "@feathersjs/client";
import socket from "./socket";

const client = feathersClient();

client.configure(
  feathersClient.socketio(socket, {
    timeout: 60000,
  }),
);
client.configure(
  feathersClient.authentication({ path: "customer/authentication" }),
);

client.on("reauthentication-error", (e) => {
  try {
    client.reAuthenticate();
  } catch (error) {
    // console.log(error);
  }
});

export default client;

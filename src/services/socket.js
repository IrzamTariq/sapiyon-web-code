import io from "socket.io-client";
import { isEnv } from "./../utils/helpers";

function getSocket() {
  if (isEnv("production")) {
    return io("https://app.sapiyon.com", {
      path: "/api/socket.io",
    });
  }

  if (isEnv("test")) {
    return io("https://dev.sapiyon.com", {
      path: "/api/socket.io",
    });
  }
  return io("http://localhost:7860");
}

export default getSocket();

import client from "./client";

export async function signup(registrationInfo) {
  return client.service("users").create(registrationInfo);
}

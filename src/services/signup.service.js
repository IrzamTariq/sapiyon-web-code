import client from "./client";

export async function signup(registrationInfo) {
  return client.service("users").create(registrationInfo);
}

export async function resendVerifyEmail(request) {
  return client.service("user/resend-verify-email").create(request);
}

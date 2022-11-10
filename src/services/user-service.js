import client from './client';

export async function forgetPassword(accountInfo) {
  return client.service('user/recover-password').create(accountInfo);
}

export async function resetPassword(accountInfo) {
  return client.service('user/reset-password').create(accountInfo);
}

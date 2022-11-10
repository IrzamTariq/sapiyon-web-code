import feathersClient from "@feathersjs/client";
import { apiBaseURL } from "../utils/helpers";

const axios = require("axios");

const client = feathersClient();

let restClient = feathersClient.rest(apiBaseURL());

client.configure(restClient.axios(axios));
client.configure(feathersClient.authentication());

export default client;

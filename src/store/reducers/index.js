import { combineReducers } from "redux";

import {
  forgetPasswordReducer,
  resendVerifyEmailReducer,
  resetPasswordReducer,
  signupReducer,
  verifyEmailReducer,
} from "./../auth";
import authReducer from "./../auth/authentication";
import customers from "./../customers";
import firmReducer from "./../firm";
import firmRoles from "./../firm/roles";
import firmTeams from "./../firm/teams";
import reports from "./../reports";
import users from "./../users";
import customerActions from "../customerActions";
import customerAuthentication from "../customerAuthentication";
import feedback from "../feedback";
import feedbackFilters from "../feedbackFilters";
import subscription from "../subscription";

const rootReducer = combineReducers({
  auth: authReducer,
  signup: signupReducer,
  accountVerification: verifyEmailReducer,
  resendAccountVerification: resendVerifyEmailReducer,
  forgetPasswordRequest: forgetPasswordReducer,
  resetPassword: resetPasswordReducer,
  users,
  customers,
  teams: firmTeams,
  firm: firmReducer,
  firmRoles,
  reports,
  subscription,
  feedback,
  feedbackFilters,
  customerActions,
  customerAuthentication,
});

export default rootReducer;

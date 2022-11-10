import React, { Component } from "react";
import SubscriptionModal from "./components/SubscriptionModal";
import { connect } from "react-redux";
import {
  doSubscriptionSaveRequest,
  doSaveChangesLocally,
  doEndSubscription,
  doStartSubscription,
  doFetchUserCount,
  doSetFormProcessingState,
} from "../../store/subscription";

class SubscriptionModalContainer extends Component {
  componentDidMount() {
    let auth = localStorage.getItem("feathers-jwt");
    if (auth) {
      this.props.doFetchUserCount();
    }
  }
  render() {
    return <SubscriptionModal {...this.props} />;
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  editedRecord: state.subscription.editedRecord,
  firm: state.auth.user.firm,
  isSubscribing: state.subscription.isSubscribing,
  userCount: state.subscription.userCount,
  isProcessing: state.subscription.isProcessing,
});

const mapDispatchToProps = {
  doSaveChangesLocally,
  doSubscriptionSaveRequest,
  doStartSubscription,
  doEndSubscription,
  doFetchUserCount,
  doSetFormProcessingState,
};
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SubscriptionModalContainer);

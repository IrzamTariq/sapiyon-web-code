import "./i18n";

import { ConfigProvider } from "antd";
import trTR from "antd/es/locale/tr_TR";
import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import TagManager from "react-gtm-module";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { applyMiddleware, compose, createStore } from "redux";
import createSagaMiddleware from "redux-saga";

import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import GoogleMapLoader from "./components/GoogleMaps/GoogleMapLoader";
import { NetworkStatusProvider } from "./contexts/network.context";
import Loader from "./scenes/Loader";
import * as serviceWorker from "./serviceWorker";
import { loadState, saveState } from "./store/localstorage";
// Import the index reducer and sagas
import rootReducer from "./store/reducers";
import rootSaga from "./store/sagas";

// import { RoutedTourContext } from "./TourContext";

// Setup the middleware to watch between the Reducers and the Actions
const sagaMiddleware = createSagaMiddleware();

const persistedState = loadState();

const store = createStore(
  rootReducer,
  { auth: persistedState },
  compose(
    applyMiddleware(sagaMiddleware),
    process.env.NODE_ENV !== "production" && window.__REDUX_DEVTOOLS_EXTENSION__
      ? window.__REDUX_DEVTOOLS_EXTENSION__()
      : (f) => f,
  ),
);
// Run root saga
sagaMiddleware.run(rootSaga);

// persist state
store.subscribe(() => {
  saveState(store.getState().auth);
});

const tagManagerArgs = {
  gtmId: "GTM-MHBBTDV",
};

TagManager.initialize(tagManagerArgs);

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<Loader />}>
          <NetworkStatusProvider>
            <ConfigProvider locale={trTR}>
              <GoogleMapLoader>
                {/* <RoutedTourContext> */}
                <App />
                {/* </RoutedTourContext> */}
              </GoogleMapLoader>
            </ConfigProvider>
          </NetworkStatusProvider>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  </Provider>,
  document.getElementById("root"),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

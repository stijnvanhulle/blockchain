import "./index.scss";

import moment from "moment";
import * as OfflinePluginRuntime from "offline-plugin/runtime";
import React from "react";
import { hydrate, render } from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";

import { App } from "./App";
import Routes from "./Routes";


const rootElement = document.getElementById("app");

OfflinePluginRuntime.install();

export const renderReact = () => {
  if (rootElement.hasChildNodes()) {
    hydrate(
      <Router>
        <App>{Routes}</App>
      </Router>,
      rootElement,
    );
  } else {
    render(
      <Router>
        <App>{Routes}</App>
      </Router>,
      rootElement,
    );
  }
};
global.moment = moment;
// eslint-disable-next-line no-undef
console.log(process.env.NODE_ENV, process.env.PROXY);

document.addEventListener("DOMContentLoaded", () => {
  renderReact();
});

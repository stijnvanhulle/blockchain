import React, { Fragment } from "react";
import { Route } from "react-router";
import HomePage from "./pages/HomePage";

export const routes = [
  {
    path: "/",
    text: "Home",
    visible: false,
    component: HomePage,
  },

];

export default (
  <Fragment>
    {routes.map(({ path, component }) => <Route exact path={path} component={component} />)}
  </Fragment>
);
// <Route path='*' component={NotFound} />

// @flow
import React, { Component, Fragment } from "react";
import { PageContainer } from "./components/pageContainer";

type Props={
  children:any,
}
type State = {

};

export class App extends Component<Props, State> {
  constructor() {
    super();
    this.state = { };
  }

  render() {
    const { children } = this.props;
    return (
      <PageContainer>
        <Fragment>
          <main>{children}</main>
        </Fragment>
      </PageContainer>
    );
  }
}

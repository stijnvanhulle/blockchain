import PropTypes from "prop-types";
import React from "react";
import { LoaderStyle } from "./LoaderStyle";

export const Loader = ({ size, color }) => (
  <LoaderStyle size={size} color={color}>
    <div className="wrapper">
      <div className="ball" />
      <div className="circle" />
    </div>
  </LoaderStyle>
);

Loader.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
};

Loader.defaultProps = {
  color: "#000000",
  size: 60,
};

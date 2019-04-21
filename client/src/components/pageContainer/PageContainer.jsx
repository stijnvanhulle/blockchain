import PropTypes from "prop-types";
import React, { Fragment } from "react";
import { Helmet } from "react-helmet";
import { ThemeProvider } from "styled-components";
import { theme } from "../../config/theme";
import { Loader } from "../loader";

export const PageContainer = ({ seo, loading, children }) => (
  <ThemeProvider theme={theme}>
    <Fragment>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>
      {loading ? <Loader color={theme.primaryColor} size={80} margin="4px" /> : children}
    </Fragment>
  </ThemeProvider>
);

PageContainer.defaultProps = {
  seo: {
    title: "Bf react template",
    description: "",
  },
  loading: false,
  children: null,
};

PageContainer.propTypes = {
  seo: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
  }),
  loading: PropTypes.bool,
  children: PropTypes.element,
};

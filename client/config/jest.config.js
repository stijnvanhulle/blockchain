const fs = require("fs");
const path = require("path");

const base = "../src";

module.exports = {
  moduleFileExtensions: ["js", "jsx", "scss"],
  roots: [base],
  testPathIgnorePatterns: ["/node_modules/", "/build/"],
  collectCoverage: true,
  verbose: true,
  notify: true,
  clearMocks: true,
  coverageDirectory: "coverage",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/setupTests.js"]
};

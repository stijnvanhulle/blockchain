const shell = require("shelljs");
const chalk = require("chalk");
const figlet = require("figlet");

const rimraf = require("rimraf");
const argv = require("minimist")(process.argv.slice(2));

const webpack = require("webpack");
const webpackConfig = require("../config/webpack.config");
const pjson = require("../package.json");
const pkg = require("../package");

const timeStamp = Date.now();
const timeStampString = timeStamp.toString();


if (argv && argv.e) {
  process.env.NODE_ENV = argv.e;
} else if (!process.env.NODE_ENV) {
  console.log("no environment set, defaulting to prod");
  process.env.NODE_ENV = "production";
}

console.log(`environment is set to ${process.env.NODE_ENV}`);

console.log(
  figlet.textSync(pkg.name, {
    font: "Doom",
    horizontalLayout: "default",
    verticalLayout: "default",
  }),
);

// Clean build Folder
rimraf("./build", (err) => {
  if (err) {
    console.log(` failed to clean build folder: ${err}`);
  }

  webpack(webpackConfig, (error, stats) => {
    if (error) {
      console.log(`webpack error: ${error}`);
    }
    if (stats) {
      console.log(`webpack stats: ${stats}`);
    }

    console.log(
      chalk.green(
        `Finished Build Version: ${pjson.version}.${timeStampString} at ${new Date(timeStamp)}`,
      ),
    );
  });
});

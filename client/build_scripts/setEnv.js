/* eslint-disable no-console */
const argv = require('minimist')(process.argv.slice(2));
const cpr = require('cpr');

if (argv && argv.e) {
  process.env.NODE_ENV = argv.e;
} else {
  console.log('no environment set, defaulting to dev');
  process.env.NODE_ENV = 'development';
}

console.log(process.env.NODE_ENV, 'env');

// Copy App Config

//default copy
const copyDefault = () => {
  cpr(`./config/environments/example.env`, `.env`, { deleteFirst: true, overwrite: true }, err => {
    if (err) {
      console.log(`copying config example failed with error: ${err}`);
    }
  });
};

cpr(
  `./config/environments/${process.env.NODE_ENV}.env`,
  `.env`,
  { deleteFirst: true, overwrite: true },
  err => {
    if (err) {
      console.log(`copying config failed with error: ${err}`);
      copyDefault();
    }
  }
);

/* eslint-enable no-console */

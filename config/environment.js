require('dotenv').config();

const environment = {
  PORT: process.env.PORT || 8080,
  DEMO_MODE: process.env.DEMO_MODE === 'true',
  SEED_ON_START: process.env.SEED_ON_START === 'true'
};

module.exports = environment;
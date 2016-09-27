const AccessTokenProvider = require('../services/access-token-provider');
const log = require('log4js').getLogger('boot.AccessTokenProvider');

module.exports = (app) => {
  log.info('Setting up AccessTokenProvider');
  let accessTokenProvider = new AccessTokenProvider(app.get('tenantAuthConfig'));
  app.accessTokenProvider = accessTokenProvider;
};

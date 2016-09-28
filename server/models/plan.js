const request = require('request-promise');
const Promise = require('bluebird');
const jwt = require('jwt-simple');
const log = require('log4js').getLogger('model.Plan');

module.exports = function(Plan) {
  Plan.remoteMethod('getPlans', {
    http: {path: '/', verb: 'GET'},
    accepts: [
      {arg: 'filter', type: 'string', 'http': {source: 'query'}}
    ],
    returns: {arg: 'plans', type: 'object', root: true}
  });

  Plan.getPlans = (filter, callback) => {
    let saasManagerApis = Plan.app.get('saasManagerApis');
    let plansUrl = saasManagerApis.plansUrl;

    Plan.app.accessTokenProvider.getAccessToken()
      .then((tenantAccessToken) => {
        return request({
          method: 'GET', uri: plansUrl, json: true, qs: {
            filter: filter,
            'access_token': tenantAccessToken.access_token
          }
        });
      })
      .then((plans) => callback(false, plans))
      .catch((error) => callback(error));
  };
};

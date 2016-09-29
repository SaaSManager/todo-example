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
    returns: {arg: 'plans', type: 'object', root: true},
    description: 'Fetch list of premium (non-default) plans'
  });

  Plan.remoteMethod('buy', {
    http: {path: '/:planId/buy'},
    accepts: [
      {arg: 'planId', type: 'string', 'http': {source: 'path'}},
      {arg: 'profileId', type: 'string', required: true},
      {arg: 'nonce', required: false, type: 'string'}
    ],
    returns: {arg: 'plans', type: 'object', root: true},
    description: 'Purchase plan for current user'
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

  Plan.buy = (planId, profileId, nonce, callback) => {
    let saasManagerApis = Plan.app.get('saasManagerApis');
    let buyPlansUrl = saasManagerApis.plansUrl + '/' + planId + '/buy';

    Plan.app.accessTokenProvider.getAccessToken()
      .then((tenantAccessToken) => {
        return request({
          method: 'POST', uri: buyPlansUrl, json: true,
          qs: {
            'access_token': tenantAccessToken.access_token
          },
          body: {
            nonce: nonce,
            profileId: profileId
          }
        });
      })
      .then((plans) => callback(false, plans))
      .catch((error) => callback(error));
  };
};

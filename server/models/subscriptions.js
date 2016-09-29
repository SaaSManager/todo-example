const request = require('request-promise');
const jwt = require('jwt-simple');
const log = require('log4js').getLogger('model.Subscription');

module.exports = function(Subscription) {

  Subscription.remoteMethod('cancel', {
    http: {path: '/:id/cancel'},
    accepts: [
      {arg: 'id', type: 'string', 'http': {source: 'path'}}
    ],
    returns: {arg: 'subscription', type: 'object', root: true},
    description: 'Cancel subscription'
  });

  Subscription.cancel = (id, callback) => {
    let saasManagerApis = Subscription.app.get('saasManagerApis');
    let subsUrl = saasManagerApis.subscriptionsUrl + '/' + id;

    Subscription.app.accessTokenProvider.getAccessToken()
      .then((tenantAccessToken) => {
        return request({
          method: 'PUT', uri: subsUrl, json: true,
          qs: {
            'access_token': tenantAccessToken.access_token
          },
          body: {
            status: 'CANCELLED',
            cancelledDate: new Date()
          }
        });
      })
      .then((subscription) => callback(false, subscription))
      .catch((error) => callback(error));
  };
};

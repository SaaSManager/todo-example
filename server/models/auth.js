const request = require('request-promise');

module.exports = function(Auth) {
  Auth.remoteMethod('login', {
    http: {path: '/login'},
    accepts: {arg: 'credentials', type: 'Credentials', http: {source: 'body'}},
    returns: {arg: 'userInfo', type: 'object', root: true}
  });

  Auth.remoteMethod('register', {
    http: {path: '/register'},
    accepts: {arg: 'credentials', type: 'Credentials', http: {source: 'body'}},
    returns: {arg: 'userInfo', type: 'object', root: true}
  });

  Auth.login = (credentials, callback) => {
    let userAuthConfig = Auth.app.get('userAuthConfig');
    Auth.app.accessTokenProvider.getAccessToken()
      .then((tenantAccessToken) => {
        return request({
          method: 'POST', uri: userAuthConfig.tokenUrl, json: true,
          body: credentials,
          qs: {
            'access_token': tenantAccessToken.access_token
          }
        });
      })
      .then((userAccessToken) => callback(false, userAccessToken))
      .catch((error) => callback(error));
  };

  Auth.register = (credentials, callback) => {
    let userAuthConfig = Auth.app.get('userAuthConfig');
    Auth.app.accessTokenProvider.getAccessToken()
      .then((tenantAccessToken) => {
        return request({
          method: 'POST', uri: userAuthConfig.register, json: true,
          body: {
            user: credentials,
            options: {
              isDefault: true,
              isAdmin: true
            }
          },
          qs: {
            'access_token': tenantAccessToken.access_token
          }
        });
      })
      .then((userAccessToken) => callback(false, userAccessToken))
      .catch((error) => callback(error));
  };
};

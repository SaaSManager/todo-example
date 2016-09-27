const request = require('request-promise');
const Promise = require('bluebird');
const jwt = require('jwt-simple');
const log = require('log4js').getLogger('service.AccessTokenProvider');

function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace('-', '+').replace('_', '/');

  var json = new Buffer(base64, 'base64').toString('binary');
  return JSON.parse(json);
};

function AccessTokenProvider(options) {
  this.options = options;
  this.accessToken = null;
};

AccessTokenProvider.prototype.getAccessToken = function() {
  var self = this;
  if(!this.accessToken){
    return request({
      method: 'POST', uri: this.options.tokenUrl, json: true,
      body: {
        "username" : this.options.email,
        "password" : this.options.password
      }
    }).then(accessToken => {
      self.accessToken = accessToken;
      return self.accessToken;
    });
  }else{
    return Promise.resolve(this.accessToken);
  }
};

AccessTokenProvider.prototype.getUserInfo = function(accessToken) {
  return this.getAccessToken()
    .then(tenantAccessToken => {
      log.debug('tenantAccessToken:', tenantAccessToken);
      var myTenant = parseJwt(tenantAccessToken.access_token).userInfo;
      var myUser = jwt.decode(accessToken, myTenant.jwtSignature);

      log.debug('myTenant:', myTenant);
      log.debug('myUser:', myUser);

      return Promise.resolve({
        user : myUser,
        tenant : myTenant,
        accessToken : accessToken
      })
    });
};

module.exports = AccessTokenProvider;

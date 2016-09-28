const loopback = require('loopback');
const boot = require('loopback-boot');
const request = require('request-promise');
const config = require('./config.json');
const log = require('log4js').getLogger('server');
const jwt = require('jwt-simple');

var app = module.exports = loopback();
var apiUrl = config.restApiRoot + '/*';

function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace('-', '+').replace('_', '/');

  var json = new Buffer(base64, 'base64').toString('binary');
  return JSON.parse(json);
};


app.use(loopback.context());
app.use(['/api/todos'], function(req, res, next) {
  var accessToken = req.query.access_token || req.headers.authorization;
  if(accessToken) {
    app.accessTokenProvider.getUserInfo(accessToken)
      .then(userInfo => {
        log.debug('userInfo:', userInfo);
        loopback.getCurrentContext().set('userInfo', userInfo);
        next();
      }).catch(error => {
        log.error(error);
        next(error);
      });
  } else {
    log.debug('missing accessToken');
    next({
      name: 'MISSING_ACCESS_TOKEN', status: 401,
      message: 'tenant access token is required to access this endpoint'
    });
  }
});

app.start = () => {
  // start the web server
  return app.listen(() => {
    app.emit('started');

    var baseUrl = app.get('url').replace(/\/$/, '');
    log.info('Web server listening at: %s', baseUrl);

    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      log.info('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};


// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});

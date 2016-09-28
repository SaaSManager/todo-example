const request = require('request-promise');
const crypto = require('crypto');
const log = require('log4js').getLogger('model.TodoItem');
const _ = require('lodash');
const loopback = require('loopback');

module.exports = function(TodoItem) {
  TodoItem.observe('before save', (ctx, next) => {

    let context = loopback.getCurrentContext().get('userInfo');
    let user    =  context.user.userInfo;

    if(ctx.instance) {
      ctx.instance.userId = user.user.id;
    } else if(ctx.currentInstance.userId !== user.user.id) {
      return next({
        status: 403,
        code: 'ACCESS_FORBIDDEN',
        message: 'Write access forbidden'
      });
    }

    let quota   = user.quota;
    let maxTodoItemsConstraints = _.filter(quota, {'code': 'MAX_TODO_ITEMS'}).map(quota => quota.quantity);
    let maxTodoItemsQuota = Math.max.apply(Math, maxTodoItemsConstraints);

    log.debug('maxTodoItemsQuota: %d', maxTodoItemsQuota);
    TodoItem.count({userId: user.user.id})
      .then((count) => {
        if (count <= maxTodoItemsQuota) {
          next();
        } else {
          next({
            status: 412,
            message: 'max items count: ' + maxTodoItemsQuota
          });
        }
      });
  });
};

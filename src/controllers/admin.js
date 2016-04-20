'use strict';

export function * userList() {
  let offset = this.query.offset || 0;
  const USER = this.orm().User;
  let users = yield USER.findAndCountAll({
    attributes: ['username', 'totp_key'],
    where: {
      enable: 1
    },
    offset: offset * 20,
    limit: 20,
    order: [
      ['username', 'ASC']
    ]
  });
  yield this.render('admin/users', {
    users: 'active',
    data: users,
    offset: offset
  });
}

export function * clientList() {
  let offset = this.query.offset || 0;
  const CLIENT = this.orm().Client;
  let clients = yield CLIENT.findAndCountAll({
    attributes: ['id', 'secret', 'redirect_uri', 'name'],
    offset: offset * 20,
    limit: 20,
    order: [
      ['name', 'ASC']
    ]
  });
  yield this.render('admin/clients', {
    clients: 'active',
    data: clients,
    offset: offset
  });
}

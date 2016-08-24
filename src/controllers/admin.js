'use strict';

import { generateToken, encodeKey, totpImage } from '../util';

export function * checkLogin(next) {
  if (this.session.user) {
    if (this.session.user.is_admin) {
      this.state.user = this.session.user;
      yield * next;
    } else {
      this.redirect(this._routes.home);
    }
  } else {
    this.session.returnTo = this.url;
    this.redirect(this._routes.login);
  }
}

export function * userList() {
  const User = this.orm().User;

  let offset = this.query.offset || 0;
  let users = yield User.findAndCountAll({
    attributes: {
      exclude: ['pass_hash', 'pass_salt']
    },
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
  const Client = this.orm().Client;

  let offset = this.query.offset || 0;
  let clients = yield Client.findAndCountAll({
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

export function * sendTotp() {
  const User = this.orm().User;
  const {username} = this.request.body;

  if (!username) {
    this.flash('error', 'Username is required');
    this.redirect(this._routes.users);
    return;
  }

  try {
    // generate new totp key
    let res = yield User.update({
      totp_key: generateToken()
    }, {
      where: {
        username: username
      }
    });
    // send email
    if (res[0]) {
      let user = yield User.findOne({
        where: {
          username: username
        }
      });
      yield this.sendMail(user.email, 'send_totp', {
        username: user.username,
        cid: 'key',
        email: user.email,
        key: encodeKey(user.totp_key)
      }, [{
        filename: 'key.png',
        content: totpImage(user.email, user.totp_key),
        cid: 'key'
      }]);
    } else {
      this.flash('error', 'Update failed');
      this.redirect(this._routes.users);
      return;
    }
    this.flash('success', 'Reset and send TOTP key successfully');
    this.redirect(this._routes.users);
  } catch (e) {
    console.error(e.stack);
    this.flash('error', 'Reset and send key failed');
    this.redirect(this._routes.users);
  }
}

export function * addClient() {
  const Client = this.orm().Client;
  const {name, redirect_uri} = this.request.body;

  if (!name) {
    this.flash('error', 'Name is required');
    this.redirect(this._routes.clients);
    return;
  }

  if (!redirect_uri) {
    this.flash('error', 'Redirect URI is required');
    this.redirect(this._routes.clients);
    return;
  }

  try {
    // add one new
    yield Client.create({
      secret: generateToken(),
      name: name,
      redirect_uri: redirect_uri
    });

    this.flash('success', 'Add new client successfully');
    this.redirect(this._routes.clients);
  } catch (e) {
    console.error(e.stack);
    this.flash('error', 'Add new client failed');
    this.redirect(this._routes.clients);
  }
}

export function * generateSecret() {
  const Client = this.orm().Client;
  const {id} = this.request.body;

  if (!id) {
    this.flash('error', 'ID is required');
    this.redirect(this._routes.clients);
    return;
  }

  try {
    // generate new secret
    let res = yield Client.update({
      secret: generateToken()
    }, {
      where: {
        id: id
      }
    });
    if (res[0]) {
      this.flash('success', 'Generate new secret successfully');
      this.redirect(this._routes.clients);
    } else {
      this.flash('error', 'Update failed');
      this.redirect(this._routes.clients);
      return;
    }
  } catch (e) {
    console.error(e.stack);
    this.flash('error', 'Generate new secret failed');
    this.redirect(this._routes.clients);
  }
}

export function * addUser() {
  const User = this.orm().User;
  const EmailCode = this.orm().EmailCode;
  const sequelize = this.orm().sequelize;
  const {username, email} = this.request.body;
  let t = yield sequelize.transaction();

  if (!username) {
    this.flash('error', 'Username is required');
    this.redirect(this._routes.users);
    return;
  }

  if (!email) {
    this.flash('error', 'Email is required');
    this.redirect(this._routes.users);
    return;
  }

  try {
    // add one new
    let user = yield User.add({
      username: username,
      email: email,
      password: 'helloCNOOD',
      totp_key: generateToken()
    }, t);
    // 生成code
    let code = yield EmailCode.create({
      user_id: username
    }, {
      transaction: t
    });

    yield t.commit();

    // send email
    if (user && code) {
      yield this.sendMail(user.email, 'add_user', {
        username: user.username,
        cid: 'key',
        email: user.email,
        key: encodeKey(user.totp_key),
        ttl: this.config.emailCodeTTL / 3600,
        link: this.config.domain + this._routes.password_change + '?code=' + code.id
      }, [{
        filename: 'key.png',
        content: totpImage(user.email, user.totp_key),
        cid: 'key'
      }]);
    } else {
      this.flash('error', 'Add new user failed');
      this.redirect(this._routes.users);
      return;
    }

    this.flash('success', 'Add new user successfully');
    this.redirect(this._routes.users);
  } catch (e) {
    console.error(e.stack);
    this.flash('error', 'Add new user failed');
    this.redirect(this._routes.users);
  }
}

//
// Copyright (C) 2016 Changzhou TwistSnake Co.,Ltd
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

const debug = require('debug')('leancloud:authentication:local');
const rp = require('request-promise');

const defaults = {
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
  session: false
};

/**
 * 登录服务
 */
export class Service {

  constructor(options = {}) {
    if (!options.leanCloud) {
      throw new Error('LeanCloud instance needs to be provided');
    }
    this.leanCloud = options.leanCloud;
  }

  // POST /auth/local
  //
  // curl -X POST \
  // -H "Content-Type: application/json" \
  // -d '{"username":"hjiang","password":"f32@ds*@&dsa"}' \
  create(data, params) {
    if (!data.username) {
      throw new Error('Field \'username\' needs to be provided');
    }
    if (!data.password) {
      throw new Error('Field \'password\' needs to be provided');
    }

    return rp('https://api.leancloud.cn/1.1/login', {
      method: 'POST',
      json: true,
      headers: {
        'X-LC-Id': this.leanCloud.applicationId,
        'X-LC-Key': this.leanCloud.applicationKey
      },
      body: {
        username: data.username,
        password: data.password
      }
    });
  }

  setup(app) {
    // attach the app object to the service context
    // so that we can call other services
    this.app = app;

    // prevent regular service events from being dispatched
    if (typeof this.filter === 'function') {
      this.filter(() => false);
    }
  }
}

export default function(options) {
  options = Object.assign({}, defaults, options);
  // debug('Configuring local authentication service with options', options);
  return function() {
    const app = this;

    // Initialize our service with any options it requires
    // app.use(options.localEndpoint,
    //   exposeConnectMiddleware,
    //   new Service(options),
    //   successfulLogin(options));

    app.use(options.localEndpoint, new Service(options));

    // Get our initialize service to that we can bind hooks
    const localService = app.service(options.localEndpoint);

    // Register our local auth strategy and get it to use the passport callback function
    // debug('Registering passport-local strategy');
    // passport.use(new Strategy(options, localService.checkCredentials.bind(localService)));
  };
}

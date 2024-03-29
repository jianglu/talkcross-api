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

import local from './services/local'

// Options that apply to any provider
const defaults = {
  idField: '_id',
  shouldSetupSuccessRoute: true,
  shouldSetupFailureRoute: true,
  successRedirect: '/auth/success',
  failureRedirect: '/auth/failure',
  tokenEndpoint: '/auth/token',
  localEndpoint: '/auth/local',
  userEndpoint: '/users',
  header: 'authorization',
  cookie: {
    name: 'feathers-jwt',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production'
  }
};

export default function auth(config = {}) {
  return function() {
    const app = this;

    // Merge and flatten options
    const authOptions = Object.assign({}, defaults, {
      leanCloud: app.leanCloud
    }, app.get('auth'), config);

    app.configure(local(authOptions));
  }
}

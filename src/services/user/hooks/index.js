//
// Copyright (C) 2016 Changzhou TwistSnake Co.,Ltd
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;

exports.before = {
  all: [],
  find: [
    // auth.verifyToken(),
    // auth.populateUser(),
    // // auth.restrictToAuthenticated()
  ],
  get: [
    // auth.verifyToken(),
    // auth.populateUser(),
    // auth.restrictToAuthenticated(),
    // auth.restrictToOwner({ ownerField: '_id' })
  ],
  create: [
    // auth.hashPassword()
  ],
  update: [
    // auth.verifyToken(),
    // auth.populateUser(),
    // auth.restrictToAuthenticated(),
    // auth.restrictToOwner({ ownerField: '_id' })
  ],
  patch: [
    // auth.verifyToken(),
    // auth.populateUser(),
    // auth.restrictToAuthenticated(),
    // auth.restrictToOwner({ ownerField: '_id' })
  ],
  remove: [
    // auth.verifyToken(),
    // auth.populateUser(),
    // auth.restrictToAuthenticated(),
    // auth.restrictToOwner({ ownerField: '_id' })
  ]
};

exports.after = {
  all: [hooks.remove('password')],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};

'use strict';
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

const winston = require('winston');

module.exports = function(app) {
  // Add a logger to our app object for convenience
  app.logger = winston;

  return function(error, req, res, next) {
    if (error) {
      const message = `${error.code ? `(${error.code}) ` : '' }Route: ${req.url} - ${error.message}`;

      if (error.code === 404) {
        winston.info(message);
      }
      else {
        winston.error(message);
        winston.info(error.stack);
      }
    }

    next(error);
  };
};

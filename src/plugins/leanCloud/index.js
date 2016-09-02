'use strict';
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

const debug = require('debug')('leanCloud:main');
const AV = require('leanengine');

/**
 * 初始化 LeanCloud 插件
 *
 * @param config
 * @returns {Function}
 */
export default function(config = {}) {
  return function() {
    const app = this;

    debug('Initializing leanCloud plugin');

    const options = Object.assign({}, app.get('leanCloud'), config);

    debug(`appId: ${options.appId}`)
    debug(`appKey: ${options.appKey}`)
    debug(`appMasterKey: ${options.appMasterKey}`)

    AV.init({
      appId: options.appId,
      appKey: options.appKey,
      masterKey: options.appMasterKey
    });

    // 如果不希望使用 masterKey 权限，可以将下面一行删除
    // AV.Cloud.useMasterKey();

    app.leanCloud = AV;
  }
}

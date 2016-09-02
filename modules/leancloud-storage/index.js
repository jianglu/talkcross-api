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
const debug = require('debug')('leancloud-storage:main');

import Proto from 'uberproto';
import filter from 'feathers-query-filters';
import errors from 'feathers-errors';
import { inspect } from 'util';
//

/**
 * 用户管理服务
 */
class Service {

  constructor(options) {
    if (!options) {
      throw new Error('User service options have to be provided');
    }
    if (!options.leanCloud) {
      throw new Error('LeanCloud instance needs to be provided');
    }
    if (!options.name) {
      throw new Error('Storage name needs to be provided');
    }

    this.leanCloud = options.leanCloud;
    this.name = options.name;
    this.paginate = options.paginate || {};

    // this.Model = options.Model;
    // this.id = options.id || '_id';
  }

  extend(obj) {
    return Proto.extend(obj, this);
  }

  /**
   * @param params
   */
  find(params) {
    const paginate = (params && typeof params.paginate !== 'undefined') ?
      params.paginate : this.paginate;
    const result = this._find(params, !!paginate.default, query => filter(query, paginate));
    if (!paginate.default) {
      return result.then(page => page.data);
    }
    return result;
  }

  get(id, params) {
    return this._get(id, params);
  }

  create(data) {
    debug(`create: ${inspect(data)}`)
    var object = new this.leanCloud.Object(this.name);
    return object.save(data)
  }

  patch(id, data, params) {
    debug(`patch: data:${inspect(data)}, params:${inspect(params)}`)
    var object = this.leanCloud.Object.createWithoutData(this.name, id)
    return object.save(data)
    // let { query, options } = multiOptions(id, this.id, params);
    //
    // // Run the query
    // return nfcall(this.Model, 'update', query, {
    //   $set: omit(data, this.id, '_id')
    // }, options).then(() => this._findOrGet(id, params));
  }

  update(id, data, params) {
    debug(`update: data:${inspect(data)}, params:${inspect(params)}`)
    if (Array.isArray(data) || id === null) {
      return Promise.reject('Not replacing multiple records. Did you mean `patch`?');
    }
    //
    // let { query, options } = multiOptions(id, this.id, params);
    //
    // return nfcall(this.Model, 'update', query, omit(data, this.id, '_id'), options)
    //   .then(() => this._findOrGet(id));
  }

  remove(id, params) {
    debug(`patch: params:${inspect(params)}`)
    var object = this.leanCloud.Object.createWithoutData(this.name, id)
    return object.destroy()
  }

  _find(params, count, getFilter = filter) {

    // Start with finding all, and limit when necessary.
    let { filters, query } = getFilter(params.query || {});

    var q = new this.leanCloud.Query(this.name);

    // $select uses a specific find syntax, so it has to come first.
    if (filters.$select) {
      q.select(filters.$select)
    }

    // Handle $sort
    if (filters.$sort) {
      let keys = Object.keys(filters.$sort);
      keys.forEach(key => {
        let value = filters.$sort[key];
        if (value > 0) {
          q.ascending(key);
        } else {
          q.descending(key);
        }
      });
    }

    // Handle $limit
    if (filters.$limit) {
      q.limit(filters.$limit);
    }

    // Handle $skip
    if (filters.$skip) {
      q.skip(filters.$skip);
    }

    // Execute the query
    if (count) {
      return Promise.all([q.find(), q.count()]).then(([data, total]) => {
        return {
          total,
          limit: filters.$limit,
          skip: filters.$skip || 0,
          data
        };
      });
    } else {
      return q.find();
    }
  }

  _get(id, params) {
    var q = new this.leanCloud.Query(this.name);
    // $select uses a specific find syntax, so it has to come first.
    if (params && params.query && params.query.$select) {
      q.select(params.query.$select)
    }
    return q.get(id)
  }

  _findOrGet(id, params) {
    if (id === null) {
      return this._find(params).then(page => page.data);
    }
    return this._get(id, params);
  }
}


export default function init(options) {
  return new Service(options);
}

init.Service = Service;

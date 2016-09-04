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
const debug = require('debug')('leancloud:storage:main');

import _ from 'lodash';
import rp from 'request-promise';
import urlencode from 'urlencode';
import Proto from "uberproto";
import filter from "feathers-query-filters";
import { inspect } from "util";

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

    this.apiBase = 'https://api.leancloud.cn/1.1/classes';
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
    debug(`find: params:${inspect(params)}`)
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

  create(data, params) {
    return rp(`${this.apiBase}/${this.name}`, {
      method: 'POST',
      json: true,
      headers: this._getHeaders(params),
      body: data
    });
  }

  patch(id, data, params) {
    return rp(`${this.apiBase}/${this.name}/${id}`, {
      method: 'PUT',
      json: true,
      headers: this._getHeaders(params),
      body: data
    });
  }

  update(id, data, params) {
    if (Array.isArray(data) || id === null) {
      return Promise.reject('Not replacing multiple records. Did you mean `patch`?');
    }
    return rp(`${this.apiBase}/${this.name}/${id}`, {
      method: 'PUT',
      json: true,
      headers: this._getHeaders(params),
      body: data
    });
  }

  remove(id, params) {
    return rp(`${this.apiBase}/${this.name}/${id}`, {
      method: 'DELETE',
      json: true,
      headers: this._getHeaders(params)
    });
  }


  // curl -X GET \
  // -H "X-LC-Id: 0x08VitFksfeN3orC1v9Eiif-gzGzoHsz" \
  // -H "X-LC-Key: TLb63GxWqtXNMWagJpD9QBKS" \
  // -H "Content-Type: application/json" \
  // -G \
  // --data-urlencode 'where={"pubUser":"LeanCloud官方客服"}' \
  //   https://api.leancloud.cn/1.1/classes/Post
  _find(params, count, getFilter = filter) {
    // Start with finding all, and limit when necessary.
    let { filters, query } = getFilter(params.query || {});
    return rp(`${this.apiBase}/${this.name}`, {
      method: 'GET',
      json: true,
      headers: this._getHeaders(params),
      qs: this._getQueryString(filters, count)
    }).then(response => {
      if (count) {
        return {
          total: response.count,
          limit: filters.$limit,
          skip: filters.$skip || 0,
          data: response.results
        };
      } else {
        return response.results;
      }
    });
  }

  _get(id, params) {
    return rp(`${this.apiBase}/${this.name}/${id}`, {
      method: 'GET',
      json: true,
      headers: this._getHeaders(params),
      qs: this._getQueryString(params && params.query, false)
    });
  }

  _findOrGet(id, params) {
    if (id === null) {
      return this._find(params).then(page => page.data);
    }
    return this._get(id, params);
  }

  _getHeaders(params) {
    var headers = {
      'X-LC-Id': this.leanCloud.applicationId,
      'X-LC-Key': this.leanCloud.applicationKey
    };

    if (params.token) {
      headers['X-LC-Session'] = params.token;
    }
    return headers;
  }

  _getQueryString(query, count) {
    var qs = {}
    if (query) {
      // $select uses a specific find syntax, so it has to come first.
      if (query.$select && Array.isArray(query.$select)) {
        qs.keys = _.join(query.$select, ',')
      }

      // Handle $sort
      if (query.$sort) {
        var sort = []
        _.forEach(query.$sort, (value, key) => {
          sort.push((value > 0) ? key : '-' + key);
        });
        qs.order = _.join(sort, ',');
      }

      // Handle $limit
      if (query.$limit) {
        qs.limit = urlencode(query.$limit);
      }

      // Handle $skip
      if (query.$skip) {
        qs.skip = urlencode(query.$skip);
      }

      if (count) {
        qs.count = 1
      }
    }
    return qs;
  }
}


export default function init(options) {
  return new Service(options);
}

init.Service = Service;

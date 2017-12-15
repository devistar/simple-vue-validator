'use strict';

var deepEqual = require('deep-equal');
var merge = require('merge');
var axios = require('axios');

// This implementation of debounce was taken from the blog of David Walsh.
// See here: https://davidwalsh.name/javascript-debounce-function
module.exports.debounce = function (func, wait, immediate) {
  var timeout;

  return function () {
    var context = this;
    var args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };

    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
};

module.exports.format = function (template) {
  var args = Array.prototype.slice.call(arguments, 1);
  return template.replace(/{(\d+)}/g, function (match, number) {
    return typeof args[number] != 'undefined' ? args[number] : match;
  });
};

module.exports.isArray = function (arg) {
  if (typeof Array.isArray === 'function') {
    return Array.isArray(arg);
  }

  return Object.prototype.toString.call(arg) === '[object Array]';
};

module.exports.isEmpty = function (value) {
  if (module.exports.isArray(value)) {
    return !value.length;
  } else if (module.exports.isObject(value) && Object.keys(value).length === 0) {
    return true;
  } else if (value === undefined || value === null) {
    return true;
  } else {
    return !String(value).trim().length;
  }
};

module.exports.isEqual = function (o1, o2) {
  return deepEqual(o1, o2);
};

module.exports.isFunction = function (arg) {
  return typeof arg === 'function';
};

module.exports.isNaN = function (arg) {
  return /^\s*$/.test(arg) || isNaN(arg);
};

module.exports.isNull = function (arg) {
  return arg === null;
};

module.exports.isString = function (arg) {
  return typeof arg === 'string' || arg instanceof String;
};

module.exports.isUndefined = function (arg) {
  return typeof arg === 'undefined';
};

module.exports.isObject = function (arg) {
  return typeof arg === 'object' || arg instanceof Object;
}

module.exports.omit = function omit(obj, key) {
  var result = {};

  for (var name in obj) {
    if (name !== key) {
      result[name] = obj[name];
    }
  }

  return result;
};

// Removes empty properties
module.exports.cleanObject = function (obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      if (module.exports.isEmpty(obj[prop] || "")) {
        delete obj[prop];
      }
    }
  }
  return obj;
}

module.exports.replaceParamsInUrl = function(url, params) {
  if (!module.exports.isEmpty(url) && module.exports.isObject(params)) {
    var re = null;
    var previousUrl = '';
    for (var prop in params) {
      if (params.hasOwnProperty(prop)) {
        previousUrl = url;
        re = new RegExp('{'+prop+'}', 'i');
        url = url.replace(re, params[prop]);
        // If there is replacement in url, we delete the param. It will not be added to query string.
        if (url !== previousUrl) {
          delete params[prop];
        }
      }
    }
  }
  return url;
}

module.exports.httpRequest = function (url, params) {
  var mergedConfig = merge({
    method: 'get',
    url: url,
    params: params
  }, this.httpConfig);
  return axios(mergedConfig)
}

module.exports.templates = require('./templates');

module.exports.mode = 'interactive'; // other values: conservative and manual

module.exports.httpConfig = {}; // axios config
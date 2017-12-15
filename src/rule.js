'use strict';

var utils = require('./utils');

function Rule(templates) {
  this._field = '';
  this._value = undefined;
  this._messages = [];
  if (templates) {
    // merge given template and utils.template
    this.templates = {};
    Object.keys(utils.templates).forEach(function (key) {
      this.templates[key] = utils.templates[key];
    }.bind(this));
    Object.keys(templates).forEach(function (key) {
      this.templates[key] = templates[key];
    }.bind(this));
  } else {
    this.templates = utils.templates;
  }
}

Rule.prototype.field = function (field) {
  this._field = field;
  return this;
};

Rule.prototype.value = function (value) {
  this._value = value;
  return this;
};

Rule.prototype.custom = function (callback, context) {
  var message = context ? callback.call(context) : callback();
  if (message) {
    if (message.then) {
      var that = this;
      message = Promise.resolve(message)
        .then(function (result) {
          return result;
        })
        .catch(function (e) {
          console.error(e.toString());
          return that.templates.error;
        });
    }
    this._messages.push(message);
  }
  return this;
};

Rule.prototype._checkValue = function () {
  if (this._value === undefined) {
    throw new Error('Validator.value not set');
  }
  return this._value;
};

Rule.prototype.required = function (message) {
  var value = this._checkValue();
  if (utils.isEmpty(value)) {
    this._messages.push(message || this.templates.required);
  }
  return this;
};

Rule.prototype.float = function (message) {
  var value = this._checkValue();
  if (!utils.isEmpty(value)) {
    var number = parseFloat(value);
    if (utils.isNaN(number)) {
      this._messages.push(message || this.templates.float);
    }
  }
  return this;
};

Rule.prototype.integer = function (message) {
  var value = this._checkValue();
  if (!utils.isEmpty(value)) {
    var number = parseInt(value);
    if (utils.isNaN(number)) {
      this._messages.push(message || this.templates.integer);
    } else if (number !== Number(value)) { // 2 !=== 2.9
      this._messages.push(message || this.templates.integer);
    }
  }
  return this;
};

Rule.prototype.lessThan = function (bound, message) {
  var value = this._checkValue();
  if (!utils.isEmpty(value)) {
    var number = parseFloat(value);
    if (utils.isNaN(number)) {
      this._messages.push(message || this.templates.number);
    } else if (number >= bound) {
      this._messages.push(message || utils.format(this.templates.lessThan, bound));
    }
  }
  return this;
};

Rule.prototype.lessThanOrEqualTo = function (bound, message) {
  var value = this._checkValue();
  if (!utils.isEmpty(value)) {
    var number = parseFloat(value);
    if (utils.isNaN(number)) {
      this._messages.push(message || this.templates.number);
    } else if (number > bound) {
      this._messages.push(message || utils.format(this.templates.lessThanOrEqualTo, bound));
    }
  }
  return this;
};

Rule.prototype.greaterThan = function (bound, message) {
  var value = this._checkValue();
  if (!utils.isEmpty(value)) {
    var number = parseFloat(value);
    if (utils.isNaN(number)) {
      this._messages.push(message || this.templates.number);
    } else if (number <= bound) {
      this._messages.push(message || utils.format(this.templates.greaterThan, bound));
    }
  }
  return this;
};

Rule.prototype.greaterThanOrEqualTo = function (bound, message) {
  var value = this._checkValue();
  if (!utils.isEmpty(value)) {
    var number = parseFloat(value);
    if (utils.isNaN(number)) {
      this._messages.push(message || this.templates.number);
    } else if (number < bound) {
      this._messages.push(message || utils.format(this.templates.greaterThanOrEqualTo, bound));
    }
  }
  return this;
};

Rule.prototype.between = function (lowBound, highBound, message) {
  var value = this._checkValue();
  if (!utils.isEmpty(value)) {
    var number = parseFloat(value);
    if (utils.isNaN(number)) {
      this._messages.push(message || this.templates.number);
    } else if (number < lowBound || number > highBound) {
      this._messages.push(message || utils.format(this.templates.between, lowBound, highBound));
    }
  }
  return this;
};

Rule.prototype.size = function (size, message) {
  var value = this._checkValue();
  if (!utils.isEmpty(value)) {
    if (utils.isArray(value) && value.length != size) {
      this._messages.push(message || utils.format(this.templates.size, size));
    }
  }
  return this;
};

Rule.prototype.length = function (length, message) {
  var value = this._checkValue();
  if (!utils.isEmpty(value)) {
    var string = String(value);
    if (string.length !== length) {
      this._messages.push(message || utils.format(this.templates.length, length));
    }
  }
  return this;
};

Rule.prototype.minLength = function (length, message) {
  var value = this._checkValue();
  if (!utils.isEmpty(value)) {
    var string = String(value);
    if (string.length < length) {
      this._messages.push(message || utils.format(this.templates.minLength, length));
    }
  }
  return this;
};

Rule.prototype.maxLength = function (length, message) {
  var value = this._checkValue();
  if (!utils.isEmpty(value)) {
    var string = String(value);
    if (string.length > length) {
      this._messages.push(message || utils.format(this.templates.maxLength, length));
    }
  }
  return this;
};

Rule.prototype.lengthBetween = function (minLength, maxLength, message) {
  var value = this._checkValue();
  if (!utils.isEmpty(value)) {
    var string = String(value);
    if (string.length < minLength || string.length > maxLength) {
      this._messages.push(message || utils.format(this.templates.lengthBetween, minLength, maxLength));
    }
  }
  return this;
};

Rule.prototype.in = function (options, message) {
  var value = this._checkValue();
  if (!utils.isEmpty(value)) {
    if (options.filter(function (option) {
      return option === value;
    }).length <= 0) {
      this._messages.push(message || utils.format(this.templates.in, this.templates.optionCombiner(options)));
    }
  }
  return this;
};

Rule.prototype.notIn = function (options, message) {
  var value = this._checkValue();
  if (!utils.isEmpty(value)) {
    if (options.filter(function (option) {
      return option !== value;
    }).length <= 0) {
      this._messages.push(message || utils.format(this.templates.notIn, this.templates.optionCombiner(options)));
    }
  }
  return this;
};

Rule.prototype.match = function (valueToCompare, message) {
  var value = this._checkValue();
  if (!utils.isEmpty(value)) {
    if (value !== valueToCompare) {
      this._messages.push(message || this.templates.match);
    }
  }
  return this;
};

Rule.prototype.regex = function (regex, message) {
  var value = this._checkValue();
  if (!utils.isEmpty(value)) {
    if (utils.isString(regex)) {
      regex = new RegExp(regex);
    }
    if (!regex.test(value)) {
      this._messages.push(message || this.templates.regex);
    }
  }
  return this;
};

Rule.prototype.digit = function (message) {
  return this.regex(/^\d*$/, message || this.templates.digit);
};

Rule.prototype.email = function (message) {
  return this.regex(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, message || this.templates.email);
};

Rule.prototype.url = function (message) {
  return this.regex(/(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/, message || this.templates.url);
};

Rule.prototype.unique = function (url, params, message) {
  // Empty params are deleted
  utils.cleanObject(params);
  // There must be an url and params
  if (!utils.isEmpty(url) && !utils.isEmpty(params)) {    
    // If there is params in url string, they will be replaced. Params in url must be between curly brackets
    // Example: api/user/email/{email}.
    url = utils.replaceParamsInUrl(url, params);
    var that = this;
    var promisedMessage = new Promise(function(resolve, reject) {
      utils.httpRequest(url, params)
      .then(function (response) {
        if ((utils.isArray(response.data) && response.data.length > 0) ||
          (response.data.exists === true) ||
          (response.data.exists === 1)) {
          resolve(message || that.templates.unique);
        }
        resolve();
      })
      .catch(function(e) {
        console.error(e.toString());
        reject(e);
      })
    });   
    that._messages.push(promisedMessage);
  }
  return this;
}


module.exports = Rule;


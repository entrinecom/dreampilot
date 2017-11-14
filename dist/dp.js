var dpApp;

dpApp = (function() {
  var self;

  self = dpApp;

  function dpApp($element) {
    this.$element = $element;
    this.setupAttributes();
  }

  dpApp.appAttr = 'app';

  dpApp.classAttr = 'class';

  dpApp.prototype.setupAttributes = function() {
    $dp.e($dp.selectorForAttribute(self.classAttr)).each(function() {
      var $el, k, obj, results, v;
      $el = $dp.e(this);
      obj = Parser.object($el.attr($dp.attribute(self.classAttr)));
      results = [];
      for (k in obj) {
        v = obj[k];
        results.push(console.log('[' + k + '] =', v));
      }
      return results;
    });
    return this;
  };

  return dpApp;

})();

var dpModel;

dpModel = (function() {
  var callbacks, data;

  data = {};

  callbacks = {
    change: {}
  };

  function dpModel() {}

  dpModel.prototype.get = function(field) {
    if (typeof data[field] !== 'undefined') {
      return data[field];
    } else {
      return null;
    }
  };

  dpModel.prototype.set = function(field, value) {
    var base, k, v;
    if (value == null) {
      value = null;
    }
    if (typeof field === 'object' && value === null) {
      for (k in field) {
        v = field[k];
        this.set(k, v);
      }
    } else {
      data[field] = value;
      if (typeof (base = callbacks.change)[field] === "function") {
        base[field]();
      }
    }
    return this;
  };

  dpModel.prototype.onChange = function(field, callback) {
    callbacks.change[field] = callback;
    return this;
  };

  return dpModel;

})();

var $dp, DreamPilot, dp;

DreamPilot = (function() {
  var apps, self;

  apps = {};

  self = DreamPilot;

  function DreamPilot() {
    $((function(_this) {
      return function() {
        return _this.checkDependencies().setupApps();
      };
    })(this));
  }

  DreamPilot.prefix = 'dp-';

  DreamPilot.e = function(selector, parent) {
    return jQuery(selector, parent);
  };

  DreamPilot.prototype.e = function(selector, parent) {
    return self.e(selector, parent);
  };

  DreamPilot.attribute = function(name) {
    return self.prefix + name;
  };

  DreamPilot.selectorForAttribute = function(name) {
    return "[" + (self.attribute(name)) + "]";
  };

  DreamPilot.prototype.checkDependencies = function() {
    if (typeof jQuery === 'undefined') {
      throw 'jQuery needed';
    }
    if (typeof jsep === 'undefined') {
      throw 'jsep needed';
    }
    return this;
  };

  DreamPilot.prototype.setupApps = function() {
    this.e(self.selectorForAttribute(dpApp.appAttr)).each(function() {
      var $app, name;
      $app = self.e(this);
      name = $app.attr(self.attribute(dpApp.appAttr));
      if (!name) {
        throw 'Application with empty name found';
      }
      return apps[name] = new dpApp($app);
    });
    return this;
  };

  return DreamPilot;

})();

$dp = DreamPilot;

dp = new DreamPilot();

var Functions;

Functions = (function() {
  function Functions() {}

  Functions.trim = function(s) {
    return s.replace(/^\s+|\s+$/g, '');
  };

  Functions.ltrim = function(s) {
    return s.replace(/^\s+/, '');
  };

  Functions.rtrim = function(s) {
    return s.replace(/\s+$/, '');
  };

  Functions.underscore = function(s) {
    return (s + '').replace(/(\-[a-z])/g, function($1) {
      return $1.toUpperCase().replace('-', '');
    });
  };

  Functions.camelize = function(s) {
    return (s + '').replace(/([A-Z])/g, function($1) {
      return '_' + $1.toLowerCase();
    });
  };

  Functions.urlencode = function(s) {
    return encodeURIComponent(s);
  };

  Functions.urldecode = function(s) {
    return decodeURIComponent((s + '').replace(/\+/g, '%20'));
  };

  return Functions;

})();

if ($dp) {
  $dp.fn = Functions;
}

var Parser,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Parser = (function() {
  var self;

  self = Parser;

  function Parser() {}

  Parser.quotes = '\'"`';

  Parser.object = function(dataStr) {
    var addPair, ch, i, j, len, o, pair, quoteOpened, skip, underCursor;
    dataStr = $dp.fn.trim(dataStr);
    if (dataStr[0] !== '{' || dataStr.slice(-1) !== '}') {
      return null;
    }
    dataStr = dataStr.slice(1, dataStr.length - 1);
    o = {};
    pair = {
      key: '',
      value: ''
    };
    addPair = function() {
      o[$dp.fn.trim(pair.key)] = $dp.fn.trim(pair.value);
      return pair.key = pair.value = '';
    };
    quoteOpened = null;
    underCursor = 'key';
    for (i = j = 0, len = dataStr.length; j < len; i = ++j) {
      ch = dataStr[i];
      skip = false;
      if (indexOf.call(self.quotes, ch) >= 0) {
        if (!quoteOpened) {
          quoteOpened = ch;
          skip = true;
        } else if (quoteOpened && ch === quoteOpened) {
          quoteOpened = null;
          skip = true;
        }
      }
      if (!quoteOpened) {
        switch (false) {
          case ch !== ':':
            underCursor = 'border';
            break;
          case !(underCursor === 'border' && !/\s/.test(ch)):
            underCursor = 'value';
            break;
          case ch !== ',':
            underCursor = 'key';
            addPair();
            skip = true;
        }
      }
      if (underCursor !== 'border' && !skip) {
        pair[underCursor] += ch;
      }
    }
    if (pair.key || pair.value) {
      addPair();
    }
    return o;
  };

  return Parser;

})();

if ($dp) {
  $dp.parser = Parser;
}

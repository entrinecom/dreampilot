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
    this.e(self.selectorForAttribute($dp.Application.appAttr)).each(function() {
      var $app, name;
      $app = self.e(this);
      name = $app.attr(self.attribute($dp.Application.appAttr));
      if (!name) {
        throw 'Application with empty name found';
      }
      return apps[name] = $dp.Application.create(name, $app);
    });
    return this;
  };

  return DreamPilot;

})();

$dp = DreamPilot;

dp = new DreamPilot();

DreamPilot.Application = (function() {
  var self;

  self = Application;

  Application.appAttr = 'app';

  Application.create = function(className, $wrapper) {
    var classSource;
    classSource = $dp.fn.stringToFunction(className);
    return new classSource($wrapper);
  };

  function Application($wrapper1) {
    this.$wrapper = $wrapper1;
    this.setupScope().setupAttributes().setupEvents();
  }

  Application.prototype.getWrapper = function() {
    return this.$wrapper;
  };

  Application.prototype.getScope = function() {
    return this.Scope;
  };

  Application.prototype.setupScope = function() {
    this.Scope = new $dp.Scope();
    return this;
  };

  Application.prototype.setupEvents = function() {
    this.Events = new $dp.Events(this);
    return this;
  };

  Application.prototype.setupAttributes = function() {
    this.Attributes = new $dp.Attributes(this);
    return this;
  };

  return Application;

})();

DreamPilot.Attributes = (function() {
  var self;

  self = Attributes;

  Attributes.classAttr = 'class';

  Attributes.showAttr = 'show';

  Attributes.ifAttr = 'if';

  Attributes.initAttr = 'init';

  function Attributes(App) {
    this.App = App;
    this.setupAttributes();
  }

  Attributes.prototype.setupAttributes = function() {
    return this.setupInitAttribute().setupClassAttribute().setupShowAttribute().setupIfAttribute();
  };

  Attributes.prototype.getApp = function() {
    return this.App;
  };

  Attributes.prototype.getScope = function() {
    return this.getApp().getScope();
  };

  Attributes.prototype.getWrapper = function() {
    return this.getApp().getWrapper();
  };

  Attributes.prototype.setupClassAttribute = function() {
    var that;
    that = this;
    $dp.e($dp.selectorForAttribute(self.classAttr), this.getWrapper()).each(function() {
      var $el, cssClass, expression, field, i, len, obj, ref;
      $el = $dp.e(this);
      obj = $dp.Parser.object($el.attr($dp.attribute(self.classAttr)));
      for (cssClass in obj) {
        expression = obj[cssClass];
        $el.toggleClass(cssClass, $dp.Parser.isExpressionTrue(expression, that.getApp()));
      }
      ref = $dp.Parser.getLastUsedVariables();
      for (i = 0, len = ref.length; i < len; i++) {
        field = ref[i];
        that.getScope().onChange(field, function(field, value) {
          return $el.toggleClass(cssClass, $dp.Parser.isExpressionTrue(expression, that.getApp()));
        });
      }
      return true;
    });
    return this;
  };

  Attributes.prototype.setupShowAttribute = function() {
    var that;
    that = this;
    $dp.e($dp.selectorForAttribute(self.showAttr), this.getWrapper()).each(function() {
      var $el, expression, field, i, len, ref;
      $el = $dp.e(this);
      expression = $el.attr($dp.attribute(self.showAttr));
      $el.toggle($dp.Parser.isExpressionTrue(expression, that.getApp()));
      ref = $dp.Parser.getLastUsedVariables();
      for (i = 0, len = ref.length; i < len; i++) {
        field = ref[i];
        that.getScope().onChange(field, function(field, value) {
          return $el.toggle($dp.Parser.isExpressionTrue(expression, that.getApp()));
        });
      }
      return true;
    });
    return this;
  };

  Attributes.prototype.getReplacerFor = function($element, expression) {
    var $replacer;
    if ($element.data('replacer')) {
      return $element.data('replacer');
    }
    $replacer = $("<!-- dp-if: " + expression + " --><script type='text/placeholder'></script><!-- end of dp-if: " + expression + " -->");
    $element.data('replacer', $replacer);
    return $replacer;
  };

  Attributes.prototype.toggleElementExistence = function($element, state, expression) {
    var $anchor;
    if (state) {
      if (!document.body.contains($element.get(0))) {
        $anchor = this.getReplacerFor($element, expression).filter('script');
        $element.insertAfter($anchor);
      }
    } else {
      $element.after(this.getReplacerFor($element, expression)).detach();
    }
    return this;
  };

  Attributes.prototype.setupIfAttribute = function() {
    var that;
    that = this;
    $dp.e($dp.selectorForAttribute(self.ifAttr), this.getWrapper()).each(function() {
      var $el, expression, field, i, len, ref;
      $el = $dp.e(this);
      expression = $el.attr($dp.attribute(self.ifAttr));
      that.toggleElementExistence($el, $dp.Parser.isExpressionTrue(expression, that.getApp()), expression);
      ref = $dp.Parser.getLastUsedVariables();
      for (i = 0, len = ref.length; i < len; i++) {
        field = ref[i];
        that.getScope().onChange(field, function(field, value) {
          return that.toggleElementExistence($el, $dp.Parser.isExpressionTrue(expression, that.getApp()), expression);
        });
      }
      return true;
    });
    return this;
  };

  Attributes.prototype.setupInitAttribute = function() {
    var that;
    that = this;
    $dp.e($dp.selectorForAttribute(self.initAttr), this.getWrapper()).each(function() {
      var $el, expression;
      $el = $dp.e(this);
      expression = $el.attr($dp.attribute(self.initAttr));
      $dp.Parser.executeExpressions(expression, that);
      return true;
    });
    return this;
  };

  return Attributes;

})();

DreamPilot.Events = (function() {
  var self;

  self = Events;

  Events.prototype.events = ['click', 'focus', 'blur', 'change', 'keypress', 'keyup', 'keydown', 'mouseover', 'mouseout'];

  function Events(App) {
    this.App = App;
    this.setupEvents();
  }

  Events.prototype.setupEvents = function() {
    var event, i, len, ref;
    ref = this.events;
    for (i = 0, len = ref.length; i < len; i++) {
      event = ref[i];
      this.setupSingleEvent(event);
    }
    return this;
  };

  Events.prototype.setupSingleEvent = function(name) {
    var that;
    that = this;
    $dp.e($dp.selectorForAttribute(name), this.App.$element).each(function() {
      var $el, expression;
      $el = $dp.e(this);
      expression = $el.attr($dp.attribute(name));
      $el.on(name, function(event) {
        return $dp.Parser.executeExpressions(expression, that.App);
      });
      return true;
    });
    return this;
  };

  return Events;

})();

DreamPilot.Model = (function() {
  var callbacks, data;

  data = {};

  callbacks = {
    change: {}
  };

  function Model() {}

  Model.prototype.get = function(field) {
    if (this.exists(field)) {
      return data[field];
    } else {
      return null;
    }
  };

  Model.prototype.has = function(field) {
    if (this.exists(field)) {
      return !!data[field];
    } else {
      return false;
    }
  };

  Model.prototype.set = function(field, value) {
    var cb, i, k, len, ref, v;
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
      if (callbacks.change[field] != null) {
        ref = callbacks.change[field];
        for (i = 0, len = ref.length; i < len; i++) {
          cb = ref[i];
          cb(field, value);
        }
      }
    }
    return this;
  };

  Model.prototype.exists = function(field) {
    return typeof data[field] !== 'undefined';
  };

  Model.prototype.onChange = function(field, callback) {
    if (callbacks.change[field] == null) {
      callbacks.change[field] = [];
    }
    callbacks.change[field].push(callback);
    return this;
  };

  return Model;

})();

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

DreamPilot.Scope = (function(superClass) {
  extend(Scope, superClass);

  function Scope() {
    Scope.__super__.constructor.call(this);
  }

  return Scope;

})(DreamPilot.Model);

DreamPilot.Functions = (function() {
  function Functions() {}

  Functions.int = function(s) {
    return ~~s;
  };

  Functions.str = function(s) {
    return s + '';
  };

  Functions.float = function(s) {
    return parseFloat(s) || .0;
  };

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

  Functions.stringToFunction = function(s) {
    var ar, fn, k, v;
    ar = s.split('.');
    fn = window || this;
    for (k in ar) {
      v = ar[k];
      fn = fn[v];
    }
    if (typeof fn !== 'function') {
      throw "Function/Class " + s + " not found";
    }
    return fn;
  };

  Functions.uniqueId = function(len) {
    var i, j, possible, ref, text;
    text = '';
    possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (i = j = 0, ref = len || 32; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  Functions.randomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  Functions.escapeHtml = function(text) {
    var map;
    map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) {
      return map[m];
    });
  };

  Functions.round = function(number, precision) {
    var factor, roundedTempNumber, tempNumber;
    if (precision == null) {
      precision = 0;
    }
    if (!precision) {
      return Math.round(number);
    }
    factor = Math.pow(10, precision);
    tempNumber = number * factor;
    roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
  };

  Functions.isArray = function(ar) {
    return Object.prototype.toString.call(ar) === '[object Array]';
  };

  Functions.keys = function(array) {
    return $.map(array, function(val, key) {
      return key;
    });
  };

  Functions.values = function(array) {
    return $.map(array, function(val, key) {
      return val;
    });
  };

  Functions.lead0 = function(x, len) {
    var results;
    if (len == null) {
      len = 2;
    }
    x = this.str(x);
    results = [];
    while (x.length < len) {
      results.push(x = '0' + x);
    }
    return results;
  };

  return Functions;

})();

if ($dp) {
  $dp.fn = DreamPilot.Functions;
}

var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

DreamPilot.Parser = (function() {
  var self;

  self = Parser;

  function Parser() {}

  Parser.quotes = '\'"`';

  Parser.operators = {
    binary: {
      '+': function(a, b) {
        return a + b;
      },
      '-': function(a, b) {
        return a - b;
      },
      '*': function(a, b) {
        return a * b;
      },
      '/': function(a, b) {
        return a / b;
      },
      '%': function(a, b) {
        return a % b;
      },
      '>': function(a, b) {
        return a > b;
      },
      '>=': function(a, b) {
        return a >= b;
      },
      '<': function(a, b) {
        return a < b;
      },
      '<=': function(a, b) {
        return a <= b;
      },
      '==': function(a, b) {
        return a == b;
      },
      '===': function(a, b) {
        return a === b;
      },
      '!=': function(a, b) {
        return a != b;
      }
    },
    unary: {
      '-': function(a) {
        return -a;
      },
      '+': function(a) {
        return -a;
      },
      '!': function(a) {
        return !a;
      }
    },
    logical: {
      '&&': function(a, b) {
        return a && b;
      },
      '||': function(a, b) {
        return a || b;
      }
    }
  };

  Parser.lastUsedVariables = [];

  Parser.object = function(dataStr, options) {
    var addPair, ch, i, j, len, o, pair, quoteOpened, skip, underCursor;
    if (options == null) {
      options = {};
    }
    options = jQuery.extend({
      delimiter: ',',
      assign: ':',
      curlyBracketsNeeded: true
    }, options);
    dataStr = $dp.fn.trim(dataStr);
    if (options.curlyBracketsNeeded) {
      if (dataStr[0] !== '{' || dataStr.slice(-1) !== '}') {
        return null;
      }
      dataStr = dataStr.slice(1, dataStr.length - 1);
    }
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
          case ch !== options.assign:
            underCursor = 'border';
            break;
          case !(underCursor === 'border' && !/\s/.test(ch)):
            underCursor = 'value';
            break;
          case ch !== options.delimiter:
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

  Parser.evalNode = function(node, App) {
    switch (node.type) {
      case 'BinaryExpression':
        if (typeof self.operators.binary[node.operator] === 'undefined') {
          throw 'No callback for binary operator ' + node.operator;
        }
        return self.operators.binary[node.operator](self.evalNode(node.left, App), self.evalNode(node.right, App));
      case 'UnaryExpression':
        if (typeof self.operators.unary[node.operator] === 'undefined') {
          throw 'No callback for unary operator ' + node.operator;
        }
        return self.operators.unary[node.operator](self.evalNode(node.argument, App));
      case 'LogicalExpression':
        if (typeof self.operators.logical[node.operator] === 'undefined') {
          throw 'No callback for logical operator ' + node.operator;
        }
        return self.operators.logical[node.operator](self.evalNode(node.left, App), self.evalNode(node.right, App));
      case 'Identifier':
        self.lastUsedVariables.push(node.name);
        return App.getScope().get(node.name);
      case 'Literal':
        return node.value;
      default:
        throw 'Unknown node type ' + node.type;
    }
  };

  Parser.isExpressionTrue = function(expr, App) {
    var e;
    try {
      self.lastUsedVariables = [];
      return !!self.evalNode(jsep(expr), App);
    } catch (error) {
      e = error;
      console.log('Expression parsing (isExpressionTrue) error ', e);
      return false;
    }
  };

  Parser.executeExpressions = function(allExpr, App) {
    var e, expr, key, rows;
    rows = this.object(allExpr, {
      delimiter: ';',
      assign: '=',
      curlyBracketsNeeded: false
    });
    self.lastUsedVariables = [];
    for (key in rows) {
      expr = rows[key];
      try {
        if (key.indexOf('(') > -1 && expr === '') {
          self.evalNode(jsep(key), App);
          console.log('function: ', key, jsep(key));
        } else {
          App.getScope().set(key, self.evalNode(jsep(expr), App));
          console.log('simple assign: ', key, App.getScope().get(key));
        }
      } catch (error) {
        e = error;
        console.log('Expression parsing (executeExpressions) error', e);
        false;
      }
    }
    return true;
  };

  Parser.getLastUsedVariables = function() {
    return self.lastUsedVariables;
  };

  return Parser;

})();

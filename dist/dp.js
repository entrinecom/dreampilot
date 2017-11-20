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

  Application.classAttr = 'class';

  Application.showAttr = 'show';

  Application.ifAttr = 'if';

  Application.create = function(className, $element) {
    var classSource;
    classSource = $dp.fn.stringToFunction(className);
    return new classSource($element);
  };

  function Application($element1) {
    this.$element = $element1;
    this.setupScope().setupAttributes();
  }

  Application.prototype.getScope = function() {
    return this.Scope;
  };

  Application.prototype.setupScope = function() {
    this.Scope = new $dp.Scope();
    return this;
  };

  Application.prototype.setupAttributes = function() {
    return this.setupClassAttribute().setupShowAttribute().setupIfAttribute();
  };

  Application.prototype.setupClassAttribute = function() {
    var that;
    that = this;
    $dp.e($dp.selectorForAttribute(self.classAttr)).each(function() {
      var $el, cssClass, expression, field, i, len, obj, ref;
      $el = $dp.e(this);
      obj = $dp.Parser.object($el.attr($dp.attribute(self.classAttr)));
      for (cssClass in obj) {
        expression = obj[cssClass];
        $el.toggleClass(cssClass, $dp.Parser.isExpressionTrue(expression, that));
      }
      ref = $dp.Parser.getLastUsedVariables();
      for (i = 0, len = ref.length; i < len; i++) {
        field = ref[i];
        that.getScope().onChange(field, function(field, value) {
          console.log('changed: ', field, '=', value, 'class', cssClass);
          return $el.toggleClass(cssClass, $dp.Parser.isExpressionTrue(expression, that));
        });
      }
      return true;
    });
    return this;
  };

  Application.prototype.setupShowAttribute = function() {
    var that;
    that = this;
    $dp.e($dp.selectorForAttribute(self.showAttr)).each(function() {
      var $el, expression, field, i, len, ref;
      $el = $dp.e(this);
      expression = $el.attr($dp.attribute(self.showAttr));
      $el.toggle($dp.Parser.isExpressionTrue(expression, that));
      ref = $dp.Parser.getLastUsedVariables();
      for (i = 0, len = ref.length; i < len; i++) {
        field = ref[i];
        that.getScope().onChange(field, function(field, value) {
          return $el.toggle($dp.Parser.isExpressionTrue(expression, that));
        });
      }
      return true;
    });
    return this;
  };

  Application.prototype.getReplacerFor = function($element, expression) {

    /*
    return $element.data 'replacer' if $element.data 'replacer'
    
    $replacer = $ '<div/>'
    .hide()
    .data 'element', $element
    .attr 'dp-uid', $dp.fn.uniqueId()
    
    $element.data 'replacer', $replacer
     */
    var $replacer;
    $replacer = $("<!-- dp-if: " + expression + " -->\n<!-- end of dp-if: " + expression + " -->");
    return $replacer;
  };

  Application.prototype.toggleElementExistence = function($element, state, expression) {
    if (!state) {
      $element.replaceWith(this.getReplacerFor($element, expression));
    }
    return this;
  };

  Application.prototype.setupIfAttribute = function() {
    var that;
    that = this;
    $dp.e($dp.selectorForAttribute(self.ifAttr)).each(function() {
      var $el, expression, field, i, len, ref;
      $el = $dp.e(this);
      expression = $el.attr($dp.attribute(self.ifAttr));
      that.toggleElementExistence($el, $dp.Parser.isExpressionTrue(expression, that), expression);
      ref = $dp.Parser.getLastUsedVariables();
      for (i = 0, len = ref.length; i < len; i++) {
        field = ref[i];
        that.getScope().onChange(field, function(field, value) {
          return that.toggleElementExistence($el, $dp.Parser.isExpressionTrue(expression, that), expression);
        });
      }
      return true;
    });
    return this;
  };

  return Application;

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

  Parser.isExpressionTrue = function(expr, App) {
    var e, evalNode;
    evalNode = function(node) {
      switch (node.type) {
        case 'BinaryExpression':
          if (typeof self.operators.binary[node.operator] === 'undefined') {
            throw 'No callback for binary operator ' + node.operator;
          }
          return self.operators.binary[node.operator](evalNode(node.left), evalNode(node.right));
        case 'UnaryExpression':
          if (typeof self.operators.unary[node.operator] === 'undefined') {
            throw 'No callback for unary operator ' + node.operator;
          }
          return self.operators.unary[node.operator](evalNode(node.argument));
        case 'LogicalExpression':
          if (typeof self.operators.logical[node.operator] === 'undefined') {
            throw 'No callback for logical operator ' + node.operator;
          }
          return self.operators.logical[node.operator](evalNode(node.left), evalNode(node.right));
        case 'Identifier':
          self.lastUsedVariables.push(node.name);
          return App.getScope().get(node.name);
        case 'Literal':
          return node.value;
        default:
          throw 'Unknown node type ' + node.type;
      }
    };
    try {
      self.lastUsedVariables = [];
      return !!evalNode(jsep(expr));
    } catch (error) {
      e = error;
      console.log('Expression parsing error ', e);
      return false;
    }
  };

  Parser.getLastUsedVariables = function() {
    return self.lastUsedVariables;
  };

  return Parser;

})();

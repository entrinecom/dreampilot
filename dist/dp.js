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
      return apps[name] = new $dp.Application($app);
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

  function Application($element) {
    this.$element = $element;
    this.setupScope().setupAttributes();
  }

  Application.appAttr = 'app';

  Application.classAttr = 'class';

  Application.prototype.getScope = function() {
    return this.Scope;
  };

  Application.prototype.setupScope = function() {
    this.Scope = new $dp.Scope();
    return this;
  };

  Application.prototype.setupAttributes = function() {
    var that;
    that = this;
    $dp.e($dp.selectorForAttribute(self.classAttr)).each(function() {
      var $el, k, obj, v;
      $el = $dp.e(this);
      obj = $dp.Parser.object($el.attr($dp.attribute(self.classAttr)));
      for (k in obj) {
        v = obj[k];
        $el.toggleClass(k, $dp.Parser.isExpressionTrue(v, that));
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
    if (typeof data[field] !== 'undefined') {
      return data[field];
    } else {
      return null;
    }
  };

  Model.prototype.set = function(field, value) {
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

  Model.prototype.onChange = function(field, callback) {
    callbacks.change[field] = callback;
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
    var e, evalNode, operators;
    operators = {
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
    evalNode = function(node) {
      switch (node.type) {
        case 'BinaryExpression':
          if (typeof operators.binary[node.operator] === 'undefined') {
            throw 'No callback for binary operator ' + node.operator;
          }
          return operators.binary[node.operator](evalNode(node.left), evalNode(node.right));
        case 'UnaryExpression':
          if (typeof operators.unary[node.operator] === 'undefined') {
            throw 'No callback for unary operator ' + node.operator;
          }
          return operators.unary[node.operator](evalNode(node.argument));
        case 'LogicalExpression':
          if (typeof operators.logical[node.operator] === 'undefined') {
            throw 'No callback for logical operator ' + node.operator;
          }
          return operators.logical[node.operator](evalNode(node.left), evalNode(node.right));
        case 'Identifier':
          return App.getScope().get(node.name);
        case 'Literal':
          return node.value;
        default:
          throw 'Unknown node type ' + node.type;
      }
    };
    try {
      return !!evalNode(jsep(expr));
    } catch (error) {
      e = error;
      console.log('Expression parsing error ', e);
      return false;
    }
  };

  return Parser;

})();

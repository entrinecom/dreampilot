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

  DreamPilot.prototype.getApp = function(name) {
    if (!name) {
      throw 'Application can not have an empty name';
    }
    if (!apps[name]) {
      throw "Application '" + name + "' not found";
    }
    return apps[name];
  };

  return DreamPilot;

})();

$dp = DreamPilot;

dp = new DreamPilot();

var slice = [].slice;

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
    this.setupScope().setupAttributes().setupEvents().init();
  }

  Application.prototype.init = function() {
    return this;
  };

  Application.prototype.e = function(selector) {
    return $dp.e(selector, this.$wrapper);
  };

  Application.prototype.getWrapper = function() {
    return this.$wrapper;
  };

  Application.prototype.getScope = function() {
    return this.Scope;
  };

  Application.prototype.getEvents = function() {
    return this.Events;
  };

  Application.prototype.getAttributes = function() {
    return this.Attributes;
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

  Application.prototype.linkToScope = function() {
    var i, key, keys, len, obj, type;
    keys = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    for (i = 0, len = keys.length; i < len; i++) {
      key = keys[i];
      if ($dp.fn.isArray(key)) {
        this.linkToScope.apply(this, key);
        continue;
      }
      type = typeof this[key];
      if (type === 'function') {
        this.getScope().set(key, (function(_this) {
          return function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return _this[key].apply(_this, args);
          };
        })(this));
      } else if (type !== 'undefined') {
        obj = this[key];
        if (obj instanceof DreamPilot.Model) {
          obj.setParent(this.getScope(), key);
        }
        this.getScope().set(key, obj);
      } else {
        $dp.log.print("Key " + key + " not found in application");
      }
    }
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

  Attributes.valueWriteToAttr = 'value-write-to';

  Attributes.valueReadFromAttr = 'value-read-from';

  Attributes.valueBindAttr = 'value-bind';

  Attributes.prototype.ScopePromises = null;

  function Attributes(App) {
    this.App = App;
    this.setupScopePromises().setupAttributes();
  }

  Attributes.prototype.setupScopePromises = function() {
    this.ScopePromises = new DreamPilot.ScopePromises();
    return this;
  };

  Attributes.prototype.setupAttributes = function() {
    return this.setupInitAttribute().setupClassAttribute().setupShowAttribute().setupIfAttribute().setupValueBindAttribute().setupValueWriteToAttribute().setupValueReadFromAttribute();
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

  Attributes.prototype.eachByAttr = function(attr, callback) {
    $dp.e($dp.selectorForAttribute(attr), this.getWrapper()).each(callback);
    return this;
  };

  Attributes.prototype.setupClassAttribute = function() {
    var that;
    that = this;
    this.eachByAttr(self.classAttr, function() {
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
    this.eachByAttr(self.showAttr, function() {
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
    this.eachByAttr(self.ifAttr, function() {
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
    this.eachByAttr(self.initAttr, function() {
      var $el, expression;
      $el = $dp.e(this);
      expression = $el.attr($dp.attribute(self.initAttr));
      $dp.Parser.executeExpressions(expression, that);
      return true;
    });
    return this;
  };

  Attributes.prototype.setupValueWriteToAttribute = function() {
    this.eachByAttr(self.valueWriteToAttr, function() {
      var $el, field;
      $el = $dp.e(this);
      field = $el.attr($dp.attribute(self.valueWriteToAttr));
      return self.bindValueWriteToAttribute(field, $el, Scope);
    });
    return this;
  };

  Attributes.prototype.setupValueReadFromAttribute = function() {
    var that;
    that = this;
    this.eachByAttr(self.valueReadFromAttr, function() {
      var $el, field;
      $el = $dp.e(this);
      field = $el.attr($dp.attribute(self.valueReadFromAttr));
      if (self.bindValueCheckScope(field, $el, Scope, that)) {
        return true;
      }
      return self.bindValueReadFromAttribute(field, $el, Scope);
    });
    return this;
  };

  Attributes.prototype.setupValueBindAttribute = function() {
    var that;
    that = this;
    this.eachByAttr(self.valueBindAttr, function() {
      var $el, Scope, field;
      $el = $dp.e(this);
      field = $el.attr($dp.attribute(self.valueBindAttr));
      Scope = $dp.Parser.getScopeOf(field, that.getScope());
      if (self.bindValueCheckScope(field, $el, Scope, that)) {
        return true;
      }
      self.bindValueWriteToAttribute(field, $el, Scope);
      return self.bindValueReadFromAttribute(field, $el, Scope);
    });
    return this;
  };

  Attributes.bindValueCheckScope = function(field, $el, Scope, that) {
    if (Scope === null) {
      that.ScopePromises.add({
        field: field,
        scope: that.getScope(),
        cb: function(scope) {
          return (function(scope) {
            field = $dp.Parser.getPropertyOfExpression(field);
            self.bindValueWriteToAttribute(field, $el, scope);
            return self.bindValueReadFromAttribute(field, $el, scope);
          })(scope);
        }
      });
      return true;
    }
    return false;
  };

  Attributes.bindValueWriteToAttribute = function(field, $el, Scope) {
    var eventName, ref;
    if ($el.is('input') && ((ref = $el.attr('type')) === 'radio' || ref === 'checkbox')) {
      eventName = 'change';
    } else {
      eventName = 'input';
    }
    $el.on(eventName, (function(_this) {
      return function() {
        var value;
        value = $dp.fn.getValueOfElement($el);
        return Scope.set(field, value);
      };
    })(this));
    if ($el.val()) {
      $el.trigger(eventName);
    }
    return true;
  };

  Attributes.bindValueReadFromAttribute = function(field, $el, Scope) {
    Scope.onChange(field, function(field, value) {
      return $dp.fn.setValueOfElement($el, value);
    });
    if (Scope.get(field)) {
      Scope.trigger('change', field);
    }
    return true;
  };

  return Attributes;

})();

DreamPilot.Events = (function() {
  var self;

  self = Events;

  Events.prototype.events = ['click', 'focus', 'blur', 'change', 'keypress', 'keyup', 'keydown', 'mouseover', 'mouseout', 'paste', 'input'];

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
  Model.prototype.data = {};

  Model.prototype.relatedData = {};

  Model.prototype.parent = null;

  Model.prototype.parentField = null;

  Model.prototype.callbacks = {
    change: {}
  };

  function Model(_data) {
    if (_data == null) {
      _data = {};
    }
    this.initFrom(_data);
  }

  Model.prototype.initFrom = function(_data) {
    var field, value;
    if (_data == null) {
      _data = {};
    }
    if (typeof _data === 'string') {
      _data = JSON.parse(_data);
    }
    if (typeof _data === 'object') {
      if (_data instanceof DreamPilot.Model) {
        this.data = _data.get();
      } else {
        this.data = _data;
      }
    } else {
      throw 'Data should be an object';
    }
    for (field in _data) {
      value = _data[field];
      this.trigger('change', field);
    }
    return this;
  };

  Model.prototype.setParent = function(parent, parentField) {
    this.parent = parent;
    this.parentField = parentField;
    if (this.parent && !this.parent instanceof DreamPilot.Model) {
      throw 'Parent can be only DreamPilot.Model';
    }
  };

  Model.prototype.get = function(field) {
    var child, children, model;
    if (field == null) {
      field = null;
    }
    if (field && typeof field === 'string') {
      children = field.split('.');
      if (children.length > 1) {
        child = children[0];
        field = children.slice(1).join('.');
        if (this.exists(child)) {
          model = this.data[child];
          if (model instanceof DreamPilot.Model) {
            return model.get(field);
          } else {
            if (typeof model[field] !== 'undefined') {
              return model[field];
            } else {
              return null;
            }
          }
        } else {
          return null;
        }
      }
    }
    if (field === null) {
      return this.data;
    }
    if (this.exists(field)) {
      return this.data[field];
    } else {
      return null;
    }
  };

  Model.prototype.has = function(field) {
    if (this.exists(field)) {
      return !!this.data[field];
    } else {
      return false;
    }
  };

  Model.prototype.set = function(field, value) {
    var k, v;
    if (value == null) {
      value = null;
    }
    if (typeof field === 'object' && value === null) {
      for (k in field) {
        v = field[k];
        this.set(k, v);
      }
    } else {
      this.data[field] = value;
      this.trigger('change', field);
    }
    return this;
  };

  Model.prototype.exists = function(field) {
    return typeof this.data[field] !== 'undefined';
  };

  Model.prototype.getRelated = function(field) {
    if (field == null) {
      field = null;
    }
    if (field === null) {
      return this.relatedData;
    }
    if (this.existsRelated(field)) {
      return this.relatedData[field];
    } else {
      return null;
    }
  };

  Model.prototype.hasRelated = function(field) {
    if (this.existsRelated(field)) {
      return !!this.relatedData[field];
    } else {
      return false;
    }
  };

  Model.prototype.setRelated = function(field, value) {
    var k, v;
    if (value == null) {
      value = null;
    }
    if (typeof field === 'object' && value === null) {
      for (k in field) {
        v = field[k];
        this.setRelated(k, v);
      }
    } else {
      this.relatedData[field] = value;
    }
    return this;
  };

  Model.prototype.existsRelated = function(field) {
    return typeof this.relatedData[field] !== 'undefined';
  };

  Model.prototype.getSaveMethod = function() {
    return $dp.transport.POST;
  };

  Model.prototype.getSaveUrl = function() {
    throw 'Redefine Model.getSaveUrl() method first';
  };

  Model.prototype.getSaveData = function() {
    return this.get();
  };

  Model.prototype.save = function() {
    $dp.transport.request(this.getSaveMethod(), this.getSaveUrl(), this.getSaveData(), (function(_this) {
      return function(result) {
        return _this.onSaved(result);
      };
    })(this));
    return this;
  };

  Model.prototype.onSaved = function(result) {
    $dp.log.print('onSaved', result);
    return this;
  };

  Model.prototype.getFetchMethod = function() {
    return $dp.transport.GET;
  };

  Model.prototype.getFetchUrl = function() {
    throw 'Redefine Model.getFetchUrl() method first';
  };

  Model.prototype.getFetchData = function() {
    return null;
  };

  Model.prototype.fetch = function() {
    $dp.transport.request(this.getFetchMethod(), this.getFetchUrl(), this.getFetchData(), (function(_this) {
      return function(result) {
        return _this.onFetched(result);
      };
    })(this));
    return this;
  };

  Model.prototype.onFetched = function(result) {
    $dp.log.print('onFetched', result);
    return this;
  };

  Model.prototype.on = function(actions, fields, callback, callbackId) {
    var action, field, i, j, len, len1, ref, ref1;
    if (callbackId == null) {
      callbackId = null;
    }
    if (!$dp.fn.isArray(actions)) {
      actions = [actions];
    }
    if (!$dp.fn.isArray(fields)) {
      fields = [fields];
    }
    for (i = 0, len = actions.length; i < len; i++) {
      action = actions[i];
      for (j = 0, len1 = fields.length; j < len1; j++) {
        field = fields[j];
        while (!callbackId || (((ref = this.callbacks[action]) != null ? (ref1 = ref[field]) != null ? ref1[callbackId] : void 0 : void 0) != null)) {
          callbackId = $dp.fn.uniqueId();
        }
        if (this.callbacks[action] == null) {
          this.callbacks[action] = {};
        }
        if (this.callbacks[action][field] == null) {
          this.callbacks[action][field] = {};
        }
        this.callbacks[action][field][callbackId] = callback;
      }
    }
    return this;
  };

  Model.prototype.off = function(actions, fields, callbackId) {
    var action, field, i, j, len, len1;
    if (callbackId == null) {
      callbackId = null;
    }
    if (!$dp.fn.isArray(actions)) {
      actions = [actions];
    }
    if (!$dp.fn.isArray(fields)) {
      fields = [fields];
    }
    for (i = 0, len = actions.length; i < len; i++) {
      action = actions[i];
      for (j = 0, len1 = fields.length; j < len1; j++) {
        field = fields[j];
        if (callbackId) {
          delete this.callbacks[action][field][callbackId];
        } else {
          this.callbacks[action][field] = {};
        }
      }
    }
    return this;
  };

  Model.prototype.trigger = function(action, field, callbackId) {
    var cb, cbId, ref, ref1, ref2, ref3, value;
    value = this.get(field);
    if (((ref = this.callbacks[action]) != null ? ref[field] : void 0) != null) {
      ref1 = this.callbacks[action][field];
      for (cbId in ref1) {
        cb = ref1[cbId];
        if (!callbackId || cbId === callbackId) {
          cb(field, value);
        }
      }
      if (this.parent) {
        this.parent.trigger(action, this.parentField);
      }
    }
    if (((ref2 = this.callbacks[action]) != null ? ref2['*'] : void 0) != null) {
      ref3 = this.callbacks[action]['*'];
      for (cbId in ref3) {
        cb = ref3[cbId];
        if (!callbackId || cbId === callbackId) {
          cb(field, value);
        }
      }
    }
    return this;
  };

  Model.prototype.onChange = function(fields, callback, callbackId) {
    if (callbackId == null) {
      callbackId = null;
    }
    return this.on('change', fields, callback, callbackId);
  };

  return Model;

})();

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

DreamPilot.Scope = (function(superClass) {
  extend(Scope, superClass);

  function Scope() {
    return Scope.__super__.constructor.apply(this, arguments);
  }

  return Scope;

})(DreamPilot.Model);

DreamPilot.Router = (function() {
  var ELSE_PATH, WORK_MODE_HASH, WORK_MODE_URL;

  WORK_MODE_HASH = 1;

  WORK_MODE_URL = 2;

  ELSE_PATH = null;

  Router.prototype.steps = {};

  function Router(App, options) {
    this.App = App;
    if (options == null) {
      options = {};
    }
    this.options = $.extend({
      workMode: WORK_MODE_HASH,
      attrName: 'data-step'
    }, options);
  }

  Router.prototype.when = function(path, opts) {
    if (opts == null) {
      opts = {};
    }
    this.steps[path] = opts;
    return this;
  };

  Router.prototype["else"] = function(opts) {
    if (opts == null) {
      opts = {};
    }
    this.steps[ELSE_PATH] = opts;
    return this;
  };

  return Router;

})();

var Router;

Router = (function() {
  function Router() {}

  return Router;

})();

var slice = [].slice;

DreamPilot.Functions = (function() {
  var self;

  function Functions() {}

  self = Functions;

  Functions.extend = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return jQuery.extend.apply(jQuery, args);
  };

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
    return self.str(s).replace(/(\-[a-z])/g, function($1) {
      return $1.toUpperCase().replace('-', '');
    });
  };

  Functions.camelize = function(s) {
    return self.str(s).replace(/([A-Z])/g, function($1) {
      return '_' + $1.toLowerCase();
    });
  };

  Functions.urlencode = function(s) {
    return encodeURIComponent(s);
  };

  Functions.urldecode = function(s) {
    return decodeURIComponent(self.str(s).replace(/\+/g, '%20'));
  };

  Functions.parseQueryString = function(url, start, delimiter, equal) {
    var ar, ar2, ar3, i;
    if (url == null) {
      url = window.location.href;
    }
    if (start == null) {
      start = '?';
    }
    if (delimiter == null) {
      delimiter = '&';
    }
    if (equal == null) {
      equal = '=';
    }
    ar = {};
    if (url.indexOf(start) > -1) {
      url = url.substr(url.indexOf(start) + 1);
      if (start === '?' && url.indexOf('#') > -1) {
        url = url.substr(0, url.indexOf('#'));
      }
      ar2 = url.split(delimiter);
      i = 0;
      while (i < ar2.length) {
        ar3 = ar2[i].split(equal);
        ar[ar3[0]] = ar3[1];
        i++;
      }
    }
    return ar;
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
    var i, l, possible, ref, text;
    text = '';
    possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (i = l = 0, ref = len || 32; 0 <= ref ? l <= ref : l >= ref; i = 0 <= ref ? ++l : --l) {
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

  Functions.stripTags = function(input, allowed) {
    var commentsAndPhpTags, tags;
    if (allowed == null) {
      allowed = '';
    }
    allowed = (self.str(allowed).toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
    tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, function($0, $1) {
      if (allowed.indexOf('<' + $1.toLowerCase() + '>') > -1) {
        return $0;
      } else {
        return '';
      }
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
    return jQuery.map(array, function(val, key) {
      return key;
    });
  };

  Functions.values = function(array) {
    return jQuery.map(array, function(val, key) {
      return val;
    });
  };

  Functions.arraySum = function(ar) {
    var key, sum;
    sum = 0;
    if (ar && typeof ar === 'object' && ar.change_key_case) {
      return ar.sum.apply(ar, Array.prototype.slice.call(arguments, 0));
    }
    if (typeof ar !== 'object') {
      return null;
    }
    for (key in ar) {
      if (!ar.hasOwnProperty(key)) {
        continue;
      }
      if (!isNaN(parseFloat(ar[key]))) {
        sum += parseFloat(ar[key]);
      }
    }
    return sum;
  };

  Functions.arrayCount = function(ar) {
    var cc, i;
    cc = 0;
    if (ar && typeof ar === 'object' && ar.change_key_case) {
      return ar.length;
    }
    if (typeof ar !== 'object') {
      return null;
    }
    for (i in ar) {
      if (ar.hasOwnProperty(i)) {
        cc++;
      }
    }
    return cc;
  };

  Functions.arrayFlip = function(ar) {
    var key, tmp;
    tmp = {};
    for (key in ar) {
      if (ar.hasOwnProperty(key)) {
        tmp[ar[key]] = key;
      }
    }
    return tmp;
  };

  Functions.arrayShuffle = function(ar) {
    var i, j, temp;
    i = ar.length - 1;
    while (i > 0) {
      j = Math.floor(Math.random() * (i + 1));
      temp = ar[i];
      ar[i] = ar[j];
      ar[j] = temp;
      i--;
    }
    return ar;
  };

  Functions.arrayReverse = function(ar) {
    var i, len, res;
    res = [];
    len = ar.length;
    i = len - 1;
    while (i !== -1) {
      res.push(ar[i]);
      i--;
    }
    return res;
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

  Functions.digitCase = function(x, s1, s2, s3, endingOnly) {
    var ref;
    if (s3 == null) {
      s3 = null;
    }
    if (endingOnly == null) {
      endingOnly = false;
    }
    if (s3 === null) {
      s3 = s2;
    }
    x = self.int(x);
    if (x % 10 === 1 && x !== 11) {
      if (endingOnly) {
        return s1;
      } else {
        return x + ' ' + s1;
      }
    } else if ((2 <= (ref = x % 10) && ref <= 4) && (x !== 12 && x !== 13 && x !== 14)) {
      if (endingOnly) {
        return s2;
      } else {
        return x + ' ' + s2;
      }
    } else {
      if (endingOnly) {
        return s3;
      } else {
        return x + ' ' + s3;
      }
    }
  };

  Functions.divide3dig = function(num, divider) {
    var i, j, len, s2, ss, start, x;
    if (divider == null) {
      divider = ',';
    }
    num = self.str(num);
    x = num.indexOf('.');
    s2 = x !== -1 ? num.substr(x) : '';
    num = x !== -1 ? num.substr(0, x) : num;
    ss = '';
    start = num.length - 3;
    j = Math.ceil(num.length / 3);
    i = 0;
    while (i < j) {
      len = 3;
      if (start < 0) {
        len += start;
        start = 0;
      }
      ss = num.substr(start, len) + divider + ss;
      start -= 3;
      i++;
    }
    ss = ss.substr(0, ss.length - divider.length);
    return ss + s2;
  };

  Functions.basename = function(str, suffix) {
    var base, x;
    if (suffix == null) {
      suffix = null;
    }
    x = str.lastIndexOf('/');
    if (x === -1) {
      x = str.lastIndexOf('\\');
    }
    base = self.str(str).substr(x + 1);
    if (typeof suffix === 'string' && base.substr(base.length - suffix.length) === suffix) {
      base = base.substr(0, base.length - suffix.length);
    }
    return base;
  };

  Functions.dirname = function(str) {
    var x;
    x = str.lastIndexOf('/');
    if (x === -1) {
      x = str.lastIndexOf('\\');
    }
    if (x !== -1) {
      return self.str(str).substr(0, x);
    } else {
      return str;
    }
  };

  Functions.fileExt = function(fn) {
    return fn.split('.').pop();
  };

  Functions.getValueOfElement = function($element) {
    if ($element.is('input')) {
      switch ($element.attr('type')) {
        case 'checkbox':
          return $element.prop('checked');
        case 'radio':
          if ($element.prop('checked')) {
            return $element.val();
          }
          break;
        default:
          return $element.val();
      }
    } else {
      return $element.val() || $element.html();
    }
  };

  Functions.setValueOfElement = function($element, value) {
    if ($element.length) {
      if ($element.is('input,select,button')) {
        if ($element.is('input')) {
          switch ($element.attr('type')) {
            case 'checkbox':
              $element.prop('checked', !!value);
              break;
            case 'radio':
              $element.prop('checked', self.str($element.val()) === self.str(value));
              break;
            default:
              $element.val(value);
          }
        } else {
          $element.val(value);
        }
      } else {
        $element.html(value);
      }
    }
    return $element;
  };

  Functions.getType = function(variable) {
    if (variable === null) {
      return 'null';
    } else if (self.isArray(variable)) {
      return 'array';
    } else {
      return typeof variable;
    }
  };

  Functions.print_r = function(variable, level) {
    var item, j, padding, ref, res, value;
    if (level == null) {
      level = 0;
    }
    res = '';
    padding = '';
    j = 0;
    while (j < level) {
      j++;
      padding += '    ';
    }
    if ((ref = self.getType(variable)) === 'object' || ref === 'array') {
      for (item in variable) {
        value = variable[item];
        if (typeof value === 'object') {
          res += (padding + "'" + item + "':\n") + self.print_r(value, level + 1);
        } else {
          res += padding + "'" + item + "' => \"" + value + "\"\n";
        }
      }
      if (res) {
        return padding + "{\n" + res + "\n" + padding + "}";
      } else {
        return '{}';
      }
    } else {
      return padding + '(' + self.getType(variable) + ') ' + variable;
    }
  };

  return Functions;

})();

if ($dp) {
  $dp.fn = DreamPilot.Functions;
}

var slice = [].slice;

DreamPilot.Logger = (function() {
  function Logger() {}

  Logger.print = function() {
    return console.log.apply(arguments);
  };

  Logger.error = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    throw args.join(' ');
  };

  return Logger;

})();

if ($dp) {
  $dp.log = DreamPilot.Logger;
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
    var addPair, ch, i, isQuote, isSpace, j, len, o, pair, quoteOpened, skip, underCursor;
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
      o[$dp.fn.trim(pair.key)] = pair.value;
      return pair.key = pair.value = '';
    };
    quoteOpened = null;
    underCursor = 'key';
    for (i = j = 0, len = dataStr.length; j < len; i = ++j) {
      ch = dataStr[i];
      skip = false;
      isSpace = /\s/.test(ch);
      isQuote = indexOf.call(self.quotes, ch) >= 0;
      if (isQuote) {
        if (!quoteOpened) {
          quoteOpened = ch;
        } else if (quoteOpened && ch === quoteOpened) {
          quoteOpened = null;
        }
      }
      if (underCursor === 'border' && !isSpace) {
        underCursor = 'value';
      } else if (!quoteOpened) {
        if (ch === options.assign) {
          underCursor = 'border';
        } else if (ch === options.delimiter) {
          underCursor = 'key';
          addPair();
          skip = true;
        }
      }
      if ((underCursor === 'key' || underCursor === 'value') && !skip) {
        pair[underCursor] += ch;
      }
    }
    if (pair.key || pair.value) {
      addPair();
    }
    return o;
  };

  Parser.evalNode = function(node, Scope) {
    var arg, args, fn, obj;
    if (!(Scope instanceof DreamPilot.Model)) {
      throw 'Scope should be a DreamPilot.Model instance, but ' + typeof Scope + (" given (" + Scope + ")");
    }
    switch (node.type) {
      case 'CallExpression':
        if ((node.callee.type != null) && node.callee.type === 'Identifier' && node.callee.name) {
          args = (function() {
            var j, len, ref, results;
            ref = node["arguments"];
            results = [];
            for (j = 0, len = ref.length; j < len; j++) {
              arg = ref[j];
              results.push(self.evalNode(arg));
            }
            return results;
          })();
          fn = Scope.get(node.callee.name);
          if (fn && typeof fn === 'function') {
            return fn.apply(null, args);
          } else {
            return $dp.log.error("No function '" + node.callee.name + "' found in scope");
          }
        } else {
          throw 'Unable to call node, type: ' + node.callee.type + ', name: ' + node.callee.name;
        }
        break;
      case 'BinaryExpression':
        if (typeof self.operators.binary[node.operator] === 'undefined') {
          throw 'No callback for binary operator ' + node.operator;
        }
        return self.operators.binary[node.operator](self.evalNode(node.left, Scope), self.evalNode(node.right, Scope));
      case 'UnaryExpression':
        if (typeof self.operators.unary[node.operator] === 'undefined') {
          throw 'No callback for unary operator ' + node.operator;
        }
        return self.operators.unary[node.operator](self.evalNode(node.argument, Scope));
      case 'LogicalExpression':
        if (typeof self.operators.logical[node.operator] === 'undefined') {
          throw 'No callback for logical operator ' + node.operator;
        }
        return self.operators.logical[node.operator](self.evalNode(node.left, Scope), self.evalNode(node.right, Scope));
      case 'MemberExpression':
        obj = self.evalNode(node.object, Scope);
        return self.evalNode(node.property, obj);
      case 'Identifier':
        self.lastUsedVariables.push(node.name);
        if (Scope instanceof DreamPilot.Model) {
          return Scope.get(node.name);
        } else {
          if (Scope[node.name] != null) {
            return Scope[node.name];
          } else {
            return null;
          }
        }
        break;
      case 'Literal':
        return node.value;
      default:
        throw 'Unknown node type ' + node.type;
    }
  };

  Parser.getScopeOf = function(expr, Scope) {
    var j, key, len, namespace, node;
    node = jsep(expr);
    if (node.type !== 'MemberExpression') {
      Scope;
    }
    namespace = [];
    while (true) {
      namespace.push(node.name || node.property.name || node.property.value);
      if (!(node = node.object)) {
        break;
      }
    }
    namespace = $dp.fn.arrayReverse(namespace.slice(1));
    for (j = 0, len = namespace.length; j < len; j++) {
      key = namespace[j];
      Scope = Scope.get(key);
      if (!Scope) {
        break;
      }
    }
    return Scope;
  };

  Parser.getPropertyOfExpression = function(expr) {
    var node;
    node = jsep(expr);
    if (node.type === 'MemberExpression') {
      return node.property.name;
    } else {
      return expr;
    }
  };

  Parser.isExpressionTrue = function(expr, App) {
    var e;
    try {
      self.lastUsedVariables = [];
      return !!self.evalNode(jsep(expr), App.getScope());
    } catch (error) {
      e = error;
      $dp.log.error('Expression parsing (isExpressionTrue) error ', e, expr);
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
          self.evalNode(jsep(key), App.getScope());
        } else {
          App.getScope().set(key, self.evalNode(jsep(expr), App.getScope()));
        }
      } catch (error) {
        e = error;
        $dp.log.error('Expression parsing (executeExpressions) error', e, ':', key, expr);
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

DreamPilot.ScopePromises = (function() {
  ScopePromises.prototype.list = {};

  ScopePromises.prototype.interval = null;

  ScopePromises.prototype.delay = 20;

  function ScopePromises() {}

  ScopePromises.prototype.add = function(options) {
    this.list[options.field] = options;
    this.initCheck();
    return this;
  };

  ScopePromises.prototype.remove = function(field) {
    delete this.list[field];
    if (!this.list.length) {
      this.resetCheck();
    }
    return this;
  };

  ScopePromises.prototype.resetCheck = function() {
    clearInterval(this.interval);
    return this;
  };

  ScopePromises.prototype.initCheck = function() {
    if (this.interval) {
      return this;
    }
    this.interval = setInterval((function(_this) {
      return function() {
        var Scope, field, rec, ref, results;
        ref = _this.list;
        results = [];
        for (field in ref) {
          rec = ref[field];
          Scope = $dp.Parser.getScopeOf(field, rec['scope']);
          if (Scope) {
            rec.cb(Scope);
            results.push(_this.remove(field));
          } else {
            results.push(void 0);
          }
        }
        return results;
      };
    })(this), this.delay);
    return this;
  };

  return ScopePromises;

})();

var slice = [].slice;

DreamPilot.Transport = (function() {
  var self;

  function Transport() {}

  self = Transport;

  Transport.GET = 1;

  Transport.POST = 2;

  Transport.PUT = 3;

  Transport.DELETE = 4;

  Transport.HEAD = 5;

  Transport.OPTIONS = 6;

  Transport.CONNECT = 7;

  Transport.FORM_DATA = 1;

  Transport.PAYLOAD = 2;

  Transport.request = function(method, url, data, callback) {
    var options;
    if (typeof method !== 'object') {
      options = {
        method: method,
        type: this.FORM_DATA
      };
    } else {
      options = $dp.fn.extend({
        method: this.GET,
        type: this.FORM_DATA
      }, options);
    }
    switch (options.method) {
      case this.GET:
        url += '?' + jQuery.serialize(data);
        return self.get(url, callback);
      case this.POST:
        switch (options.type) {
          case this.FORM_DATA:
            return self.post(url, data, callback);
          case this.PAYLOAD:
            return self.postPayload(url, data, callback);
          default:
            throw 'Unknown request type';
        }
        break;
      default:
        throw 'This method not implemented yet';
    }
  };

  Transport.get = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return jQuery.get.apply(jQuery, args);
  };

  Transport.post = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return jQuery.post.apply(jQuery, args);
  };

  Transport.postPayload = function(url, data, callback) {
    return jQuery.ajax({
      url: url,
      type: 'POST',
      dataType: 'json',
      data: data,
      contentType: 'application/json',
      complete: callback
    });
  };

  return Transport;

})();

if ($dp) {
  $dp.transport = DreamPilot.Transport;
}

var Transport;

Transport = (function() {
  function Transport() {}

  return Transport;

})();

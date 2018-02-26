var $dp, DreamPilot, dp;

DreamPilot = (function() {
  var apps, self;

  apps = {};

  self = DreamPilot;

  function DreamPilot() {
    jQuery((function(_this) {
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
      var $appWrapper, name;
      $appWrapper = self.e(this);
      name = $appWrapper.attr(self.attribute($dp.Application.appAttr));
      if (!name) {
        throw 'Application can not have an empty name';
      }
      if (apps[name] != null) {
        $dp.log.error("Application '" + name + "' has been already created");
      }
      return apps[name] = $dp.Application.create(name, $appWrapper);
    });
    return this;
  };

  DreamPilot.prototype.getApp = function(name) {
    if (!name) {
      throw 'Application name not specified';
    }
    if (!apps[name]) {
      throw "Application '" + name + "' not found";
    }
    return apps[name];
  };

  return DreamPilot;

})();

if (!((typeof $dp !== "undefined" && $dp !== null) && (typeof dp !== "undefined" && dp !== null))) {
  $dp = DreamPilot;
  dp = new DreamPilot();
} else {
  throw 'DreamPilot has been already initialized. May the script be double included?';
}

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

  Application.prototype.activeElement = null;

  function Application($wrapper1) {
    this.$wrapper = $wrapper1;
    this.setupScope().setupAttributes().setupEvents().init();
  }

  Application.prototype.init = function() {
    return this;
  };

  Application.prototype.e = function(selector) {
    return $dp.e(selector, this.getWrapper());
  };

  Application.prototype.getWrapper = function() {
    return this.$wrapper;
  };

  Application.prototype.getWrapperData = function(key) {
    return this.getWrapper().data(key);
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

  Application.prototype.setActiveElement = function(element) {
    this.activeElement = element;
    return this;
  };

  Application.prototype.resetActiveElement = function() {
    return this.setActiveElement(null);
  };

  Application.prototype.getActiveElement = function() {
    return this.activeElement;
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

  Application.prototype.embraceDomElement = function(el) {
    var $el;
    if (!el) {
      throw 'Unable to embrace empty element';
    }
    $el = $dp.e(el);
    this.getEvents().setupEvents($el);
    this.getAttributes().setupAttributes($el);
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
        (function(_this) {
          return (function(key) {
            return _this.getScope().set(key, function() {
              var args;
              args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
              return _this[key].apply(_this, args);
            });
          });
        })(this)(key);
      } else if (type !== 'undefined') {
        obj = this[key];
        this.getScope().set(key, obj);
      } else {
        $dp.log.print("Key " + key + " not found in application");
      }
    }
    return this;
  };

  Application.prototype.showError = function(message) {
    alert(message);
    return this;
  };

  Application.prototype.showCollectionLoadError = function(message) {
    return this.showError(message);
  };

  Application.prototype.showModelLoadError = function(message) {
    return this.showError(message);
  };

  Application.prototype.showModelSaveError = function(message) {
    return this.showError(message);
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

  Attributes.hrefAttr = 'href';

  Attributes.srcAttr = 'src';

  Attributes.valueWriteToAttr = 'value-write-to';

  Attributes.valueReadFromAttr = 'value-read-from';

  Attributes.valueBindAttr = 'value-bind';

  Attributes.simpleAttributes = [self.hrefAttr, self.srcAttr];

  Attributes.prototype.ScopePromises = null;

  function Attributes(App1) {
    this.App = App1;
    this.setupScopePromises().setupAttributes();
  }

  Attributes.prototype.setupScopePromises = function() {
    this.ScopePromises = new DreamPilot.ScopePromises();
    return this;
  };

  Attributes.prototype.setupAttributes = function($element) {
    if ($element == null) {
      $element = null;
    }
    return this.setupInitAttribute($element).setupClassAttribute($element).setupShowAttribute($element).setupIfAttribute($element).setupValueBindAttribute($element).setupValueWriteToAttribute($element).setupValueReadFromAttribute($element).setupSimpleAttributes($element);
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

  Attributes.prototype.eachByAttr = function(attr, $element, callback) {
    var $elements;
    if ($element == null) {
      $element = null;
    }
    if (callback == null) {
      callback = null;
    }
    $elements = $dp.e($dp.selectorForAttribute(attr), $element || this.getWrapper());
    if ($element) {
      $elements = $elements.add($element.filter($dp.selectorForAttribute(attr)));
    }
    $elements.each(callback);
    return this;
  };

  Attributes.prototype.setupClassAttribute = function($element) {
    var that;
    if ($element == null) {
      $element = null;
    }
    that = this;
    this.eachByAttr(self.classAttr, $element, function() {
      var $el, cssClass, el, expression, field, k, len, obj, ref;
      el = this;
      $el = $dp.e(el);
      obj = $dp.Parser.object($el.attr($dp.attribute(self.classAttr)));
      for (cssClass in obj) {
        expression = obj[cssClass];
        $el.toggleClass(cssClass, $dp.Parser.isExpressionTrue(expression, that.getApp(), el, (function(_this) {
          return function() {
            return that.classAddPromise(cssClass, expression, el);
          };
        })(this)));
      }
      ref = $dp.Parser.getLastUsedVariables();
      for (k = 0, len = ref.length; k < len; k++) {
        field = ref[k];
        that.getScope().onChange(field, function(field, value) {
          return $el.toggleClass(cssClass, $dp.Parser.isExpressionTrue(expression, that.getApp(), el));
        });
      }
      return true;
    });
    return this;
  };

  Attributes.prototype.classAddPromise = function(cssClass, expression, el) {
    this.ScopePromises.add({
      expression: expression,
      app: this.getApp(),
      scope: this.getScope(),
      element: el,
      cb: (function(_this) {
        return function(App, Scopes, vars) {
          var i, j, k, ref, results;
          results = [];
          for (i = k = ref = vars.length - 1; ref <= 0 ? k <= 0 : k >= 0; i = ref <= 0 ? ++k : --k) {
            results.push((function() {
              var l, ref1, results1;
              results1 = [];
              for (j = l = ref1 = Scopes.length - 1; ref1 <= 0 ? l <= 0 : l >= 0; j = ref1 <= 0 ? ++l : --l) {
                if (true) {
                  results1.push(Scopes[j].onChange(vars[i], function(field, value) {
                    var $el;
                    $el = $dp.e(el);
                    return $el.toggleClass(cssClass, $dp.Parser.isExpressionTrue(expression, App, el));
                  }));
                } else {
                  results1.push(void 0);
                }
              }
              return results1;
            })());
          }
          return results;
        };
      })(this)
    });
    return this;
  };

  Attributes.prototype.setupShowAttribute = function($element) {
    var that;
    if ($element == null) {
      $element = null;
    }
    that = this;
    this.eachByAttr(self.showAttr, $element, function() {
      var $el, el, expression, field, k, len, ref;
      el = this;
      $el = $dp.e(el);
      expression = $el.attr($dp.attribute(self.showAttr));
      $el.toggle($dp.Parser.isExpressionTrue(expression, that.getApp(), el, (function(_this) {
        return function() {
          return that.showAddPromise(expression, el);
        };
      })(this)));
      ref = $dp.Parser.getLastUsedVariables();
      for (k = 0, len = ref.length; k < len; k++) {
        field = ref[k];
        that.getScope().onChange(field, function(field, value) {
          return $el.toggle($dp.Parser.isExpressionTrue(expression, that.getApp(), el));
        });
      }
      return true;
    });
    return this;
  };

  Attributes.prototype.showAddPromise = function(expression, el) {
    this.ScopePromises.add({
      expression: expression,
      app: this.getApp(),
      scope: this.getScope(),
      element: el,
      cb: (function(_this) {
        return function(App, Scopes, vars) {
          var i, j, k, ref, results;
          results = [];
          for (i = k = ref = vars.length - 1; ref <= 0 ? k <= 0 : k >= 0; i = ref <= 0 ? ++k : --k) {
            results.push((function() {
              var l, ref1, results1;
              results1 = [];
              for (j = l = ref1 = Scopes.length - 1; ref1 <= 0 ? l <= 0 : l >= 0; j = ref1 <= 0 ? ++l : --l) {
                if (true) {
                  results1.push(Scopes[j].onChange(vars[i], function(field, value) {
                    var $el;
                    $el = $dp.e(el);
                    return $el.toggle($dp.Parser.isExpressionTrue(expression, App, el));
                  }));
                } else {
                  results1.push(void 0);
                }
              }
              return results1;
            })());
          }
          return results;
        };
      })(this)
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

  Attributes.prototype.setupIfAttribute = function($element) {
    var that;
    if ($element == null) {
      $element = null;
    }
    that = this;
    this.eachByAttr(self.ifAttr, $element, function() {
      var $el, el, expression, field, k, len, ref;
      el = this;
      $el = $dp.e(el);
      expression = $el.attr($dp.attribute(self.ifAttr));
      that.toggleElementExistence($el, $dp.Parser.isExpressionTrue(expression, that.getApp(), el), expression, (function(_this) {
        return function() {
          return that.ifAddPromise(expression, el);
        };
      })(this));
      ref = $dp.Parser.getLastUsedVariables();
      for (k = 0, len = ref.length; k < len; k++) {
        field = ref[k];
        that.getScope().onChange(field, function(field, value) {
          return that.toggleElementExistence($el, $dp.Parser.isExpressionTrue(expression, that.getApp(), el), expression);
        });
      }
      return true;
    });
    return this;
  };

  Attributes.prototype.ifAddPromise = function(expression, el) {
    var that;
    that = this;
    this.ScopePromises.add({
      expression: expression,
      app: this.getApp(),
      scope: this.getScope(),
      element: el,
      cb: (function(_this) {
        return function(App, Scopes, vars) {
          var i, j, k, ref, results;
          results = [];
          for (i = k = ref = vars.length - 1; ref <= 0 ? k <= 0 : k >= 0; i = ref <= 0 ? ++k : --k) {
            results.push((function() {
              var l, ref1, results1;
              results1 = [];
              for (j = l = ref1 = Scopes.length - 1; ref1 <= 0 ? l <= 0 : l >= 0; j = ref1 <= 0 ? ++l : --l) {
                if (true) {
                  results1.push(Scopes[j].onChange(vars[i], function(field, value) {
                    var $el;
                    $el = $dp.e(el);
                    return that.toggleElementExistence($el, $dp.Parser.isExpressionTrue(expression, App, el), expression);
                  }));
                } else {
                  results1.push(void 0);
                }
              }
              return results1;
            })());
          }
          return results;
        };
      })(this)
    });
    return this;
  };

  Attributes.prototype.setupInitAttribute = function($element) {
    var that;
    if ($element == null) {
      $element = null;
    }
    that = this;
    this.eachByAttr(self.initAttr, $element, function() {
      var $el, el, expression;
      el = this;
      $el = $dp.e(el);
      expression = $el.attr($dp.attribute(self.initAttr));
      $dp.Parser.executeExpressions(expression, that, el);
      return true;
    });
    return this;
  };

  Attributes.prototype.setupValueWriteToAttribute = function($element) {
    var that;
    if ($element == null) {
      $element = null;
    }
    that = this;
    this.eachByAttr(self.valueWriteToAttr, $element, function() {
      var $el, Scope, field;
      $el = $dp.e(this);
      field = $el.attr($dp.attribute(self.valueWriteToAttr));
      Scope = $dp.Parser.getScopeOf(field, that.getScope());
      if (self.bindValueCheckScope(field, $el, Scope, that, false, true)) {
        return true;
      }
      return self.bindValueWriteToAttribute(field, $el, Scope);
    });
    return this;
  };

  Attributes.prototype.setupValueReadFromAttribute = function($element) {
    var that;
    if ($element == null) {
      $element = null;
    }
    that = this;
    this.eachByAttr(self.valueReadFromAttr, $element, function() {
      var $el, Scope, field;
      $el = $dp.e(this);
      field = $el.attr($dp.attribute(self.valueReadFromAttr));
      Scope = $dp.Parser.getScopeOf(field, that.getScope());
      if (self.bindValueCheckScope(field, $el, Scope, that, true, false)) {
        return true;
      }
      return self.bindValueReadFromAttribute(field, $el, Scope);
    });
    return this;
  };

  Attributes.prototype.setupValueBindAttribute = function($element) {
    var that;
    if ($element == null) {
      $element = null;
    }
    that = this;
    this.eachByAttr(self.valueBindAttr, $element, function() {
      var $el, Scope, field;
      $el = $dp.e(this);
      field = $el.attr($dp.attribute(self.valueBindAttr));
      Scope = $dp.Parser.getScopeOf(field, that.getScope());
      if (self.bindValueCheckScope(field, $el, Scope, that, true, true)) {
        return true;
      }
      self.bindValueWriteToAttribute(field, $el, Scope);
      return self.bindValueReadFromAttribute(field, $el, Scope);
    });
    return this;
  };

  Attributes.bindValueCheckScope = function(field, $el, Scope, that, read, write) {
    if (read == null) {
      read = false;
    }
    if (write == null) {
      write = false;
    }
    if (Scope === null) {
      that.ScopePromises.add({
        field: field,
        scope: that.getScope(),
        cb: function(_scope) {
          field = $dp.Parser.getPropertyOfExpression(field);
          if (write) {
            self.bindValueWriteToAttribute(field, $el, _scope);
          }
          if (read) {
            return self.bindValueReadFromAttribute(field, $el, _scope);
          }
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
    $el.on(eventName, function() {
      var value;
      value = $dp.fn.getValueOfElement($el);
      return Scope.set(field, value);
    });
    if ($dp.fn.getValueOfElement($el)) {
      $el.trigger(eventName);
    }
    return true;
  };

  Attributes.bindValueReadFromAttribute = function(field, $el, Scope) {
    Scope.onChange(field, function(field, value) {
      if ($dp.fn.getValueOfElement($el) !== value) {
        return $dp.fn.setValueOfElement($el, value);
      }
    });
    if (Scope.get(field)) {
      Scope.trigger('change', field);
    }
    return true;
  };

  Attributes.prototype.setupSimpleAttributes = function($element) {
    var that;
    if ($element == null) {
      $element = null;
    }
    that = this;
    jQuery.each([self.srcAttr, self.hrefAttr], (function(_this) {
      return function(idx, attrName) {
        return _this.eachByAttr(attrName, $element, function() {
          var $el, Scope, field;
          $el = $dp.e(this);
          field = $el.attr($dp.attribute(attrName));
          Scope = $dp.Parser.getScopeOf(field, that.getScope());
          if (self.bindAttributeCheckScope(attrName, field, $el, Scope, that)) {
            return true;
          }
          return self.bindAttribute(attrName, field, $el, Scope);
        });
      };
    })(this));
    return this;
  };

  Attributes.bindAttributeCheckScope = function(attrName, field, $el, Scope, that) {
    if (Scope === null) {
      that.ScopePromises.add({
        field: field,
        scope: that.getScope(),
        cb: function(_scope) {
          field = $dp.Parser.getPropertyOfExpression(field);
          return self.bindAttribute(attrName, field, $el, _scope);
        }
      });
      return true;
    }
    return false;
  };

  Attributes.bindAttribute = function(attribute, field, $el, Scope) {
    Scope.onChange(field, function(field, value) {
      if ($el.attr(attribute) !== value) {
        return $el.attr(attribute, value);
      }
    });
    if (Scope.get(field)) {
      Scope.trigger('change', field);
    }
    return true;
  };

  return Attributes;

})();

DreamPilot.Collection = (function() {
  function Collection() {
    this.defineBasics();
    this.init();
  }

  Collection.prototype.defineBasics = function() {
    this.modelClassName = null;
    this.isIdUnique = true;
    this.items = [];
    this.callbacks = {
      load: {}
    };
    return this;
  };

  Collection.prototype.init = function() {
    return this;
  };

  Collection.prototype.getCount = function() {
    return $dp.fn.arrayCount(this.items);
  };

  Collection.prototype.getItems = function() {
    return this.items;
  };

  Collection.prototype.setApp = function(App) {
    this.App = App;
    return this;
  };

  Collection.prototype.getApp = function() {
    return this.App;
  };

  Collection.prototype.addItems = function(dataRows) {
    var data, i, len;
    for (i = 0, len = dataRows.length; i < len; i++) {
      data = dataRows[i];
      this.addItem(data);
    }
    return this;
  };

  Collection.prototype.addItem = function(data) {
    var model;
    data = this.extendDataBeforeAdd(DreamPilot.Model.prepareData(data));
    model = this.getNewItem(data);
    return this.putModelToList(model);
  };

  Collection.prototype.kill = function() {
    this.items = [];
    return this;
  };

  Collection.prototype.extendDataBeforeAdd = function(data) {
    return data;
  };

  Collection.prototype.tuneModelAfterCreation = function(model) {
    model.setApp(this.getApp());
    return this;
  };

  Collection.prototype.getIdForPut = function(model) {
    if (this.isIdUnique) {
      return model.getId();
    } else {
      return $dp.fn.arrayCount(this.items);
    }
  };

  Collection.prototype.putModelToList = function(model) {
    var id;
    id = this.getIdForPut(model);
    if (this.exists(id)) {
      this.getById(id).set(model.get());
    } else {
      this.items.push({
        id: id,
        model: model
      });
    }
    return this;
  };

  Collection.prototype.map = function(callbackOrField) {
    var ar, idx, ref, row;
    ar = [];
    ref = this.items;
    for (idx in ref) {
      row = ref[idx];
      if ($dp.fn.getType(callbackOrField) === 'function') {
        ar.push(callbackOrField(row.model, idx));
      } else {
        ar.push(row.model.get(callbackOrField));
      }
    }
    return ar;
  };

  Collection.prototype.createInstance = function() {
    var col;
    col = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
    return col.kill();
  };

  Collection.prototype.filter = function(callback) {
    var col, idx, ref, row;
    col = this.createInstance();
    ref = this.items;
    for (idx in ref) {
      row = ref[idx];
      if (callback(row.model)) {
        col.addItem(row.model);
      }
    }
    return col;
  };

  Collection.prototype.getIds = function() {
    var idx, keys, ref, results, row;
    keys = [];
    ref = this.items;
    results = [];
    for (idx in ref) {
      row = ref[idx];
      results.push(keys.push(row.model.getId()));
    }
    return results;
  };

  Collection.prototype.getById = function(id) {
    var idx, ref, row;
    ref = this.items;
    for (idx in ref) {
      row = ref[idx];
      if (row.model.getId() === id) {
        return row.model;
      }
    }
    return this.getNewItem();
  };

  Collection.prototype.exists = function(id) {
    var idx, ref, row;
    ref = this.items;
    for (idx in ref) {
      row = ref[idx];
      if (row.model.getId() === id) {
        return true;
      }
    }
    return false;
  };

  Collection.prototype.getNewItem = function(data) {
    var className, m;
    if (data == null) {
      data = null;
    }
    className = $dp.fn.stringToFunction(this.modelClassName);
    m = new className(data);
    this.tuneModelAfterCreation(m);
    return m;
  };

  Collection.prototype.getFirstItem = function() {
    if (!this.getCount()) {
      return this.getNewItem();
    }
    return this.items.slice(0, 1)[0].model;
  };

  Collection.prototype.getLastItem = function() {
    if (!this.getCount()) {
      return this.getNewItem();
    }
    return this.items.slice(this.getCount() - 1, 1)[0].model;
  };

  Collection.prototype.getLoadMethod = function() {
    return $dp.transport.GET;
  };

  Collection.prototype.getLoadUrl = function() {
    throw 'Redefine Collection.getLoadUrl() method first';
  };

  Collection.prototype.getLoadData = function() {
    return null;
  };

  Collection.prototype.load = function() {
    $dp.transport.request(this.getLoadMethod(), this.getLoadUrl(), this.getLoadData(), (function(_this) {
      return function(result) {
        return _this.onLoaded(result);
      };
    })(this));
    return this;
  };

  Collection.prototype.getKeyForLoadedData = function() {
    return 'items';
  };

  Collection.prototype.checkIfLoadIsOk = function(result) {
    return result.ok;
  };

  Collection.prototype.showLoadError = function(result) {
    if (this.getApp()) {
      this.getApp().showCollectionLoadError(result.message);
    } else {
      alert(result.message);
    }
    return this;
  };

  Collection.prototype.filterLoadedData = function(result) {
    if (result[this.getKeyForLoadedData()] != null) {
      return result[this.getKeyForLoadedData()];
    } else {
      return result;
    }
  };

  Collection.prototype.onLoaded = function(result) {
    if (!this.checkIfLoadIsOk(result)) {
      this.showLoadError(result);
      return this;
    }
    this.addItems(this.filterLoadedData(result)).trigger('load');
    return this;
  };

  Collection.prototype.on = function(actions, callback, callbackId) {
    var action, i, len, ref;
    if (callbackId == null) {
      callbackId = null;
    }
    if (!$dp.fn.isArray(actions)) {
      actions = [actions];
    }
    for (i = 0, len = actions.length; i < len; i++) {
      action = actions[i];
      while (!callbackId || (((ref = this.callbacks[action]) != null ? ref[callbackId] : void 0) != null)) {
        callbackId = $dp.fn.uniqueId();
      }
      if (this.callbacks[action] == null) {
        this.callbacks[action] = {};
      }
      this.callbacks[action][callbackId] = callback;
      callbackId = null;
    }
    return this;
  };

  Collection.prototype.off = function(actions, callbackId) {
    var action, i, len;
    if (callbackId == null) {
      callbackId = null;
    }
    if (!$dp.fn.isArray(actions)) {
      actions = [actions];
    }
    for (i = 0, len = actions.length; i < len; i++) {
      action = actions[i];
      if (callbackId) {
        delete this.callbacks[action][callbackId];
      } else {
        this.callbacks[action] = {};
      }
    }
    return this;
  };

  Collection.prototype.trigger = function(action, callbackId) {
    var cb, cbId, ref;
    if (this.callbacks[action] != null) {
      ref = this.callbacks[action];
      for (cbId in ref) {
        cb = ref[cbId];
        if (!callbackId || cbId === callbackId) {
          cb(this);
        }
      }
    }
    return this;
  };

  Collection.prototype.onLoad = function(callback, callbackId) {
    if (callbackId == null) {
      callbackId = null;
    }
    return this.on('load', callback, callbackId);
  };

  return Collection;

})();

DreamPilot.Events = (function() {
  var self;

  self = Events;

  Events.prototype.events = ['load', 'click', 'dblclick', 'focus', 'blur', 'change', 'keypress', 'keyup', 'keydown', 'mouseover', 'mouseout', 'mousemove', 'mousedown', 'mouseup', 'wheel', 'paste', 'input', 'submit'];

  function Events(App) {
    this.App = App;
    this.setupEvents();
  }

  Events.prototype.getApp = function() {
    return this.App;
  };

  Events.prototype.getScope = function() {
    return this.getApp().getScope();
  };

  Events.prototype.getWrapper = function() {
    return this.getApp().getWrapper();
  };

  Events.prototype.setupEvents = function($element) {
    var event, i, len, ref;
    if ($element == null) {
      $element = null;
    }
    ref = this.events;
    for (i = 0, len = ref.length; i < len; i++) {
      event = ref[i];
      this.setupSingleEvent(event, $element);
    }
    return this;
  };

  Events.prototype.setupSingleEvent = function(name, $element) {
    var $elements, that;
    if ($element == null) {
      $element = null;
    }
    that = this;
    $elements = $dp.e($dp.selectorForAttribute(name), $element || this.getWrapper());
    if ($element) {
      $elements = $elements.add($element.filter($dp.selectorForAttribute(name)));
    }
    $elements.each(function() {
      var $el, expression;
      $el = $dp.e(this);
      expression = $el.attr($dp.attribute(name));
      $el.on(name, function(event) {
        event = event || window.event;
        that.getApp().setActiveElement(this);
        $dp.Parser.executeExpressions(expression, that.getApp(), this, event);
        return that.getApp().resetActiveElement();
      });
      return true;
    });
    return this;
  };

  return Events;

})();

var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

DreamPilot.Model = (function() {
  var self;

  self = Model;

  function Model(_data) {
    if (_data == null) {
      _data = {};
    }
    this.defineBasics();
    this.initFrom(_data).init();
  }

  Model.prototype.defineBasics = function() {
    this.data = {};
    this.origData = {};
    this.relatedData = {};
    this.parent = null;
    this.parentField = null;
    this.assignModelToParent = true;
    this.assignChildModels = true;
    this.saveTimeout = null;
    this.saveDelay = 1000;
    this.callbacks = {
      change: {}
    };
    this.mainScope = false;
    this.idField = 'id';
    this.idIsInt = true;
    return this;
  };

  Model.prototype.init = function() {
    return this;
  };

  Model.prepareData = function(data) {
    if (data == null) {
      data = {};
    }
    if ($dp.fn.getType(data) === 'string') {
      data = JSON.parse(data);
    }
    if ($dp.fn.getType(data) !== 'object') {
      throw 'Data should be an object';
    }
    if (data instanceof DreamPilot.Model) {
      data = data.get();
    }
    return $dp.fn.extend(true, {}, data);
  };

  Model.prototype.initFrom = function(data) {
    var field, ref, value;
    if (data == null) {
      data = {};
    }
    this.data = self.prepareData(data);
    ref = this.data;
    for (field in ref) {
      value = ref[field];
      this.trigger('change', field);
    }
    return this;
  };

  Model.prototype.setApp = function(App) {
    this.App = App;
    return this;
  };

  Model.prototype.getApp = function() {
    return this.App;
  };

  Model.prototype.e = function(selector) {
    return this.getApp().e(selector);
  };

  Model.prototype.setParent = function(parent, parentField) {
    this.parent = parent;
    this.parentField = parentField;
    if (this.parent && !this.parent instanceof DreamPilot.Model) {
      throw 'Parent can be only DreamPilot.Model';
    }
    return this;
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
    var k, oldValue, v;
    if (value == null) {
      value = null;
    }
    if (typeof field === 'object' && value === null) {
      for (k in field) {
        v = field[k];
        this.set(k, v);
      }
    } else {
      if (value instanceof DreamPilot.Model && this.assignChildModels && value.assignModelToParent) {
        value.setParent(this, field);
      }
      oldValue = this.data[field];
      this.data[field] = value;
      if (oldValue !== value) {
        this.trigger('change', field);
      }
    }
    return this;
  };

  Model.prototype.exists = function(field) {
    if (field == null) {
      field = null;
    }
    if (field != null) {
      return typeof this.data[field] !== 'undefined';
    } else {
      return $dp.fn.bool($dp.fn.arrayCount(this.data));
    }
  };

  Model.prototype.kill = function(field) {
    var f, i, j, keys, len, len1;
    if (field == null) {
      field = null;
    }
    if (field === null) {
      keys = $dp.fn.keys(this.data);
      this.data = {};
      for (i = 0, len = keys.length; i < len; i++) {
        f = keys[i];
        this.trigger('change', f);
      }
    } else if ($dp.fn.getType(field) === 'array') {
      for (j = 0, len1 = field.length; j < len1; j++) {
        f = field[j];
        this.kill(f);
      }
    } else {
      if (this.data[field] != null) {
        delete this.data[field];
      }
      this.trigger('change', field);
    }
    return this;
  };

  Model.prototype.hasOrig = function(field) {
    if (this.existsOrig(field)) {
      return !!this.origData[field];
    } else {
      return false;
    }
  };

  Model.prototype.getOrigData = function(field) {
    if (field == null) {
      field = null;
    }
    if (field === null) {
      return this.origData;
    }
    if (this.existsOrig(field)) {
      return this.origData[field];
    } else {
      return null;
    }
  };

  Model.prototype.setOrigData = function(field, value) {
    var k, v;
    if (field == null) {
      field = null;
    }
    if (value == null) {
      value = null;
    }
    if (field === null) {
      this.origData = this.data;
    } else {
      if (typeof field === 'object' && value === null) {
        for (k in field) {
          v = field[k];
          this.setOrigData(k, v);
        }
      } else {
        this.origData[field] = value;
      }
    }
    return this;
  };

  Model.prototype.existsOrig = function(field) {
    if (field == null) {
      field = null;
    }
    if (field != null) {
      return typeof this.origData[field] !== 'undefined';
    } else {
      return $dp.fn.bool($dp.fn.arrayCount(this.origData));
    }
  };

  Model.prototype.killOrig = function(field) {
    var f, i, len;
    if (field == null) {
      field = null;
    }
    if (field === null) {
      this.origData = {};
    } else if ($dp.fn.getType(field) === 'array') {
      for (i = 0, len = field.length; i < len; i++) {
        f = field[i];
        this.killOrig(f);
      }
    } else {
      if (this.origData[field] != null) {
        delete this.origData[field];
      }
    }
    return this;
  };

  Model.prototype.getId = function() {
    var id;
    id = this.get(this.idField);
    if (this.idIsInt) {
      id = $dp.fn.int(id);
    }
    return id;
  };

  Model.prototype.hasId = function() {
    return this.has(this.idField);
  };

  Model.prototype.setId = function(id) {
    if (this.idIsInt) {
      id = $dp.fn.int(id);
    }
    return this.set(this.idField, id);
  };

  Model.prototype.resetId = function() {
    return this.setId(null);
  };

  Model.prototype.getOrigId = function() {
    var id;
    id = this.getOrigData(this.idField);
    if (this.idIsInt) {
      id = $dp.fn.int(id);
    }
    return id;
  };

  Model.prototype.hasOrigId = function() {
    return this.hasOrig(this.idField);
  };

  Model.prototype.setOrigId = function(id) {
    if (this.idIsInt) {
      id = $dp.fn.int(id);
    }
    return this.setOrigData(this.idField, id);
  };

  Model.prototype.resetOrigId = function() {
    return this.setOrigId(null);
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

  Model.prototype.changed = function(field) {
    var i, key, keys, len;
    if (field == null) {
      field = null;
    }
    if ($dp.fn.getType(field) === 'array') {
      keys = field;
    } else if (field === null) {
      keys = $dp.fn.keys(this.data) || $dp.fn.keys(this.origData);
    } else {
      keys = [field];
    }
    for (i = 0, len = keys.length; i < len; i++) {
      key = keys[i];
      if (this.get(key) !== this.getOrigData(key)) {
        return true;
      }
    }
    return false;
  };

  Model.prototype.changedFields = function(excludeFields) {
    var changedKeys, i, key, keys, len;
    if (excludeFields == null) {
      excludeFields = [];
    }
    keys = $dp.fn.keys(this.data) || $dp.fn.keys(this.origData);
    changedKeys = [];
    for (i = 0, len = keys.length; i < len; i++) {
      key = keys[i];
      if (this.get(key) !== this.getOrigData(key) && indexOf.call(excludeFields, key) < 0) {
        changedKeys.push(key);
      }
    }
    return changedKeys;
  };

  Model.prototype.isMainScope = function() {
    return this.mainScope;
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

  Model.prototype.updateId = function(newId) {
    if (!this.hasId() && newId) {
      this.setId(newId);
    }
    return this;
  };

  Model.prototype.save = function() {
    $dp.transport.request(this.getSaveMethod(), this.getSaveUrl(), this.getSaveData(), (function(_this) {
      return function(result) {
        return _this.tryToUpdateId(result).onSaved(result);
      };
    })(this));
    return this;
  };

  Model.prototype.delayedSave = function() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout((function(_this) {
      return function() {
        return _this.save();
      };
    })(this), this.saveDelay);
    return this;
  };

  Model.prototype.extractIdFromResult = function(result) {
    return $dp.fn.int(result['id']);
  };

  Model.prototype.tryToUpdateId = function(result) {
    var newId;
    newId = this.extractIdFromResult(result);
    this.updateId(newId);
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

  Model.prototype.getDeleteMethod = function() {
    return {
      method: $dp.transport.DELETE,
      dataType: $dp.transport.PAYLOAD
    };
  };

  Model.prototype.getDeleteUrl = function() {
    throw 'Redefine Model.getDeleteUrl() method first';
  };

  Model.prototype.getDeleteData = function() {
    return null;
  };

  Model.prototype["delete"] = function() {
    $dp.transport.request(this.getDeleteMethod(), this.getDeleteUrl(), this.getDeleteData(), (function(_this) {
      return function(result) {
        return _this.onDeleted(result);
      };
    })(this));
    return this;
  };

  Model.prototype.onDeleted = function(result) {
    $dp.log.print('onDeleted', result);
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
        callbackId = null;
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

  Scope.prototype.defineBasics = function() {
    Scope.__super__.defineBasics.call(this);
    this.mainScope = true;
    return this;
  };

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

  Functions.bool = function(s) {
    return !!s;
  };

  Functions.trim = function(s) {
    return self.str(s).replace(/^\s+|\s+$/g, '');
  };

  Functions.ltrim = function(s) {
    return self.str(s).replace(/^\s+/, '');
  };

  Functions.rtrim = function(s) {
    return self.str(s).replace(/\s+$/, '');
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
    if (self.getType(fn) !== 'function') {
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

  Functions.formatFloat = function(num, afterDot) {
    var a, d;
    d = Math.pow(10, afterDot);
    num = Math.round(num * d) / d;
    a = num.toString().split('.');
    a[1] = a[1] || '';
    while (a[1].length < afterDot) {
      a[1] += '0';
    }
    return a[0] + '.' + a[1];
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
    if (ar && self.getType(ar) === 'array' && ar.change_key_case) {
      return ar.sum.apply(ar, Array.prototype.slice.call(arguments, 0));
    }
    if (self.getType(ar) !== 'object') {
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
    if (ar && self.getType(ar) === 'array' && ar.change_key_case) {
      return ar.length;
    }
    if (self.getType(ar) !== 'object') {
      return null;
    }
    cc = 0;
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

  Functions.arrayUnique = function(ar) {
    return jQuery.grep(ar, function(el, index) {
      return index === jQuery.inArray(el, ar);
    });
  };

  Functions.lead0 = function(x, len) {
    var results;
    if (len == null) {
      len = 2;
    }
    x = self.str(x);
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
    if (self.getType(suffix) === 'string' && base.substr(base.length - suffix.length) === suffix) {
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
    var val;
    if ($element.is('input')) {
      switch ($element.attr('type')) {
        case 'checkbox':
          val = $element.val();
          if (val === 'on') {
            val = true;
          }
          if ($element.prop('checked')) {
            return val;
          } else {
            return null;
          }
          break;
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
        if (self.getType(value) === 'object') {
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

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args;
    args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      if (typeof args[number] !== 'undefined') {
        return args[number];
      } else {
        return match;
      }
    });
  };
}

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
        return a == b || (!a && !b);
      },
      '===': function(a, b) {
        return a === b;
      },
      '!==': function(a, b) {
        return a !== b;
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

  Parser.lastErrors = [];

  Parser.lastScopes = [];

  Parser.SCOPE_IS_UNDEFINED = 1;

  Parser.MEMBER_OBJECT_IS_UNDEFINED = 2;

  Parser.MEMBER_OBJECT_NOT_A_MODEL = 3;

  Parser.object = function(dataStr, options) {
    var addPair, ch, i, isQuote, isSpace, j, len, o, pair, quoteOpened, skip, underCursor;
    if (options == null) {
      options = {};
    }
    options = $dp.fn.extend({
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
      var ref;
      pair.key = $dp.fn.trim(pair.key);
      if ((ref = pair.key.charAt(0), indexOf.call(self.quotes, ref) >= 0) && pair.key.charAt(0) === pair.key.charAt(pair.key.length - 1)) {
        pair.key = pair.key.substr(1, pair.key.length - 2);
      }
      o[pair.key] = pair.value;
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

  Parser.evalNode = function(node, Scope, element, promiseCallback) {
    var arg, args, fn, obj, ref;
    if (element == null) {
      element = null;
    }
    if (promiseCallback == null) {
      promiseCallback = null;
    }
    if (!(Scope instanceof DreamPilot.Model || ((ref = node.type) === 'Literal' || ref === 'ThisExpression'))) {
      if (!Scope) {
        self.addToLastErrors(self.SCOPE_IS_UNDEFINED);
        if (promiseCallback) {
          promiseCallback();
        }
        return false;
      }
      throw "Scope should be a DreamPilot.Model instance, but " + ($dp.fn.getType(Scope)) + " given: '" + Scope + "'";
    }
    if (Scope instanceof DreamPilot.Model && !Scope.isMainScope()) {
      this.addToLastScopes(Scope);
    }
    switch (node.type) {
      case 'CallExpression':
        if ((node.callee.type != null) && node.callee.type === 'Identifier' && node.callee.name) {
          args = (function() {
            var j, len, ref1, results;
            ref1 = node["arguments"];
            results = [];
            for (j = 0, len = ref1.length; j < len; j++) {
              arg = ref1[j];
              results.push(self.evalNode(arg, Scope, element, promiseCallback));
            }
            return results;
          })();
          fn = Scope.get(node.callee.name);
          if (fn && typeof fn === 'function') {
            return fn.apply(null, args);
          } else {
            fn = Scope[node.callee.name];
            if (fn && typeof fn === 'function') {
              return Scope[node.callee.name].apply(Scope, args);
            } else {
              return $dp.log.error("No function '" + node.callee.name + "' found in scope");
            }
          }
        } else {
          throw 'Unable to call node, type: ' + node.callee.type + ', name: ' + node.callee.name;
        }
        break;
      case 'BinaryExpression':
        if (typeof self.operators.binary[node.operator] === 'undefined') {
          throw 'No callback for binary operator ' + node.operator;
        }
        return self.operators.binary[node.operator](self.evalNode(node.left, Scope, element, promiseCallback), self.evalNode(node.right, Scope, element, promiseCallback));
      case 'UnaryExpression':
        if (typeof self.operators.unary[node.operator] === 'undefined') {
          throw 'No callback for unary operator ' + node.operator;
        }
        return self.operators.unary[node.operator](self.evalNode(node.argument, Scope, element, promiseCallback));
      case 'LogicalExpression':
        if (typeof self.operators.logical[node.operator] === 'undefined') {
          throw 'No callback for logical operator ' + node.operator;
        }
        return self.operators.logical[node.operator](self.evalNode(node.left, Scope, element, promiseCallback), self.evalNode(node.right, Scope, element, promiseCallback));
      case 'MemberExpression':
        if (node.property.type === 'Literal') {
          node.property.type = 'Identifier';
          node.property.name = node.property.value;
        }
        obj = self.evalNode(node.object, Scope, element, promiseCallback);
        if (!(obj instanceof DreamPilot.Model)) {
          self.addToLastErrors(obj ? self.MEMBER_OBJECT_NOT_A_MODEL : self.MEMBER_OBJECT_IS_UNDEFINED);
          if (promiseCallback) {
            promiseCallback();
          }
          self.addToLastUsedVariables(node.object.name);
          return null;
        }
        return self.evalNode(node.property, obj, element, promiseCallback);
      case 'Identifier':
        switch (node.name) {
          case '$event':
            return element.dpEvent;
          default:
            self.addToLastUsedVariables(node.name);
            if (Scope instanceof DreamPilot.Model) {
              return Scope.get(node.name);
            } else {
              if (Scope[node.name] != null) {
                return Scope[node.name];
              } else {
                return null;
              }
            }
        }
        break;
      case 'Literal':
        if (Scope) {
          return node.value;
        } else {
          return null;
        }
        break;
      case 'ThisExpression':
        return element;
      default:
        throw 'Unknown node type ' + node.type;
    }
  };

  Parser.getExpressionNamespace = function(node, useLast) {
    var namespace;
    if (useLast == null) {
      useLast = false;
    }
    namespace = [];
    while (true) {
      namespace.push(node.name || node.property.name || node.property.value);
      if (!(node = node.object)) {
        break;
      }
    }
    return $dp.fn.arrayReverse(namespace.slice(useLast ? 0 : 1));
  };

  Parser.getScopeOf = function(expr, Scope) {
    var j, key, len, namespace, node, ref, useLast;
    node = jsep(expr);
    useLast = false;
    if (node.type === 'CallExpression' && (((ref = node.callee) != null ? ref.object : void 0) != null)) {
      node = node.callee.object;
      useLast = true;
    } else if (node.type !== 'MemberExpression') {
      return Scope;
    }
    namespace = self.getExpressionNamespace(node, useLast);
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
    var node, ref, ref1;
    node = jsep(expr);
    if (node.type === 'MemberExpression') {
      return node.property.name;
    } else if (node.type === 'CallExpression' && (((ref = node.callee) != null ? (ref1 = ref.property) != null ? ref1.name : void 0 : void 0) != null)) {
      return {
        "arguments": node["arguments"],
        callee: node.callee.property,
        type: node.type
      };
    } else {
      return expr;
    }
  };

  Parser.isExpressionTrue = function(expr, App, element, promiseCallback) {
    var e;
    if (element == null) {
      element = App.getActiveElement();
    }
    if (promiseCallback == null) {
      promiseCallback = null;
    }
    try {
      self.resetLastUsedVariables();
      self.resetLastErrors();
      self.resetLastScopes();
      return !!self.evalNode(jsep(expr), App.getScope(), element, promiseCallback);
    } catch (error1) {
      e = error1;
      $dp.log.error('Expression parsing (isExpressionTrue) error ', e, ' Full expression:', expr);
      return false;
    }
  };

  Parser.executeExpressions = function(allExpr, App, element, event) {
    var Scope, e, expr, key, keyMethod, keyScope, method, rows;
    if (element == null) {
      element = App.getActiveElement();
    }
    if (event == null) {
      event = null;
    }
    rows = this.object(allExpr, {
      delimiter: ';',
      assign: '=',
      curlyBracketsNeeded: false
    });
    self.resetLastUsedVariables();
    self.resetLastErrors();
    self.resetLastScopes();
    element.dpEvent = event;
    for (key in rows) {
      expr = rows[key];
      try {
        if (key.indexOf('(') > -1 && expr === '') {
          Scope = $dp.Parser.getScopeOf(key, App.getScope());
          method = $dp.Parser.getPropertyOfExpression(key);
          if ($dp.fn.getType(method) === 'string') {
            method = jsep(method);
          }
          self.evalNode(method, Scope, element);
        } else {
          keyScope = $dp.Parser.getScopeOf(key, App.getScope());
          keyMethod = $dp.Parser.getPropertyOfExpression(key);
          Scope = $dp.Parser.getScopeOf(expr, App.getScope());
          method = $dp.Parser.getPropertyOfExpression(expr);
          if ($dp.fn.getType(method) === 'string') {
            method = jsep(method);
          }
          keyScope.set(keyMethod, self.evalNode(method, Scope, element));
        }
      } catch (error1) {
        e = error1;
        throw e;
        $dp.log.error('Expression parsing (executeExpressions) error', e, ':', key, expr);
        false;
      }
    }
    return true;
  };

  Parser.resetLastUsedVariables = function() {
    return self.lastUsedVariables = [];
  };

  Parser.inLastUsedVariables = function(key) {
    return self.lastUsedVariables.indexOf(key) !== -1;
  };

  Parser.getLastUsedVariables = function() {
    return self.lastUsedVariables;
  };

  Parser.addToLastUsedVariables = function(key) {
    if (key && !self.inLastUsedVariables(key)) {
      return self.lastUsedVariables.push(key);
    }
  };

  Parser.resetLastErrors = function() {
    return self.lastErrors = [];
  };

  Parser.getLastErrors = function() {
    return self.lastErrors;
  };

  Parser.hasLastErrors = function() {
    return self.lastErrors.length > 0;
  };

  Parser.addToLastErrors = function(error) {
    return self.lastErrors.push(error);
  };

  Parser.resetLastScopes = function() {
    return self.lastScopes = [];
  };

  Parser.getLastScopes = function() {
    return self.lastScopes;
  };

  Parser.hasLastScopes = function() {
    return self.lastScopes.length > 0;
  };

  Parser.addToLastScopes = function(scope) {
    return self.lastScopes.push(scope);
  };

  return Parser;

})();

DreamPilot.ScopePromises = (function() {
  ScopePromises.prototype.list = [];

  ScopePromises.prototype.interval = null;

  ScopePromises.prototype.delay = 20;

  function ScopePromises() {}

  ScopePromises.prototype.add = function(options) {
    var idx, rec, ref;
    ref = this.list;
    for (idx in ref) {
      rec = ref[idx];
      if ((rec['expression'] != null) && (options['expression'] != null) && rec['expression'] === options['expression']) {
        return this;
      }
    }
    this.list.push(options);
    this.initCheck();
    return this;
  };

  ScopePromises.prototype.remove = function(idx) {
    this.list.splice(idx, 1);
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
        var Scope, Scopes, idx, rec, ref, results, vars;
        ref = _this.list;
        results = [];
        for (idx in ref) {
          rec = ref[idx];
          if (rec['expression'] != null) {
            $dp.Parser.isExpressionTrue(rec['expression'], rec['app'], rec['element']);
            if (!$dp.Parser.hasLastErrors()) {
              Scopes = $dp.Parser.getLastScopes();
              vars = $dp.Parser.getLastUsedVariables();
              rec.cb(rec['app'], Scopes, vars);
              results.push(_this.remove(idx));
            } else {
              results.push(void 0);
            }
          } else {
            Scope = $dp.Parser.getScopeOf(rec['field'], rec['scope']);
            if (Scope) {
              rec.cb(Scope);
              results.push(_this.remove(idx));
            } else {
              results.push(void 0);
            }
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

  Transport.GET = 'GET';

  Transport.POST = 'POST';

  Transport.PUT = 'PUT';

  Transport.DELETE = 'DELETE';

  Transport.HEAD = 'HEAD';

  Transport.OPTIONS = 'OPTIONS';

  Transport.CONNECT = 'CONNECT';

  Transport.FORM_DATA = 1;

  Transport.PAYLOAD = 2;

  Transport.request = function(method, url, data, callback) {
    var options;
    if ($dp.fn.getType(method) === 'object') {
      options = $dp.fn.extend({
        method: self.GET,
        dataType: self.FORM_DATA,
        url: url,
        data: data,
        success: callback
      }, method);
    } else {
      options = {
        method: method,
        dataType: self.FORM_DATA,
        url: url,
        data: data,
        success: callback
      };
    }
    if (options.dataType === self.PAYLOAD) {
      options = $dp.fn.extend(options, {
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(options.data)
      });
    } else if (options.dataType === self.FORM_DATA) {
      delete options.dataType;
    }
    if (options.data && options.method === self.GET) {
      options.url += '?' + jQuery.param(options.data);
      options.data = null;
    }
    if (options.type && !options.dataType) {
      options.type = options.dataType;
    }
    options.type = options.method;
    delete options.method;
    return jQuery.ajax(options);
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
    return self.request({
      method: self.POST,
      dataType: self.PAYLOAD
    }, url, data, callback);
  };

  Transport.put = function(url, data, callback) {
    return self.request({
      method: self.PUT,
      dataType: self.FORM_DATA
    }, url, data, callback);
  };

  Transport.putPayload = function(url, data, callback) {
    return self.request({
      method: self.PUT,
      dataType: self.PAYLOAD
    }, url, data, callback);
  };

  Transport["delete"] = function(url, data, callback) {
    return self.request({
      method: self.DELETE,
      dataType: self.FORM_DATA
    }, url, data, callback);
  };

  Transport.deletePayload = function(url, data, callback) {
    return self.request({
      method: self.DELETE,
      dataType: self.PAYLOAD
    }, url, data, callback);
  };

  return Transport;

})();

if ($dp) {
  $dp.transport = DreamPilot.Transport;
}

var dpApp;

dpApp = (function() {
  function dpApp($element) {
    this.$element = $element;
    this.setupAttributes();
  }

  dpApp.appAttr = 'app';

  dpApp.classAttr = 'class';

  dpApp.prototype.setupAttributes = function() {
    DreamPilot.e(DreamPilot.selectorForAttribute(dpApp.classAttr)).each(function() {
      var $el, parseTree;
      $el = DreamPilot.e(this);
      parseTree = jsep($el.attr(DreamPilot.attribute(dpApp.classAttr)));
      return console.log(parseTree);
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

var DreamPilot, dp;

DreamPilot = (function() {
  var apps;

  apps = {};

  function DreamPilot() {
    this.checkDependencies().setupApps();
  }

  DreamPilot.prefix = 'dp-';

  DreamPilot.e = function(selector, parent) {
    return jQuery(selector, parent);
  };

  DreamPilot.prototype.e = function(selector, parent) {
    return DreamPilot.e(selector, parent);
  };

  DreamPilot.attribute = function(name) {
    return DreamPilot.prefix + name;
  };

  DreamPilot.selectorForAttribute = function(name) {
    return "[" + (DreamPilot.attribute(name)) + "]";
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
    this.e(DreamPilot.selectorForAttribute(dpApp.appAttr)).each(function() {
      var $app, name;
      $app = DreamPilot.e(this);
      name = $app.attr(DreamPilot.attribute(dpApp.appAttr));
      if (!name) {
        throw 'Application with empty name found';
      }
      return apps[name] = new dpApp($app);
    });
    return this;
  };

  return DreamPilot;

})();

dp = new DreamPilot();

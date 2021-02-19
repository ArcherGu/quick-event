/*!
 * quick-event v0.0.1
 * https://github.com/ArcherGu/quick-event.git
 * @license MIT
 */
'use strict';

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Node = function Node(callback, counter) {
  _classCallCheck(this, Node);

  this.callback = callback;
  this.counter = counter;
  this.previous = null;
  this.next = null;
};

var CallbackList = /*#__PURE__*/function () {
  function CallbackList(params) {
    _classCallCheck(this, CallbackList);

    this._head = null;
    this._tail = null;
    this._currentCounter = 0;
    params = params || {};
    this._canContinueInvoking = params.hasOwnProperty('canContinueInvoking') ? params.canContinueInvoking : null;
    this._argumentsAsArray = params.hasOwnProperty('argumentsAsArray') ? !!params.argumentsAsArray : false;

    if (this._argumentsAsArray) {
      this._dispatch = this._dispatchArgumentsAsArray;
      this._applyDispatch = this._applyDispatchArgumentsAsArray;
    } else {
      this._dispatch = this._dispatchNotArgumentsAsArray;
      this._applyDispatch = this._applyDispatchNotArgumentsAsArray;
    }
  }

  _createClass(CallbackList, [{
    key: "append",
    value: function append(callback) {
      var node = new Node(callback, this._getNextCounter());

      if (this._head) {
        node.previous = this._tail;
        this._tail = node;
        this._tail.next = node;
      } else {
        this._head = node;
        this._tail = node;
      }

      return node;
    }
  }, {
    key: "prepend",
    value: function prepend(callback) {
      var node = new Node(callback, this._getNextCounter());

      if (this._head) {
        node.next = this._head;
        this._head.previous = node;
        this._head = node;
      } else {
        this._head = node;
        this._tail = node;
      }

      return node;
    }
  }, {
    key: "insert",
    value: function insert(callback, before) {
      var beforeNode = this._doFindNode(before);

      if (!beforeNode) {
        return this.append(callback);
      }

      var node = new Node(callback, this._getNextCounter());
      node.previous = beforeNode.previous;
      node.next = beforeNode;

      if (beforeNode.previous) {
        beforeNode.previous.next = node;
      }

      beforeNode.previous = node;

      if (beforeNode === this._head) {
        this._head = node;
      }

      return node;
    }
  }, {
    key: "remove",
    value: function remove(handle) {
      var node = this._doFindNode(handle);

      if (!node) {
        return false;
      }

      if (node.next) {
        node.next.previous = node.previous;
      }

      if (node.previous) {
        node.previous.next = node.next;
      }

      if (this._head === node) {
        this._head = node.next;
      }

      if (this._tail === node) {
        this._tail = node.previous;
      } // Mark it as deleted


      node.counter = 0;
      return true;
    }
  }, {
    key: "empty",
    value: function empty() {
      return !this._head;
    }
  }, {
    key: "has",
    value: function has(handle) {
      return !!this._doFindNode(handle);
    }
  }, {
    key: "hasAny",
    value: function hasAny() {
      return !!this._head;
    }
  }, {
    key: "forEach",
    value: function forEach(func) {
      var node = this._head;
      var counter = this._currentCounter;

      while (node) {
        if (node.counter !== 0 && counter >= node.counter) {
          func(node.callback);
        }

        node = node.next;
      }
    }
  }, {
    key: "forEachIf",
    value: function forEachIf(func) {
      var node = this._head;
      var counter = this._currentCounter;

      while (node) {
        if (node.counter !== 0 && counter >= node.counter) {
          if (!func(node.callback)) {
            return false;
          }
        }

        node = node.next;
      }

      return true;
    }
  }, {
    key: "dispatch",
    value: function dispatch() {
      this._dispatch.apply(this, arguments);
    }
  }, {
    key: "applyDispatch",
    value: function applyDispatch() {
      this._applyDispatch.apply(this, arguments);
    }
  }, {
    key: "_getNextCounter",
    value: function _getNextCounter() {
      var result = ++this._currentCounter;

      if (result === 0) {
        // overflow, let's reset all nodes' counters.
        var node = this._head;

        while (node) {
          node.counter = 1;
          node = node.next;
        }

        result = ++this._currentCounter;
      }

      return result;
    }
  }, {
    key: "_doFindNode",
    value: function _doFindNode(handle) {
      var node = this._head;

      while (node) {
        if (node === handle || node.callback === handle) {
          return node;
        }

        node = node.next;
      }

      return null;
    }
  }, {
    key: "_dispatchArgumentsAsArray",
    value: function _dispatchArgumentsAsArray() {
      var counter = this._currentCounter;
      var node = this._head;
      var canContinueInvoking = this._canContinueInvoking;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      while (node) {
        if (node.counter !== 0 && counter >= node.counter) {
          node.callback.call(this, args);

          if (canContinueInvoking && !canContinueInvoking.call(this, args)) {
            break;
          }
        }

        node = node.next;
      }
    }
  }, {
    key: "_dispatchNotArgumentsAsArray",
    value: function _dispatchNotArgumentsAsArray() {
      var counter = this._currentCounter;
      var node = this._head;
      var canContinueInvoking = this._canContinueInvoking;

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      while (node) {
        if (node.counter !== 0 && counter >= node.counter) {
          node.callback.apply(this, args);

          if (canContinueInvoking && !canContinueInvoking.apply(this, args)) {
            break;
          }
        }

        node = node.next;
      }
    }
  }, {
    key: "_applyDispatchArgumentsAsArray",
    value: function _applyDispatchArgumentsAsArray() {
      var counter = this._currentCounter;
      var node = this._head;
      var canContinueInvoking = this._canContinueInvoking;

      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      while (node) {
        if (node.counter !== 0 && counter >= node.counter) {
          node.callback.call(this, args);

          if (canContinueInvoking && !canContinueInvoking.call(this, args)) {
            break;
          }
        }

        node = node.next;
      }
    }
  }, {
    key: "_applyDispatchNotArgumentsAsArray",
    value: function _applyDispatchNotArgumentsAsArray() {
      var counter = this._currentCounter;
      var node = this._head;
      var canContinueInvoking = this._canContinueInvoking;

      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      while (node) {
        if (node.counter !== 0 && counter >= node.counter) {
          node.callback.apply(this, args);

          if (canContinueInvoking && !canContinueInvoking.apply(this, args)) {
            break;
          }
        }

        node = node.next;
      }
    }
  }]);

  return CallbackList;
}();

var index = {
  CallbackList: CallbackList
};
module.exports = index;

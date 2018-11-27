"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _immutable = require("immutable");

var _reactRedux = require("react-redux");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TOJS = function TOJS(WrappedComponent) {
  return function (wrappedComponentProps) {
    var KEY = 0;
    var VALUE = 1;

    var propsJS = Object.entries(wrappedComponentProps).reduce(function (newProps, wrappedComponentProp) {
      newProps[wrappedComponentProp[KEY]] = _immutable.Iterable.isIterable(wrappedComponentProp[VALUE]) ? wrappedComponentProp[VALUE].toJS() : wrappedComponentProp[VALUE];
      return newProps;
    }, {});

    return _react2.default.createElement(WrappedComponent, propsJS);
  };
}; /**
    * By converting Immutable.JS objects to plain JavaScript values within a HOC,
    * we achieve Dumb Component portability, but without the performance hits of
    * using toJS() in the Smart Component.
    * Note: if your app requires high performance, you may need to avoid toJS()
    * altogether, and so will have to use Immutable.JS in your dumb components.
    * However, for most apps this will not be the case, and the benefits of keeping
    *  Immutable.JS out of your dumb components (maintainability, portability and
    * easier testing) will far outweigh any perceived performance improvements of
    * keeping it in.
    *
    * In addition, using toJS in a Higher Order Component should not cause much,
    * if any, performance degradation, as the component will only be called when
    * the connected component’s props change. As with any performance issue,
    * conduct performance checks first before deciding what to optimize.
    */

exports.default = function (mapstatetoprops, mapdispatchtoprops) {
  var wrappedDispatchToProps = mapdispatchtoprops ? function () {
    return function (dispatch) {
      return Object.assign(mapdispatchtoprops(dispatch), {
        dispatch: dispatch
      });
    };
  }() : null;

  return function (WrappedComponent) {
    return (0, _reactRedux.connect)(mapstatetoprops, wrappedDispatchToProps)(TOJS(WrappedComponent));
  };
};
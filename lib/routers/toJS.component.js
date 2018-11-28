"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _immutable = require("immutable");

var _reactRedux = require("react-redux");

/**
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
var TOJS = function TOJS(WrappedComponent) {
  return function (wrappedComponentProps) {
    var KEY = 0;
    var VALUE = 1;
    var propsJS = Object.entries(wrappedComponentProps).reduce(function (newProps, wrappedComponentProp) {
      newProps[wrappedComponentProp[KEY]] = _immutable.Iterable.isIterable(wrappedComponentProp[VALUE]) ? wrappedComponentProp[VALUE].toJS() : wrappedComponentProp[VALUE];
      return newProps;
    }, {});
    return _react.default.createElement(WrappedComponent, propsJS);
  };
};
/**
 * 生成一个dispatch方法和一个dispatchWithLoading的方法
 * @param {*} dispatch 
 */


function addDispatch(dispatch) {
  return {
    dispatch: dispatch,
    dispatchWithLoading: function dispatchWithLoading(action) {
      if (action.type && action.payload && action.payload.tag) {
        dispatch({
          type: "loading/insert",
          action: action
        });
      } else {
        throw new Error("发起loading的request时，需要填写tag，并保持该tag当前本页面的唯一性。");
      }
    }
  };
}
/**
 * 此方法将会在modelToStore中与store一起导出，一般情况不要直接使用
 */


var _default = function _default(mapstatetoprops, mapdispatchtoprops) {
  var wrappedDispatchToProps = mapdispatchtoprops ? function (dispatch) {
    return Object.assign(mapdispatchtoprops(dispatch), addDispatch(dispatch));
  } : function (dispatch) {
    return addDispatch(dispatch);
  };
  return function (WrappedComponent) {
    return (0, _reactRedux.connect)(mapstatetoprops, wrappedDispatchToProps)(TOJS(WrappedComponent));
  };
};

exports.default = _default;
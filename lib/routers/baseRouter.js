"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _reactRouterDom = require("react-router-dom");

var _react = _interopRequireWildcard(require("react"));

var _toJS = _interopRequireDefault(require("./toJS.component"));

// 等待验证
var getConfirmation = function getConfirmation(message, callback) {
  var allowTransition = window.confirm(message);
  callback(allowTransition);
};
/**
 * 这个组件可以完成的功能非常多
 * 例如：
 * 1. routing功能
 * 2. 组合的弹窗功能
 * 3. 右侧工具箱（原型中没有，但是应该非常好用）
 * 4. 加载功能/按钮禁用功能
 */


var Routing =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2.default)(Routing, _Component);

  function Routing() {
    var _this;

    (0, _classCallCheck2.default)(this, Routing);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(Routing).call(this));
    _this.state = {
      pathname: "",
      search: ""
    };
    return _this;
  } // 查看监听方式


  (0, _createClass2.default)(Routing, [{
    key: "shouldComponentUpdate",
    // 查看是否需要更新
    // 此处可以判定多种情况
    value: function shouldComponentUpdate(nextProps) {
      var history = nextProps.history;
      var _this$state = this.state,
          search = _this$state.search,
          pathname = _this$state.pathname;
      return !(history.location.pathname === pathname && history.location.search === search);
    }
  }, {
    key: "render",
    value: function render() {
      return _react.default.createElement("div", null);
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      return routing(nextProps, prevState) || prevState;
    }
  }]);
  return Routing;
}(_react.Component);

var RoutingPage = (0, _toJS.default)()(Routing);
/**
 * 路由控制器
 * @param {*} nextProps 
 * @param {*} prevState 
 */

function routing(nextProps, prevState) {
  var history = nextProps.history,
      dispatch = nextProps.dispatch;
  var pathname = prevState.pathname,
      search = prevState.search;
  var location = history.location;

  if (pathname === location.pathname && search === location.search) {
    return false;
  } else {
    dispatch({
      type: "routing/LOCATION_CHANGE",
      payload: location
    });
    dispatch({
      type: location.pathname,
      payload: location
    });
    return {
      pathname: location.pathname,
      search: location.search
    };
  }
}

var AppRouter = function AppRouter(_ref) {
  var routers = _ref.routers,
      children = _ref.children;

  if (routers && children) {
    console.warn("同时使用routers和children时，将忽略children");
  }

  return _react.default.createElement(_reactRouterDom.HashRouter, {
    basename: "/",
    getUserConfirmation: getConfirmation,
    children: _react.default.createElement("div", null, _react.default.createElement(_reactRouterDom.Route, {
      path: "/",
      component: RoutingPage
    }), routers || children)
  });
};

var _default = AppRouter;
exports.default = _default;
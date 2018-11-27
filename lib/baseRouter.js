"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reactRouterDom = require("react-router-dom");

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _toJS = require("./toJS.component");

var _toJS2 = _interopRequireDefault(_toJS);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var Routing = function (_Component) {
  _inherits(Routing, _Component);

  function Routing() {
    _classCallCheck(this, Routing);

    var _this = _possibleConstructorReturn(this, (Routing.__proto__ || Object.getPrototypeOf(Routing)).call(this));

    _this.state = {
      pathname: "",
      search: ""
    };
    return _this;
  }

  // 查看监听方式


  _createClass(Routing, [{
    key: "shouldComponentUpdate",


    // 查看是否需要更新
    // 此处可以判定多种情况
    value: function shouldComponentUpdate(nextProps) {
      var history = nextProps.history;
      var _state = this.state,
          search = _state.search,
          pathname = _state.pathname;

      return !(history.location.pathname === pathname && history.location.search === search);
    }
  }, {
    key: "render",
    value: function render() {
      return _react2.default.createElement("div", null);
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      return routing(nextProps, prevState) || prevState;
    }
  }]);

  return Routing;
}(_react.Component);

var RoutingPage = (0, _toJS2.default)()(Routing);

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
    dispatch({ type: "routing/LOCATION_CHANGE", payload: location });
    dispatch({ type: location.pathname + location.search });

    return {
      pathname: location.pathname,
      search: location.search
    };
  }
}

var AppRouter = function AppRouter(_ref) {
  var routers = _ref.routers;

  return _react2.default.createElement(_reactRouterDom.HashRouter, {
    basename: "/",
    getUserConfirmation: getConfirmation,
    children: _react2.default.createElement(
      "div",
      null,
      _react2.default.createElement(_reactRouterDom.Route, { path: "/", component: RoutingPage }),
      routers
    )
  });
};

exports.default = AppRouter;
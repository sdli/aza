"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.request = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _immutable = _interopRequireWildcard(require("immutable"));

var _reduxImmutable = require("redux-immutable");

var _redux = require("redux");

var _reactRedux = require("react-redux");

var _reduxDevtoolsExtension = require("redux-devtools-extension");

var _reduxSaga = _interopRequireDefault(require("redux-saga"));

var _effects = require("redux-saga/effects");

var _request = _interopRequireDefault(require("./request"));

// 全局immutable组件
// 构建工具
// saga工具
// 请求工具
var requestMethod = (0, _request.default)();
var SagaMiddleware = (0, _reduxSaga.default)(); // 请求工具

/**
 * 获取store，包含：
 * [sagamiddleware]：用于执行generator
 * [reducers]：函数合并，用于合并不同model中的reducer
 * [redux(composeWithDevTools)]：用于浏览器开启redux支持
 * @param {Array | Object} model 用户的model文件
 */

function createApp(options, model) {
  var _this = this;

  var __domProvider;

  var __reducers = addLoading(addRoutingModel(modelReducersToStore(model, options.persist)));

  var store = (0, _redux.createStore)( // 从model中，提取reducers
  // 此处判断是否为immutable，如果是，则使用ImmutableCombineReducers
  options || options && options.immutable || options && typeof options.immutable === "undefined" ? (0, _reduxImmutable.combineReducers)(__reducers) : (0, _redux.combineReducers)(__reducers), options.initialState ? _immutable.default.fromJS(Object.assign(options.initialState, getReduxPersis(options.persist))) : _immutable.default.fromJS(getReduxPersis(options.persist)),
  /**
   * 注意：如果你需要react-devtools而不是redux-devtools：
   * 1. 请到nw-build中的package.json修改chromium-args，
   * 2. 或者指定启动方式npm run start-nw命令中的--load-extension;
   * [目前为止，redux的作用远大于react，所以，建议开启redux就可以了]
   */
  (0, _reduxDevtoolsExtension.composeWithDevTools)((0, _redux.applyMiddleware)(SagaMiddleware))); // 调用sagaMiddleWare的runsaga模块

  startEffects(model, store.dispatch);
  startLoadingEffect();
  /**
   * 将store和provider渲染至dom
   */

  this.run = function () {
    _reactDom.default.render(_this.__domProvider, document.getElementById("root"));
  };

  this.route = function (AppRouter) {
    _this.__domProvider = _react.default.createElement(_reactRedux.Provider, {
      store: store
    }, _react.default.createElement(AppRouter, null));
  };

  requestMethod.set(store, options.requestLock);
}
/**
 * model提取reducers
 * @param {Object} model
 */


function modelReducersToStore(model, persist) {
  // 如果存在多个model则合并
  if (Object.prototype.toString.call(model) === "[object Array]") {
    var tempModels = {};
    model.forEach(function (val) {
      tempModels = Object.assign(tempModels, modelReducersToStore(val, persist));
    });
    return tempModels;
  }

  if (!model || typeof model.state === "undefined" || !(0, _immutable.isImmutable)(model.state)) {
    // 此处为强制使用immutable
    // 后期可修改为配置文件
    throw new Error("model未定义或为mutable可变数据");
  }

  model.initialState = model.state;
  return (0, _defineProperty2.default)({}, model.namespace, function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : model.state;
    var action = arguments.length > 1 ? arguments[1] : undefined;
    // 判断是否添加namespace
    checkNameSpace(action);

    var _action$type$split = action.type.split("/"),
        _action$type$split2 = (0, _slicedToArray2.default)(_action$type$split, 2),
        namespace = _action$type$split2[0],
        actionType = _action$type$split2[1]; // 是否需要清空全部store


    if (namespace === "clear") {
      switch (actionType) {
        case "all":
          return model.initialState;

        default:
          return state;
      }
    } // 检查是否为用一个命名空间，否则直接返回state


    if (namespace === model.namespace) {
      if (actionType in model.reducers) {
        var newState = model.reducers[actionType](state, action); // 检测是否需要持久化存储

        checkPersist(namespace, persist, newState);
        return newState;
      }

      return state;
    }

    return state;
  });
}
/**
 * 启用saga的takeEvery
 * @param {Object / Array} model 来自models文件夹的数据模型
 */


function startEffects(model, dispatch) {
  if (Object.prototype.toString.call(model) === "[object Array]") {
    model.forEach(function (m) {
      return pushGeneratorArray(m, dispatch);
    });
  } else {
    pushGeneratorArray(model, dispatch);
  }
}
/**
 *
 * @param {*} namespace
 * @param {*} persist
 * @param {*} newState
 */


function getReduxPersis(persist) {
  var store = {};

  if (!persist || !persist.keys) {
    return {};
  }

  if (Object.prototype.toString.call(persist.keys) !== "[object Array]") {
    throw new Error("persit中keys必须是数组");
  }

  persist.keys.forEach(function (val) {
    var storage;

    switch (persist.env) {
      case "browser":
        storage = localStorage.getItem("REDUX/" + val);
        break;

      default:
        storage = localStorage.getItem("REDUX/" + val);
    }

    if (storage) {
      store[val] = JSON.parse(storage);
    }
  });
  return store;
}
/**
 * checkPersist
 * @param {string} namespace
 * @param {object} persist
 * @param {Immutable} newState
 */


function checkPersist(namespace, persist, newState) {
  if (!persist || !persist.keys) {
    return;
  }

  if (persist.keys.indexOf(namespace) > -1) {
    switch (persist.env) {
      // 默认是浏览器
      case "browser":
        localStorage.setItem("REDUX/" + namespace, JSON.stringify(newState.toJS()));
        break;

      default:
        localStorage.setItem("REDUX/" + namespace, JSON.stringify(newState.toJS()));
    }

    return;
  }

  return;
}
/**
 * 生成generator方法
 */


function pushGeneratorArray(model, dispatch) {
  var efs = model.effects;
  var sub = model.subscriptions;

  if (typeof efs !== "undefined") {
    var namespace = model.namespace;
    var effectList = Object.entries(efs); //注册effect列表

    effectList.forEach(function (effect) {
      SagaMiddleware.run(
      /*#__PURE__*/
      // 此处必须为generator函数，否则会报错
      _regenerator.default.mark(function _callee() {
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _effects.takeEvery)(namespace + "/" + effect[0], effect[1]);

              case 2:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));
    });
  } //注册路由监听列表


  if (typeof sub !== "undefined") {
    sub.forEach(function (listener) {
      if (listener.path) {
        SagaMiddleware.run(
        /*#__PURE__*/
        _regenerator.default.mark(function _callee3() {
          return _regenerator.default.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.next = 2;
                  return (0, _effects.takeEvery)(listener.path,
                  /*#__PURE__*/
                  _regenerator.default.mark(function _callee2(action) {
                    return _regenerator.default.wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            _context2.next = 2;
                            return (0, _effects.put)({
                              type: listener.dispatch,
                              action: action
                            });

                          case 2:
                          case "end":
                            return _context2.stop();
                        }
                      }
                    }, _callee2, this);
                  }));

                case 2:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, this);
        }));
      }

      if (listener.request) {
        SagaMiddleware.run(
        /*#__PURE__*/
        _regenerator.default.mark(function _callee5() {
          return _regenerator.default.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  _context5.next = 2;
                  return (0, _effects.takeEvery)("request/" + listener.request,
                  /*#__PURE__*/
                  _regenerator.default.mark(function _callee4(action) {
                    return _regenerator.default.wrap(function _callee4$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            _context4.next = 2;
                            return (0, _effects.put)({
                              type: listener.dispatch,
                              action: action
                            });

                          case 2:
                          case "end":
                            return _context4.stop();
                        }
                      }
                    }, _callee4, this);
                  }));

                case 2:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5, this);
        }));
      }

      if (listener.on) {
        if (window) {
          window[listener.on] = function (e) {
            dispatch({
              type: "on/" + listener.on,
              action: e
            });
          };
        }

        SagaMiddleware.run(
        /*#__PURE__*/
        _regenerator.default.mark(function _callee7() {
          return _regenerator.default.wrap(function _callee7$(_context7) {
            while (1) {
              switch (_context7.prev = _context7.next) {
                case 0:
                  _context7.next = 2;
                  return (0, _effects.takeEvery)("on/" + listener.on,
                  /*#__PURE__*/
                  _regenerator.default.mark(function _callee6(action) {
                    return _regenerator.default.wrap(function _callee6$(_context6) {
                      while (1) {
                        switch (_context6.prev = _context6.next) {
                          case 0:
                            _context6.next = 2;
                            return (0, _effects.put)({
                              type: listener.dispatch,
                              action: action
                            });

                          case 2:
                          case "end":
                            return _context6.stop();
                        }
                      }
                    }, _callee6, this);
                  }));

                case 2:
                case "end":
                  return _context7.stop();
              }
            }
          }, _callee7, this);
        }));
      }
    });
  }
}
/**
 *
 * @param {*} action
 */


function startLoadingEffect() {
  // 注册loading状态
  SagaMiddleware.run(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee9() {
    return _regenerator.default.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return (0, _effects.takeEvery)("loading/insert",
            /*#__PURE__*/
            _regenerator.default.mark(function _callee8(action) {
              return _regenerator.default.wrap(function _callee8$(_context8) {
                while (1) {
                  switch (_context8.prev = _context8.next) {
                    case 0:
                      _context8.next = 2;
                      return (0, _effects.put)({
                        type: action.action.type,
                        payload: action.action.payload
                      });

                    case 2:
                    case "end":
                      return _context8.stop();
                  }
                }
              }, _callee8, this);
            }));

          case 2:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, this);
  }));
}
/**
 * 判断命名空间
 * @param {*} action
 */


function checkNameSpace(action) {
  if (action.type.toString().indexOf("/") === -1 && action.type.toString().indexOf("@") === -1) {
    throw new Error("dispatch\u65B9\u6CD5\u65F6\uFF0C\u5FC5\u987B\u6DFB\u52A0namespace\uFF0C\u5E76\u4F7F\u7528'/'\u5206\u5272\uFF0C\u4F8B\u5982:dispath({type:'app/getUserInfo'});\n        \u6536\u5230\u7684action:\" ".concat(action.type));
  }
}
/**
 * 添加路由routing
 */


function addRoutingModel(models) {
  var newModels = Object.assign(models, {
    routing: function routing() {
      var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _immutable.default.Map();
      var action = arguments.length > 1 ? arguments[1] : undefined;
      checkNameSpace(action);

      var _action$type$split3 = action.type.split("/"),
          _action$type$split4 = (0, _slicedToArray2.default)(_action$type$split3, 2),
          namespace = _action$type$split4[0],
          actionType = _action$type$split4[1];

      if (namespace === "routing" && actionType === "LOCATION_CHANGE") {
        return state.set("routing", action.payload);
      }

      return state;
    }
  });
  return newModels;
}
/**
 * 添加loading
 */


function addLoading(models) {
  var newModels = Object.assign(models, {
    // loading的列表为List，防止多个tag重复
    loading: function loading() {
      var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _immutable.default.Set();
      var action = arguments.length > 1 ? arguments[1] : undefined;
      checkNameSpace(action);

      var _action$type$split5 = action.type.split("/"),
          _action$type$split6 = (0, _slicedToArray2.default)(_action$type$split5, 2),
          namespace = _action$type$split6[0],
          actionType = _action$type$split6[1];

      if (namespace === "loading" && actionType === "insert") {
        // 此处为两层action嵌套
        return state.add(action.action.payload.tag);
      }

      if (namespace === "loading" && actionType === "delete") {
        // 此处为一层action嵌套
        return state.delete(action.payload.tag);
      }

      return state;
    }
  });
  return newModels;
}

var request = requestMethod.request;
exports.request = request;
var _default = createApp;
exports.default = _default;
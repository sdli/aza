'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.request = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

// 全局immutable组件


// 构建工具


// saga工具


// 请求工具


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _reduxImmutable = require('redux-immutable');

var _redux = require('redux');

var _reactRedux = require('react-redux');

var _reduxDevtoolsExtension = require('redux-devtools-extension');

var _reduxSaga = require('redux-saga');

var _reduxSaga2 = _interopRequireDefault(_reduxSaga);

var _effects = require('redux-saga/effects');

var _request = require('./request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var request = void 0;
var SagaMiddleware = (0, _reduxSaga2.default)();

// 请求工具
/**
 * 获取store，包含：
 * [sagamiddleware]：用于执行generator
 * [reducers]：函数合并，用于合并不同model中的reducer
 * [redux(composeWithDevTools)]：用于浏览器开启redux支持
 * @param {Array | Object} model 用户的model文件 
 */
function createApp(options, model) {
    var _this = this;

    var __domProvider = void 0;
    var __reducers = addRoutingModel(modelReducersToStore(model));
    var store = (0, _redux.createStore)(

    // 从model中，提取reducers
    // 此处判断是否为immutable，如果是，则使用ImmutableCombineReducers
    options || options && options.immutable || options && typeof options.immutable === "undefined" ? (0, _reduxImmutable.combineReducers)(__reducers) : (0, _redux.combineReducers)(__reducers),

    /**
    * 注意：如果你需要react-devtools而不是redux-devtools：
    * 1. 请到nw-build中的package.json修改chromium-args，
    * 2. 或者指定启动方式npm run start-nw命令中的--load-extension;
    * [目前为止，redux的作用远大于react，所以，建议开启redux就可以了] 
     */
    (0, _reduxDevtoolsExtension.composeWithDevTools)((0, _redux.applyMiddleware)(SagaMiddleware)));

    // 调用sagaMiddleWare的runsaga模块
    startEffects(model, store.dispatch);

    // 添加store监听
    // init Scriptions 添加订阅
    // Subscriber(store,model);

    /**
     * 将store和provider渲染至dom
     */
    this.run = function () {
        _reactDom2.default.render(_this.__domProvider, document.getElementById('root'));
    };

    this.route = function (AppRouter) {
        _this.__domProvider = _react2.default.createElement(
            _reactRedux.Provider,
            { store: store },
            _react2.default.createElement(AppRouter, null)
        );
    };

    this.request = exports.request = request = (0, _request2.default)(store);
}

/**
 * model提取reducers
 * @param {Object} model 
 */
function modelReducersToStore(model) {

    // 如果存在多个model则合并
    if (Object.prototype.toString.call(model) === "[object Array]") {
        var tempModels = {};
        for (var i = 0; i < model.length; i++) {
            tempModels = Object.assign(tempModels, modelReducersToStore(model[i]));
        }
        return tempModels;
    }

    if (!model || typeof model.state === "undefined" || !(0, _immutable.isImmutable)(model.state)) {

        // 此处为强制使用immutable
        // 后期可修改为配置文件
        throw new Error("model未定义或为mutable可变数据");
    }

    return _defineProperty({}, model.namespace, function () {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : model.state;
        var action = arguments[1];


        // 判断是否添加namespace
        checkNameSpace(action);

        var _action$type$split = action.type.split("/"),
            _action$type$split2 = _slicedToArray(_action$type$split, 2),
            namespace = _action$type$split2[0],
            actionType = _action$type$split2[1];

        // 检查是否为用一个命名空间，否则直接返回state


        if (namespace === model.namespace) {
            if (actionType in model.reducers) {
                return model.reducers[actionType](state, action);
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
 * 生成generator方法
 */
function pushGeneratorArray(model, dispatch) {
    var efs = model.effects;
    var sub = model.subscriptions;
    var namespace = model.namespace;
    var effectList = Object.entries(efs);

    //注册effect列表
    effectList.forEach(function (effect) {
        SagaMiddleware.run(
        // 此处必须为generator函数，否则会报错
        /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return (0, _effects.takeEvery)(namespace + "/" + effect[0], effect[1]);

                        case 2:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));
    });

    //注册路由监听列表
    if (typeof sub !== "undefined") {
        sub.forEach(function (listener) {
            if (listener.path) {
                SagaMiddleware.run( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                    return regeneratorRuntime.wrap(function _callee3$(_context3) {
                        while (1) {
                            switch (_context3.prev = _context3.next) {
                                case 0:
                                    _context3.next = 2;
                                    return (0, _effects.takeEvery)(listener.path, /*#__PURE__*/regeneratorRuntime.mark(function _callee2(action) {
                                        return regeneratorRuntime.wrap(function _callee2$(_context2) {
                                            while (1) {
                                                switch (_context2.prev = _context2.next) {
                                                    case 0:
                                                        _context2.next = 2;
                                                        return (0, _effects.put)({ type: listener.dispatch, action: action });

                                                    case 2:
                                                    case 'end':
                                                        return _context2.stop();
                                                }
                                            }
                                        }, _callee2, this);
                                    }));

                                case 2:
                                case 'end':
                                    return _context3.stop();
                            }
                        }
                    }, _callee3, this);
                }));
            }

            if (listener.request) {
                SagaMiddleware.run( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
                    return regeneratorRuntime.wrap(function _callee5$(_context5) {
                        while (1) {
                            switch (_context5.prev = _context5.next) {
                                case 0:
                                    _context5.next = 2;
                                    return (0, _effects.takeEvery)("request/" + listener.request, /*#__PURE__*/regeneratorRuntime.mark(function _callee4(action) {
                                        return regeneratorRuntime.wrap(function _callee4$(_context4) {
                                            while (1) {
                                                switch (_context4.prev = _context4.next) {
                                                    case 0:
                                                        _context4.next = 2;
                                                        return (0, _effects.put)({ type: listener.dispatch, action: action });

                                                    case 2:
                                                    case 'end':
                                                        return _context4.stop();
                                                }
                                            }
                                        }, _callee4, this);
                                    }));

                                case 2:
                                case 'end':
                                    return _context5.stop();
                            }
                        }
                    }, _callee5, this);
                }));
            }

            if (listener.on) {
                if (window) {
                    window[listener.on] = function (e) {
                        dispatch({ type: "on/" + listener.on, action: e });
                    };
                }

                SagaMiddleware.run( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
                    return regeneratorRuntime.wrap(function _callee7$(_context7) {
                        while (1) {
                            switch (_context7.prev = _context7.next) {
                                case 0:
                                    _context7.next = 2;
                                    return (0, _effects.takeEvery)("on/" + listener.on, /*#__PURE__*/regeneratorRuntime.mark(function _callee6(action) {
                                        return regeneratorRuntime.wrap(function _callee6$(_context6) {
                                            while (1) {
                                                switch (_context6.prev = _context6.next) {
                                                    case 0:
                                                        _context6.next = 2;
                                                        return (0, _effects.put)({ type: listener.dispatch, action: action });

                                                    case 2:
                                                    case 'end':
                                                        return _context6.stop();
                                                }
                                            }
                                        }, _callee6, this);
                                    }));

                                case 2:
                                case 'end':
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
 * 判断命名空间
 * @param {*} action 
 */
function checkNameSpace(action) {
    if (action.type.toString().indexOf("/") === -1 && action.type.toString().indexOf("@") === -1) {
        throw new Error('dispatch\u65B9\u6CD5\u65F6\uFF0C\u5FC5\u987B\u6DFB\u52A0namespace\uFF0C\u5E76\u4F7F\u7528\'/\'\u5206\u5272\uFF0C\u4F8B\u5982:dispath({type:\'app/getUserInfo\'});\n        \u6536\u5230\u7684action:" ' + action.type);
    }
}
/**
 * 添加路由routing
 */
function addRoutingModel(models) {
    var newModels = Object.assign(models, {
        routing: function routing() {
            var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _immutable2.default.Map();
            var action = arguments[1];

            checkNameSpace(action);

            var _action$type$split3 = action.type.split("/"),
                _action$type$split4 = _slicedToArray(_action$type$split3, 2),
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
exports.request = request;
exports.default = createApp;
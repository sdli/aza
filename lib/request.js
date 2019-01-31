"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var REQUEST_LOCK_LIST = [];
/**
 * 添加请求锁
 * @param {string} url request url
 * @@@ writtenBy Steven Leo on 2018/09/13
 */

function LockRequest(url, options, lockOptions) {
  var reqData = JSON.stringify({
    url: url,
    options: options
  }); // 处理post请求

  if (!REQUEST_LOCK_LIST.some(function (val) {
    return val === reqData;
  })) {
    REQUEST_LOCK_LIST.push(reqData);
    AutoUnlock(url, options, lockOptions);
    return true;
  } // 如果发现请求已经加锁，则直接返回false


  console.warn("\n    [\u8BF7\u6C42\u5DF2\u7ECF\u88AB\u52A0\u9501]\u51FA\u73B0\u8FD9\u4E2A\u63D0\u793A\u662F\u56E0\u4E3A\u60A8\u77ED\u65F6\u95F4\u5185\u53D1\u8D77\u4E86\u540C\u4E00\u4E2A\u8BF7\u6C42,\n    \u8BF7\u8BBE\u7F6E\u8BF7\u6C42\u9501\u65F6\u95F4\u6216\u53D6\u6D88\u8BF7\u6C42\u9501\uFF1Aconst app = new createApp({...requestLock: {open: true,timeout: 15000}..)\n    ", url, options);
  return false;
}
/**
 * 请求自动解锁
 * @param {string} url
 * @param {objct} options
 */


function AutoUnlock(url, options, lockOptions) {
  if (typeof lockOptions === "undefined" || typeof lockOptions.open === "undefined" || lockOptions.open) {
    setTimeout(function () {
      UNLOCK(url, options);
    }, lockOptions && typeof lockOptions.timeout !== "undefined" ? lockOptions.timeout : 10000);
  }
}
/**
 * 请求解锁
 * @param {string} url
 * @param {object} options
 * @@@ written by Steven Leo on 2018/09/13
 */


function UNLOCK(url, options) {
  var reqData = JSON.stringify({
    url: url,
    options: options
  });
  var tag = REQUEST_LOCK_LIST.indexOf(reqData);

  if (tag > -1) {
    REQUEST_LOCK_LIST.splice(tag, 1);
  }
}

var _default = function _default() {
  var store, lockOption;
  return {
    set: function set(storeInstance, lockOptions) {
      store = storeInstance;
      lockOption = lockOptions;
    },
    request: function request(url, options) {
      // 请求加锁
      if (!LockRequest(url, options, lockOption)) {
        return Promise.resolve(lockOption && lockOption.timeoutRes ? lockOption.timeoutRes : {
          code: "-1",
          locked: true,
          msg: "Prev same request is in progress and locked! It will be auto-unlocked in your [requestLock.timeout] milliseconds!"
        });
      } // 添加请求超时处理


      return Promise.race([fetch(url, options) // 将404,401处理定位为报错
      .then(function (response) {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(response.status);
        }
      }) // 正确的数据直接返回
      .then(function (data) {
        UNLOCK(url, options);
        return data;
      }) // 错误的数据进行处理
      // 此处添加了dispatch，可以为错误信息增加监听
      .catch(function (err) {
        UNLOCK(url, options);

        if (store) {
          store.dispatch({
            type: "request/" + err.message
          });
        }
      }), new Promise(function (resolve) {
        console.log("进入计时器");
        setTimeout(function () {
          if (store) {
            store.dispatch({
              type: "request/timeout"
            });
          }

          resolve({
            code: "-2",
            msg: "timeout"
          });
        }, lockOption && lockOption.timeout ? lockOption.timeout : 10000);
      })]);
    }
  };
};

exports.default = _default;
let REQUEST_LOCK_LIST = [];

/**
 * 添加请求锁
 * @param {string} url request url
 * @@@ writtenBy Steven Leo on 2018/09/13
 */
function LockRequest(url, options, lockOptions) {
  const reqData = JSON.stringify({ url: url, options: options });

  // 处理post请求
  if (!REQUEST_LOCK_LIST.some(val => val === reqData)) {
    REQUEST_LOCK_LIST.push(reqData);
    AutoUnlock(url, options, lockOptions);
    return true;
  }

  // 如果发现请求已经加锁，则直接返回false
  console.warn(
    `
    [请求已经被加锁]出现这个提示是因为您短时间内发起了同一个请求,
    请设置请求锁时间或取消请求锁：const app = new createApp({...requestLock: {open: true,timeout: 15000}..)
    `,
    url,
    options
  );
  return false;
}

/**
 * 请求自动解锁
 * @param {string} url
 * @param {objct} options
 */
function AutoUnlock(url, options, lockOptions) {
  if (
    typeof lockOptions === "undefined" ||
    typeof lockOptions.open === "undefined" ||
    lockOptions.open
  ) {
    setTimeout(
      () => {
        UNLOCK(url, options);
      },
      lockOptions && typeof lockOptions.timeout !== "undefined"
        ? lockOptions.timeout
        : 10000
    );
  }
}

/**
 * 请求解锁
 * @param {string} url
 * @param {object} options
 * @@@ written by Steven Leo on 2018/09/13
 */
function UNLOCK(url, options) {
  const reqData = JSON.stringify({ url: url, options: options });
  const tag = REQUEST_LOCK_LIST.indexOf(reqData);
  if (tag > -1) {
    REQUEST_LOCK_LIST.splice(tag, 1);
  }
}

export default () => {
  let store, lockOption;

  return {
    set: (storeInstance, lockOptions) => {
      store = storeInstance;
      lockOption = lockOptions;
    },
    request: (url, options) => {
      let succ = false;

      // 请求加锁
      if (!LockRequest(url, options, lockOption)) {
        return Promise.resolve(
          lockOption && lockOption.timeoutRes
            ? lockOption.timeoutRes
            : {
                code: "-1",
                locked: true,
                msg:
                  "Prev same request is in progress and locked! It will be auto-unlocked in your [requestLock.timeout] milliseconds!"
              }
        );
      }

      // 添加请求超时处理
      return Promise.race([
        fetch(url, options)
          // 将404,401处理定位为报错
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error(response.status);
            }
          })

          // 正确的数据直接返回
          .then(data => {
            UNLOCK(url, options);
            succ = true;
            return data;
          })

          // 错误的数据进行处理
          // 此处添加了dispatch，可以为错误信息增加监听
          .catch(err => {
            UNLOCK(url, options);
            succ = true;
            if (store) {
              store.dispatch({ type: "request/" + err.message });
            }
          }),
        new Promise(resolve => {
          setTimeout(
            () => {
              if (store && !succ) {
                store.dispatch({ type: "request/timeout" });
              }
              resolve({ code: "-2", msg: "timeout" });
            },
            lockOption && lockOption.timeout ? lockOption.timeout : 10000
          );
        })
      ]);
    }
  };
};

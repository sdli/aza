import { HashRouter as Router, Route } from "react-router-dom";
import React, { Component } from "react";
import connect from "./toJS.component";

// 等待验证
const getConfirmation = (message, callback) => {
  const allowTransition = window.confirm(message);
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
class Routing extends Component {
  constructor() {
    super();
    this.state = {
      pathname: "",
      search: ""
    };
  }

  // 查看监听方式
  static getDerivedStateFromProps(nextProps, prevState) {
    return routing(nextProps,prevState) || prevState;
  }

  // 查看是否需要更新
  // 此处可以判定多种情况
  shouldComponentUpdate(nextProps) {
    const { history } = nextProps;
    const { search, pathname } = this.state;
    return !(
      history.location.pathname === pathname &&
      history.location.search === search
    );
  }

  render() {
    return (
      <div>
        {/* 这是routing模块 */}
      </div>
    );
  }
}

const RoutingPage = connect()(Routing);


/**
 * 路由控制器
 * @param {*} nextProps 
 * @param {*} prevState 
 */
function routing(nextProps,prevState){
  const { history, dispatch } = nextProps;
  const { pathname, search } = prevState;
  const { location } = history;

  if (pathname === location.pathname && search === location.search) {
    return false;
  } else {
    dispatch({ type: "routing/LOCATION_CHANGE", payload: location });
    dispatch({ type: location.pathname , payload: location});

    return {
      pathname: location.pathname,
      search: location.search
    };
  }
}

const AppRouter = ({ routers, children }) => {
  if(routers && children){
    console.warn("同时使用routers和children时，将忽略children")
  }
  return (
    <Router
      basename="/"
      getUserConfirmation={getConfirmation}
      children={
        <div>
          <Route path="/" component={RoutingPage} />
          {routers || children}
        </div>
      }
    />
  );
};

export default AppRouter;

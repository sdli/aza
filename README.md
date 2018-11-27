#### AZA：轻量级redux/immutable/react-router/persist解决方案
我们对redux/redux-sage进行了多个项目后发现，一个高可用、多配置的前端框架很是需要。其中model的书写习惯部分参考了dvajs，我们还在其中新增了以下几个功能
+ 对subscription进行了拓展，支持onLocalStorage、OnXXXX等浏览器监听
+ 监听request中fetch的状态码，可在subscription中配置{request:"401",dispatch:"XX/XX"} 更方便对错误监听
+ 对react-router v4中，history不支持HashRouter的问题进行了优化，支持了自动在**redux中添加routing**
+ 全面支持**Immutable**，目前这个是默认开启的
+ 支持持久化存储，自定义**persist**，可选择您需要的nameSpace自定义是否长期存储
+ 支持清空store方法：dispatch({type:"clear/all"})（后期将会添加更多配置来丰富这个功能）

##### 1. 安装
**aza**需要配合react和react-dom，所以你的环境中需要使用react以及react-dom
```
npm install aza --save
||
yarn add aza
```
(推荐：我们推荐您使用create-raect-app来构建应用，这个是默认会增加react 和 react-dom，你无需再次引入)

##### 2. 简单上手


```js
//index.js
import createApp from "aza";

// 路由
import AppRouter from './pages/router.pages';


// Models
import aModel from "./models/a.model";
import bModel from "./models/b.model";

// NW.js

const app = new createApp(
    {},
    [aModel,bModel]
);

// 加载路由
app.route(AppRouter);
app.run();
```

```js
// router
import React from "react";
import {BaseRouter} from "aza";
import {Route} from "aza/router"
import MainLayout from "../components/layouts/main.layout"

const AppRouter = () => {
  return (
    <BaseRouter routers={
      (
        <div>
          <Route path="/" render={()=>{
            return (
              <MainLayout>
                  <Route path="/data" component={()=>{<p>data page</p>})} />
              </MainLayout>
            )
          }} />
        </div>
      )
    }
    />
  )
};

export default AppRouter;
```





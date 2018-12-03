#### 1. 概述
我们对react16/redux/redux-sage/immutable/redux-immutable/redux-persist/react-router（v4）使用了多个项目后发现，一个高可用、多配置的前端框架很是需要，为了从框架中增加更多对immutable的支持以及对准确loading的控制，我们搭建了这个框架。

其中model的书写习惯部分参考了dvajs的书写习惯，我们还在其中新增了以下几个功能

* 对subscription进行了拓展，支持onLocalStorage、OnXXXX等浏览器监听
* 监听request中fetch的状态码，可在subscription中配置{request:"401",dispatch:"XX/XX"} 更方便对错误监听
* 对react-router v4中，history不支持HashRouter的问题进行了优化，支持了自动在redux中添加routing
* 全面支持Immutable，目前这个是默认开启的
* 支持持久化存储，自定义persist，可选择您需要的namespace自定义是否长期存储
* 支持清空store方法：dispatch({type:"clear/all"})（后期将会添加更多配置来丰富这个功能）
(注意：clear方法不会清空routing和loading中的内容，这样可以保证你的应用还可以获取routing和loading状态)
* 支持redux-sage的全套方法
* 支持redux-saga-test-plan中的测试流程


#### 2. 适用场景

* 复杂的桌面应用
* 需要持久化应用数据的应用
* 需要immutable不可变数据的应用
* 需要引入react16版本新特性的应用
* 需要易于测试或TDD开发的应用
* 需要多个复杂加载状态控制的应用


**Peer Dependencies：**
react 16 和 react-dom 16 

#### 3. 文档地址

[查看aza在线文档](https://www.yuque.com/steven-kkr5g/aza)

import React from 'react'
import ReactDOM from 'react-dom'

// 全局immutable组件
import immutable, { isImmutable } from "immutable"
import { combineReducers as ImmutableCombineReducers } from "redux-immutable"
import { combineReducers } from "redux"

// 构建工具
import { Provider } from "react-redux"
import { createStore , applyMiddleware} from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'

// saga工具
import createSagaMiddleware from 'redux-saga'
import { takeEvery,take, put, call } from "redux-saga/effects"

// 请求工具
import initialRequest from "./request"
import { DH_CHECK_P_NOT_SAFE_PRIME } from 'constants';

let request;
const SagaMiddleware = createSagaMiddleware();

// 请求工具
/**
 * 获取store，包含：
 * [sagamiddleware]：用于执行generator
 * [reducers]：函数合并，用于合并不同model中的reducer
 * [redux(composeWithDevTools)]：用于浏览器开启redux支持
 * @param {Array | Object} model 用户的model文件 
 */
function createApp(options,model) {

    let __domProvider;
    const __reducers = addLoading(
        addRoutingModel(
            modelReducersToStore(
                model,
                options.persist
            )
        )
    );
    const store = createStore(

        // 从model中，提取reducers
        // 此处判断是否为immutable，如果是，则使用ImmutableCombineReducers
        options 
        || (options && options.immutable)
        || (options && typeof options.immutable === "undefined") 
        ?
        ImmutableCombineReducers(
            __reducers
        )
        :
        combineReducers(
            __reducers
        )
        ,

        options.initialState 
        ? 
        immutable.fromJS(Object.assign(
            options.initialState, 
            getReduxPersis(options.persist)
        ))
        :
        immutable.fromJS(
            getReduxPersis(options.persist)
        )
        ,
        /**
        * 注意：如果你需要react-devtools而不是redux-devtools：
        * 1. 请到nw-build中的package.json修改chromium-args，
        * 2. 或者指定启动方式npm run start-nw命令中的--load-extension;
        * [目前为止，redux的作用远大于react，所以，建议开启redux就可以了] 
         */
        composeWithDevTools(
            applyMiddleware(
                SagaMiddleware
            )
        )
    );

    window.onbeforeunload = ()=>{
        localStorage.set("cachedredux",JSON.stringify(store.getState()));
        return "确定要刷新或关闭浏览器窗口？";
    }
    // 调用sagaMiddleWare的runsaga模块
    startEffects(model,store.dispatch);
    startLoadingEffect();

    // 添加store监听
    // init Scriptions 添加订阅
    // Subscriber(store,model);
    
    /**
     * 将store和provider渲染至dom
     */
    this.run = ()=>{
        ReactDOM.render(
            this.__domProvider, 
            document.getElementById('root')
        );
    }

    this.route = (AppRouter)=>{
        this.__domProvider = (
            <Provider store={store}>
                <AppRouter/>
            </Provider>
        )
    }

    this.request = request = initialRequest(store);
}

/**
 * model提取reducers
 * @param {Object} model 
 */
function modelReducersToStore(model,persist) {

    // 如果存在多个model则合并
    if (Object.prototype.toString.call(model) === "[object Array]") {
        let tempModels = {};
        for (var i = 0; i < model.length; i++) {
            tempModels = Object.assign(tempModels, modelReducersToStore(model[i],persist));
        }
        return tempModels;
    }

    if (
        !model ||
        typeof model.state === "undefined" ||
        !isImmutable(model.state)
    ) {

        // 此处为强制使用immutable
        // 后期可修改为配置文件
        throw new Error("model未定义或为mutable可变数据");
    }

    return {
        // 将model的命名空间插入合并为同一个reducer
        [model.namespace]: (state = model.state, action) => {

            // 判断是否添加namespace
            checkNameSpace(action);
            const [namespace, actionType] = action.type.split("/");

            // 是否需要清空全部store
            if(namespace === "clear"){
                switch (actionType){
                    case "all":
                        return immutable.Map();
                    default:
                        return state;
                }
            }

            // 检查是否为用一个命名空间，否则直接返回state
            if (namespace === model.namespace) {
                if (actionType in model.reducers) {
                    const newState = model.reducers[actionType](state, action);

                    // 检测是否需要持久化存储
                    checkPersist(namespace,persist,newState);

                    return newState;
                }
                return state;
            }
            return state;
        },
    }
}

/**
 * 启用saga的takeEvery
 * @param {Object / Array} model 来自models文件夹的数据模型 
 */
function startEffects(model,dispatch) {
    if (Object.prototype.toString.call(model) === "[object Array]") {
        model.forEach(m=>pushGeneratorArray(m,dispatch));
    } else {
        pushGeneratorArray(model,dispatch);
    }
}

/**
 * 
 * @param {*} namespace 
 * @param {*} persist 
 * @param {*} newState 
 */
function getReduxPersis(persist){
    const store = {};
    if(!persist || !persist.keys){
        return {}
    }
    if(Object.prototype.toString.call(persist.keys) !== '[object Array]'){
        throw new Error("persit中keys必须是数组");
    }

    persist.keys.forEach(val=>{
        let storage;
        switch (persist.env){
            case "browser":
                storage = localStorage.getItem("REDUX/"+val);
                store[val] = storage ? JSON.parse(storage) : {};
                break;
            default:
                storage = localStorage.getItem("REDUX/"+val);
                store[val] = storage ? JSON.parse(storage) : {};
        }
    })

    return store;
}
/**
 * checkPersist
 * @param {string} namespace 
 * @param {object} persist 
 * @param {Immutable} newState 
 */
function checkPersist(namespace,persist,newState){
    if(!persist || !persist.keys){
        return;
    }
    if(persist.keys.indexOf(namespace) > -1){
        switch (persist.env){

            // 默认是浏览器
            case "browser":
                localStorage.setItem("REDUX/" + namespace,JSON.stringify(newState.toJS()));
                break;
            default:
                localStorage.setItem("REDUX/" + namespace,JSON.stringify(newState.toJS()));
        }
        return;
    }
    return;
}
/**
 * 生成generator方法
 */
function pushGeneratorArray(model,dispatch) {
    const efs = model.effects;
    const sub = model.subscriptions;
    const namespace = model.namespace;
    const effectList  = Object.entries(efs);

    //注册effect列表
    effectList.forEach(effect=>{
        SagaMiddleware.run(
            // 此处必须为generator函数，否则会报错
            function* () {
                yield takeEvery(namespace + "/" + effect[0], effect[1]);
            }
        )
    })

    //注册路由监听列表
    if(typeof sub !== "undefined"){
        sub.forEach(listener=>{
            if(listener.path){
                SagaMiddleware.run(
                    function* (){
                        yield takeEvery(listener.path, function *(action){
                            yield put({type: listener.dispatch, action})
                        })
                    }
                )
            }

            if(listener.request){
                SagaMiddleware.run(
                    function* (){
                        yield takeEvery("request/" + listener.request, function *(action){
                            yield put({type: listener.dispatch, action})
                        })
                    }
                )
            }

            if(listener.on){
                if(window){
                    window[listener.on] = (e)=>{
                        dispatch({type: "on/" + listener.on,action: e});
                    }
                }

                SagaMiddleware.run(
                    function* (){
                        yield takeEvery("on/" + listener.on, function *(action){
                            yield put({type: listener.dispatch, action})
                        })
                    }
                )
            }

        })
    }
}

/**
 * 
 * @param {*} action 
 */
function startLoadingEffect(){
    // 注册loading状态
    SagaMiddleware.run(
        function* (){
            yield takeEvery("loading/insert", function *(action){
                yield put({type: action.action.type, payload: action.action.payload})
            })

        }
    );  
}

/**
 * 判断命名空间
 * @param {*} action 
 */
function checkNameSpace(action){
    if(action.type.toString().indexOf("/") === -1 && action.type.toString().indexOf("@") === -1){
        throw new Error(`dispatch方法时，必须添加namespace，并使用'/'分割，例如:dispath({type:'app/getUserInfo'});
        收到的action:" ${action.type}`)
    }
}
/**
 * 添加路由routing
 */
function addRoutingModel(models){
    const newModels = Object.assign(models,{
        routing: (state = immutable.Map(),action)=>{
            checkNameSpace(action);
            const [namespace, actionType] = action.type.split("/");
            if(namespace === "routing" && actionType === "LOCATION_CHANGE"){
                return state.set("routing",action.payload);
            }
            return state;
        }
    });
    return newModels;
}

/**
 * 添加loading
 */
function addLoading(models){
    const newModels = Object.assign(models,{

        // loading的列表为List，防止多个tag重复
        loading: (state = immutable.Set(),action)=>{
            checkNameSpace(action);
            const [namespace, actionType] = action.type.split("/");
            if(namespace === "loading" && actionType === "insert"){

                // 此处为两层action嵌套
                return state.add(action.action.payload.tag);
            }

            if(namespace === "loading" && actionType === "delete"){

                // 此处为一层action嵌套
                return state.delete(action.payload.tag);
            }
            return state;
        }
    });
    return newModels;
}

export {request};
export default createApp

# AppMateBrowser
AppMate browser.

这是 [AppMate](http://s17.mogucdn.com/new1/v1/fxihe/d0da31c875767324becb9e575f68fd34/A1c0b9eca4d2000802.appmate.png) web 端，功能可用于测试 AppMate 整个链路。

**See Also**

* [AppMateServer](https://github.com/c98/AppMateServer)
* [AppMateClient](https://github.com/c98/AppMateClient)

## 环境依赖
Node >= 6 and npm >= 3
工具链安装请参考 [installation](https://github.com/facebookincubator/create-react-app#installation)

## 编译运行
这是使用 [create-react-app](https://github.com/facebookincubator/create-react-app) 搭建的一个简单的 web 端原型。细节可参考 [how to build](https://github.com/facebookincubator/create-react-app#npm-run-build)

## 文件组织

* `index.js`: 页面路由
* `App.js`: 设置统一的页头和页尾
* `Entry.js`: AppMate 入口页
* `Dashboard.js`: 详情页面的布局
* `components/`: 详情页各功能组件，比如 hotfix、sandbox
* `event.js`: websocket 链接处理
* `utils.js`: 常用功能封装

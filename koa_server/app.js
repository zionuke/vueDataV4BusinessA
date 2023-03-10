// 服务器入口文件

// 1.创建 koa 实例对象
const Koa = require('koa');
const app = new Koa();

// 2.绑定中间件
// 绑定第一层中间件(计算总耗时中间件)
const respDurationMiddleWare = require('./middleware/koa_response_duration');
app.use(respDurationMiddleWare);
// 绑定第二层中间件(响应头中间件)
const respHeaderMiddleware = require('./middleware/koa_response_header');
app.use(respHeaderMiddleware);
// 绑定第三层中间件(读取文件数据)
const respDataMiddleware = require('./middleware/koa_response_data');
app.use(respDataMiddleware);
// 3.绑定端口号8888
app.listen(8888, () => {
   console.log('Server Start Complete: http://localhost:8888')
});

const WebSocketService = require('./service/web_socket_service') // 这里相对路径为啥必须加./表示当前目录?
// 开启服务端的监听, 监听客户端的连接
// 当某一个客户端连接成功之后, 就会对这个客户端进行 message 事件的监听
WebSocketService.listen()

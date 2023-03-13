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

const WebSocket = require('ws')
// 创建 WebSocket 服务端的对象, 绑定的端口号是9998
const wss = new WebSocket.Server({
  port: 9998
})
// 对客户端的连接事件进行监听
// client:代表的是客户端的连接 socket 对象
wss.on('connection', client => {
	console.log('有客户端连接成功了...')
	// 对客户端的连接对象进行 message 事件的监听
	// msg: 由客户端发给服务端的数据
	client.on('message', (msg) => {
		console.log('客户端发送数据给服务端了: ' + msg)
		// 由服务端往客户端发送数据
		client.send('hello socket from backend')
	})
})

const path = require('path')
const fileUtils = require('../utils/file_utils')
// 1.引入 websocket
const WebSocket = require('ws')
// 2.创建 WebSocket 服务端的对象, 绑定的端口号是9998
const wss = new WebSocket.Server({port: 9998}, () => {
  console.log('websocket服务开启...')
})
// 服务端开启了监听
module.exports.listen = () => {
	// 对客户端的连接事件进行监听
	// client:代表的是客户端的连接 socket 对象
	wss.on('connection', (client) => {
		console.log('有客户端连接成功了...')

		// 对客户端的连接对象进行 message 事件的监听
		// msg: 由客户端发给服务端的数据
		client.on('message', async msg => {
			console.info('客户端发送数据给服务端了: ' + msg)
			const payload = JSON.parse(msg)
			const action = payload.action
			if (action === 'getData') {
				let filePath = `../data/${payload.chartName}.json` // payload.chartName // trend seller map rank hot stock
				filePath = path.join(__dirname, filePath)
				// 读取到 json 文件内容
				const ret = await fileUtils.getFileJsonData(filePath)
				// 需要在服务端获取到数据的基础之上, 增加一个 data 的字段
				// data所对应的值,就是某个 json 文件的内容
				payload.data = ret
				// 返回给客户端
				client.send(JSON.stringify(payload))
			} else {
				// 原封不动的将所接收到的数据转发给每一个处于连接状态的客户端
				// wss.clients 数组包含所有客户端的连接
				wss.clients.forEach((client) => {
					client.send(msg)
				})
			}
			// 由服务端往客户端发送数据
			// client.send('hello socket from backend')
		})
    client.on('error', (e) => {
      console.info('有客户端出错了...')
    })
    client.on('close', (e) => {
      console.info('有客户端断开了...')
    })
	})
}

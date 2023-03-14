export default class SocketService {
  // 和服务端连接的 socket 对象
  #ws = undefined

  // 存储回调函数
  #callbackMapping = {}

  // 标识是否连接成功
  #connected = false

  // 请求数据尝试的次数
  #sendRetryCount = 0

  // 重新连接尝试的次数
  #connectRetryCount = 0

  /**
   * 单例设计模式
   */
  static #instance = undefined
  static get Instance () {
    if (!this.#instance) {
      this.#instance = new SocketService()
    }
    return this.#instance
  }

  // 定义连接服务器的方法
  connect () {
    // 先判断浏览器是否支持 WebSocket
    if (!window.WebSocket) {
      return console.log('您的浏览器不支持WebSocket')
    }
    // 连接服务器
    this.#ws = new WebSocket('ws://localhost:9998')

    // 连接成功的事件
    this.#ws.onopen = () => {
      console.log('连接服务端成功了')
      this.#connected = true
      // 重置重新连接的次数
      this.#connectRetryCount = 0
    }

    // 1.连接服务端失败
    // 2.当连接成功后, 服务器关闭
    this.#ws.onclose = () => {
      console.log('连接服务端失败')
      this.#connected = false
      this.#connectRetryCount++
      setTimeout(() => {
        this.connect()
      }, 500 * this.#connectRetryCount)
    }

    // 得到服务端发送过来的数据
    this.#ws.onmessage = (msg) => {
      console.log('从服务端获取到了数据')
      // 真正服务端发送过来的原始数据是在 msg 中的 data 字段
      // console.log(msg.data)
      const recvData = JSON.parse(msg.data)
      // 取出业务模块类型
      const socketType = recvData.socketType
      // 判断回调函数是否存在
      if (this.#callbackMapping[socketType]) {
        const action = recvData.action
        if (action === 'getData') {
          // 获取 realData 真实数据
          const realData = JSON.parse(recvData.data)
          this.#callbackMapping[socketType](realData)
        } else if (action === 'fullScreen') {
          this.#callbackMapping[socketType](recvData)
        } else if (action === 'themeChange') {
          this.#callbackMapping[socketType](recvData)
        }
      }
    }
  }

  /**
   * 注册回调函数
   * @param {socketType} 业务模块类型
   * @param {*} callback
   */
  registerCallback (socketType, callback) {
    this.#callbackMapping[socketType] = callback
  }

  // 取消某一个回调函数
  unRegisterCallback (socketType) {
    this.#callbackMapping[socketType] = null
  }

  // 发送数据的方法
  send (data) {
    // 判断此时有没有连接成功
    if (this.#connected) {
      this.#sendRetryCount = 0
      // 调用 WebSocket 身上的 send 方法
      this.#ws.send(JSON.stringify(data))
    } else {
      this.#sendRetryCount++
      setTimeout(() => {
        this.send(data)
      }, 500 * this.#sendRetryCount)
    }
  }
}

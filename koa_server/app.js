// 服务器入口文件
// 1.创建 koa 实例对象
const Koa = require('koa');
const app = new Koa();
// 2.绑定中间件
const respDurationMiddleWare = require('./middleware/koa_response_duration');
app.use(respDurationMiddleWare);
const respHeaderMiddleware = require('./middleware/koa_response_header');
app.use(respHeaderMiddleware);
const respDataMiddleware = require('./middleware/koa_response_data');
app.use(respDataMiddleware);
// 3.绑定端口号8888
app.listen(8888);
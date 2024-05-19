const { Server } = require('http')
const { log } = console

class App {
    constructor() {
        this.routes = []
        this.middleware = []
        this.methods = ['GET', 'POST']
        this.data = []
    }

use(handler) {
        this.middleware.push(handler)
}

get(url, handler) {
        this.routes.push({
            method: 'GET',
            url, handler
        })
}

addMethods(methods) {
      this.methods.push(methods)
}

listen(port = 80, callback = () => {}) {
        new Server((req, res) => {
          // Custom routes first
            this.routes.map(r => {
                this.methods.includes(r.method) && req.url === r.url ? r.handler(req, res) : null
            })
            // Then middlewares (if no any route matches)
            this.middleware.map(h => h(req, res))
        }).listen(port, callback())
    }
}

const app = new App()

app.use((req, res) => {
  res.end('Hello World')
})

app.get('/hello', (req, res) => {
    res.end('Hi bros')
    console.log(req.headers['user-agent'])
})

app.listen(80, () => console.log('Server started'))

const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;
  if (url == '/') {
    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<head></head>');
    res.write('<body>');
    res.write("<form action='/message' method='POST'>");
    res.write("<input type='text' /><button type='submit'>chuyen trang</button>");
    res.write('</form>');
    res.write('</body>');
    res.write('</html>');
  } else if (url === '/message') {
    if(method === 'POST'){
      fs.writeFileSync('message.txt', 'DUMMY');
      res.statusCode = 302;
      res.setHeader('Location','/');
      res.end();
    }
    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<head></head>');
    res.write('<body><h1>Hello from my Node.js server!</h1></body>');
    res.write('</html>');
  }
})

server.listen('3000')

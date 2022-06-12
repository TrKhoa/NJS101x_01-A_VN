const http = require('http');

const server = http.createServer((req, res) => {
  const url = req.url;
  if(url=='/'){
    res.setHeader('Content-Type','text/html');
    res.write('<html>');
    res.write('<head></head>');
    res.write('<body>');
    res.write("<input type='text' /><a href='/message'><input type='button' value='chuyen trang' /></a>");
    res.write('</body>');
    res.write('</html>');
  } else if (url=='/message'){
    res.setHeader('Content-Type','text/html');
    res.write('<html>');
    res.write('<head></head>');
    res.write('<body><h1>Hello from my Node.js server!</h1></body>');
    res.write('</html>');
  }
})

server.listen('3000')

const fs = require('fs');

const requestHandle = (req,res) =>{
  const url = req.url;
  const method = req.method;
  if (url == '/') {
    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<head></head>');
    res.write('<body>');
    res.write("<form action='/message' method='POST'>");
    res.write("<input type='text' name='message' /><button type='submit'>chuyen trang</button>");
    res.write('</form>');
    res.write('</body>');
    res.write('</html>');
  } else if (url === '/message') {
    if (method === 'POST') {
      const body=[];
      req.on('data', (chunk) => {
        body.push(chunk);
      });
      req.on('end', ()=> {
        const parsedBody = Buffer.concat(body).toString();
        const message = parsedBody.split('=')[1];
        fs.writeFileSync('message.txt', message);
      });
      res.statusCode = 302;
      res.setHeader('Location', '/');
      res.end();
    }
  }
}


module.exports = {
  handler: requestHandle,
  someText: 'Khoa abc'
}

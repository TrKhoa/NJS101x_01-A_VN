const http = require('http');

const express = require('express');

const app = express();

app.use((req,res,next)=>{
  console.log("dong 1");
  next();
});

app.use((req,res,next)=>{
  console.log("dong 2");
});

const server = http.createServer(app);

server.listen(3000);

// server.js

const express = require("express");
// const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const port = process.env.PORT || 3000;
const subscribers = [];

app.prepare().then(() => {
  const server = express();
  server.use(express.json()); // parse the body

  server.get("/api/message", (req, res)=>{
    subscribers.push(res);
      
    req.on("close", ()=>{
      console.log("deleting subscriber");
      const index = subscribers.findIndex((item)=>item===res);
      subscribers.splice(index,1);

    });

  });

  server.post("/api/message", (req, res)=>{
    subscribers.forEach((r)=>{
      r.status(200).json(req.body)
    })

    res.status(200).end();
  });

  server.get("*", (req, res)=>{
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`Listening on http://localhost:${port}`);
  });

});

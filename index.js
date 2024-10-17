import http from "node:http";
import DevicesController from "./devices.controller.js";

const SERVER_PORT = 8080;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === "/devices" && req.method === "GET") {
    DevicesController.findMany(req, res);
  } else if (url.pathname.startsWith("/devices/") && req.method === "GET") {
    DevicesController.findOne(req, res);
  } else if (url.pathname === "/devices" && req.method === "POST") {
    DevicesController.createOne(req, res);
  } else if (url.pathname.startsWith("/devices/") && req.method === "PUT") {
    DevicesController.updateOne(req, res);
  } else if (url.pathname.startsWith("/devices/") && req.method === "PATCH") {
    DevicesController.patchOne(req, res);
  } else if (url.pathname.startsWith("/devices/") && req.method === "DELETE") {
    DevicesController.deleteOne(req, res);
  } else {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
  }
});

server.listen(SERVER_PORT, () => {
  console.log(`Server is listening on port ${SERVER_PORT}`);
});

import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const filePath = path.join(__dirname, "devices.json");

class DevicesController {
  static findMany(req, res) {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return res
          .writeHead(500, { "Content-Type": "application/json" })
          .end(JSON.stringify({ error: "Error reading file" }));
      }

      const devices = JSON.parse(data);
      const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
      const name = searchParams.get("name");
      const minPrice = parseFloat(searchParams.get("minPrice")) || undefined;
      const maxPrice = parseFloat(searchParams.get("maxPrice")) || undefined;

      const filteredDevices = devices.filter(
        (device) =>
          (!name || device.name.toLowerCase().includes(name.toLowerCase())) &&
          (minPrice === undefined || device.price >= minPrice) &&
          (maxPrice === undefined || device.price <= maxPrice)
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ data: filteredDevices }));
    });
  }

  static findOne(req, res) {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Error reading file" }));
        return;
      }

      const devices = JSON.parse(data);
      const id = parseInt(req.url.split("/")[2], 10);
      const device = devices.find((device) => device.id === id);
      if (device) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ data: device }));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Device Not Found" }));
      }
    });
  }

  static createOne(req, res) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const bodyParsed = JSON.parse(body);
      if (bodyParsed.name && bodyParsed.price) {
        fs.readFile(filePath, "utf8", (err, data) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Error reading file" }));
            return;
          }

          const devices = JSON.parse(data);
          const newDevice = {
            id: devices[devices.length - 1].id + 1,
            name: bodyParsed.name,
            price: bodyParsed.price,
          };
          devices.push(newDevice);
          fs.writeFile(
            filePath,
            JSON.stringify(devices, null, 2),
            "utf8",
            (err) => {
              if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Error writing file" }));
                return;
              }
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ data: newDevice }));
            }
          );
        });
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Request body must contain both name and price fields",
          })
        );
      }
    });
  }

  static updateOne(req, res) {
    const id = parseInt(req.url.split("/")[2], 10);
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const updatedDevice = JSON.parse(body);
      if (updatedDevice.name && updatedDevice.price) {
        fs.readFile(filePath, "utf8", (err, data) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Error reading file" }));
            return;
          }

          const devices = JSON.parse(data);
          const deviceIndex = devices.findIndex((device) => device.id === id);
          if (deviceIndex !== -1) {
            devices[deviceIndex] = { id, ...updatedDevice };
            fs.writeFile(
              filePath,
              JSON.stringify(devices, null, 2),
              "utf8",
              (err) => {
                if (err) {
                  res.writeHead(500, { "Content-Type": "application/json" });
                  res.end(JSON.stringify({ error: "Error writing file" }));
                  return;
                }
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ data: devices[deviceIndex] }));
              }
            );
          } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Device Not Found" }));
          }
        });
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Request body must contain both name and price fields",
          })
        );
      }
    });
  }

  static patchOne(req, res) {
    const id = parseInt(req.url.split("/")[2], 10);
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const updates = JSON.parse(body);
      if (updates.name || updates.price) {
        fs.readFile(filePath, "utf8", (err, data) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Error reading file" }));
            return;
          }

          const devices = JSON.parse(data);
          const device = devices.find((device) => device.id === id);
          if (device) {
            if (updates.name) device.name = updates.name;
            if (updates.price) device.price = updates.price;
            fs.writeFile(
              filePath,
              JSON.stringify(devices, null, 2),
              "utf8",
              (err) => {
                if (err) {
                  res.writeHead(500, { "Content-Type": "application/json" });
                  res.end(JSON.stringify({ error: "Error writing file" }));
                  return;
                }
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ data: device }));
              }
            );
          } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Device Not Found" }));
          }
        });
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Request body must contain at least one field to update",
          })
        );
      }
    });
  }

  static deleteOne(req, res) {
    const id = parseInt(req.url.split("/")[2], 10);
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Error reading file" }));
        return;
      }

      let devices = JSON.parse(data);
      const device = devices.find((device) => device.id === id);
      if (device) {
        devices = devices.filter((device) => device.id !== id);
        fs.writeFile(
          filePath,
          JSON.stringify(devices, null, 2),
          "utf8",
          (err) => {
            if (err) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Error writing file" }));
              return;
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ data: device }));
          }
        );
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Device Not Found" }));
      }
    });
  }
}

export default DevicesController;

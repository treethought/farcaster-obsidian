import * as http from "http";
import httpProxy from "http-proxy";

const proxy = httpProxy.createProxyServer();

const target = "https://api.neynar.com/v2/farcaster"; // Replace with your upstream target

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  req.headers["x-api-key"] = process.env.API_KEY;

  req.headers["host"] = new URL(target).host;

  proxy.web(req, res, { target }, (err) => {
    console.error("Proxy error:", err);
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end("Bad Gateway");
  });
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});

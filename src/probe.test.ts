import { probeEndpoint, probeAll, probeResultToEndpoint } from "./probe";
import { Endpoint } from "./snapshot";
import http from "http";
import { AddressInfo } from "net";

let server: http.Server;
let baseUrl: string;

const makeEndpoint = (path: string): Endpoint => ({
  method: "GET",
  url: `${baseUrl}${path}`,
});

beforeAll((done) => {
  server = http.createServer((req, res) => {
    if (req.url === "/ok") {
      res.writeHead(200, { "content-type": "application/json" });
      return res.end('{"ok":true}');
    }
    res.writeHead(404);
    res.end();
  });
  server.listen(0, () => {
    baseUrl = `http://localhost:${(server.address() as AddressInfo).port}`;
    done();
  });
});

afterAll((done) => server.close(done));

describe("probeEndpoint", () => {
  it("captures successful response", async () => {
    const res = await probeEndpoint(makeEndpoint("/ok"));
    expect(res.error).toBeNull();
    expect(res.result?.status).toBe(200);
    expect(res.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("captures error on connection failure", async () => {
    const res = await probeEndpoint({ method: "GET", url: "http://localhost:1/x" });
    expect(res.error).not.toBeNull();
    expect(res.result).toBeNull();
  });
});

describe("probeAll", () => {
  it("probes multiple endpoints", async () => {
    const results = await probeAll([makeEndpoint("/ok"), makeEndpoint("/missing")]);
    expect(results).toHaveLength(2);
    expect(results[0].result?.status).toBe(200);
    expect(results[1].result?.status).toBe(404);
  });
});

describe("probeResultToEndpoint", () => {
  it("maps probe result back to endpoint shape", async () => {
    const probe = await probeEndpoint(makeEndpoint("/ok"));
    const ep = probeResultToEndpoint(probe);
    expect(ep.status).toBe(200);
    expect(ep.responseHeaders?.["content-type"]).toBe("application/json");
  });
});

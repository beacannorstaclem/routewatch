import { fetchEndpoint } from "./fetch";
import http from "http";
import { AddressInfo } from "net";

let server: http.Server;
let baseUrl: string;

beforeAll((done) => {
  server = http.createServer((req, res) => {
    if (req.url === "/timeout") {
      // never respond
      return;
    }
    res.writeHead(200, { "content-type": "application/json", "x-custom": "hello" });
    res.end(JSON.stringify({ ok: true }));
  });
  server.listen(0, () => {
    const port = (server.address() as AddressInfo).port;
    baseUrl = `http://localhost:${port}`;
    done();
  });
});

afterAll((done) => server.close(done));

describe("fetchEndpoint", () => {
  it("returns status, headers, and body", async () => {
    const result = await fetchEndpoint(`${baseUrl}/api`);
    expect(result.status).toBe(200);
    expect(result.headers["content-type"]).toBe("application/json");
    expect(result.headers["x-custom"]).toBe("hello");
    expect(JSON.parse(result.body)).toEqual({ ok: true });
  });

  it("rejects on timeout", async () => {
    await expect(
      fetchEndpoint(`${baseUrl}/timeout`, { timeout: 100 })
    ).rejects.toThrow("timed out");
  });

  it("rejects on connection refused", async () => {
    await expect(
      fetchEndpoint("http://localhost:1")
    ).rejects.toBeDefined();
  });
});

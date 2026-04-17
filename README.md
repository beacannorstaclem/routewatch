# routewatch

> CLI tool to monitor and diff REST API endpoint changes over time

## Installation

```bash
npm install -g routewatch
```

## Usage

Point `routewatch` at an API base URL and it will snapshot your endpoints, then report any changes on subsequent runs.

```bash
# Take an initial snapshot
routewatch snapshot --url https://api.example.com --out snapshot.json

# Diff against a previous snapshot
routewatch diff --url https://api.example.com --snapshot snapshot.json
```

Example output:

```
[+] POST /v2/users/bulk       (new endpoint)
[~] GET  /v1/orders           (response schema changed)
[-] DELETE /v1/legacy/tokens  (endpoint removed)
```

### Options

| Flag | Description |
|------|-------------|
| `--url` | Base URL of the API to monitor |
| `--snapshot` | Path to a previously saved snapshot file |
| `--out` | Output file for the new snapshot |
| `--format` | Output format: `text` (default) or `json` |
| `--ignore` | Comma-separated list of paths to ignore |

## Configuration

You can define defaults in a `routewatch.config.json` file at the project root:

```json
{
  "url": "https://api.example.com",
  "ignore": ["/health", "/metrics"]
}
```

## License

[MIT](LICENSE)
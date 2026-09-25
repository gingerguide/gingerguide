# Call the Gingerguide MCP server with curl

The server is stateless. Each request is one JSON-RPC message in an HTTP POST.

## List the tools

```bash
curl -s https://gingerguide.app/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Search for a city

```bash
curl -s https://gingerguide.app/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_cities","arguments":{"query":"lisbon"}}}'
```

## Get one city with all its sights

```bash
curl -s https://gingerguide.app/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_city_guide","arguments":{"city_id":"rome"}}}'
```

## Catalog totals

```bash
curl -s https://gingerguide.app/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"get_catalog_overview","arguments":{}}}'
```

## Same data without MCP

```bash
curl -s https://gingerguide.app/api/cities.json
curl -s https://gingerguide.app/api/cities/rome.json
```

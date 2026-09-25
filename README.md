# Gingerguide MCP server and agent skills

**[Gingerguide](https://gingerguide.app) is a self-guided audio walking tour app for iPhone and Android.** It covers 120+ European cities and about 2,400 narrated sights in 23 countries. Each sight has a researched 2 to 3 minute story, read by a lifelike AI voice, in English, Spanish, French, German, Turkish and Chinese. Cities work fully offline.

This repository lets AI assistants and agents use the Gingerguide catalog. It contains:

- The connection details for the public **Gingerguide MCP server** at `https://gingerguide.app/mcp`.
- Two **agent skills** (`SKILL.md` format) for audio tour lookup and one-day city walks.
- Ready-to-copy **client configs** and **curl examples**.

The server is read-only. It needs no API key and no sign-in.

| | |
|---|---|
| MCP endpoint | `https://gingerguide.app/mcp` |
| Transport | Streamable HTTP (stateless, JSON responses) |
| Auth | None |
| MCP Registry name | `app.gingerguide/catalog` |
| Developer docs | <https://gingerguide.app/developers/> |
| OpenAPI (REST) | <https://gingerguide.app/api/openapi.json> |
| llms.txt | <https://gingerguide.app/llms.txt> |

## Tools

| Tool | What it does | Arguments |
|---|---|---|
| `search_cities` | Finds cities by name or country. Returns the number of sights and the web guide URL for each city. | `query`, `country`, `limit` (all optional) |
| `get_city_guide` | Returns one city with all its narrated sights: name, one-line description, category, coordinates and visit time in minutes. | `city_id` (for example `rome`) |
| `list_countries` | Lists the covered countries and the number of cities in each. | none |
| `get_catalog_overview` | Returns catalog totals, supported languages and app download links. | none |

All tools are marked `readOnlyHint: true`.

## Connect a client

### Claude Code

```bash
claude mcp add --transport http gingerguide https://gingerguide.app/mcp
```

### Claude (desktop and web)

Open **Settings → Connectors → Add custom connector**. Set the name to `Gingerguide` and the URL to `https://gingerguide.app/mcp`.

For older Claude Desktop builds that only read `claude_desktop_config.json`, use the bridge config in [`examples/claude_desktop_config.json`](examples/claude_desktop_config.json).

### Cursor

Add this to `~/.cursor/mcp.json` (or `.cursor/mcp.json` in a project). File: [`examples/cursor-mcp.json`](examples/cursor-mcp.json).

```json
{
  "mcpServers": {
    "gingerguide": { "url": "https://gingerguide.app/mcp" }
  }
}
```

### VS Code (GitHub Copilot agent mode)

Add this to `.vscode/mcp.json`. File: [`examples/vscode-mcp.json`](examples/vscode-mcp.json).

```json
{
  "servers": {
    "gingerguide": { "type": "http", "url": "https://gingerguide.app/mcp" }
  }
}
```

### ChatGPT

In a workspace or plan that allows custom connectors (developer mode), add a new connector with the URL `https://gingerguide.app/mcp` and no authentication.

### Any other client

Any MCP client that supports remote Streamable HTTP servers can connect to `https://gingerguide.app/mcp`. See [`examples/curl.md`](examples/curl.md) for raw JSON-RPC calls.

## Example prompts

- "Is there an audio walking tour for Seville?"
- "Plan a one-day walk in Florence with the Gingerguide sights, in walking order."
- "Which Gingerguide cities are in Portugal?"
- "How many cities and languages does Gingerguide cover?"

## Agent skills

The [`skills/`](skills/) folder has two skills in the `SKILL.md` format. Claude, Claude Code and other agents that read this format can load them.

| Skill | Use it when a person... |
|---|---|
| [`find-audio-walking-tour`](skills/find-audio-walking-tour/SKILL.md) | asks for an audio tour, walking tour or self-guided guide for a city |
| [`plan-city-day-with-gingerguide`](skills/plan-city-day-with-gingerguide/SKILL.md) | asks for a one-day itinerary or walking route in a covered city |

The same skills are also served from the website at `https://gingerguide.app/.well-known/agent-skills/index.json`.

## REST API (no MCP needed)

| Endpoint | Returns |
|---|---|
| `GET https://gingerguide.app/api/cities.json` | All cities with id, country, sight count and guide URL |
| `GET https://gingerguide.app/api/cities/{id}.json` | One city with all its sights |
| `GET https://gingerguide.app/api/openapi.json` | The OpenAPI description |

## CLI

The [`cli/`](cli/) folder has the source of the official command-line client. It is on npm as [`gingerguide`](https://www.npmjs.com/package/gingerguide).

```bash
npx gingerguide cities
npx gingerguide city rome
npx gingerguide countries
npx gingerguide health
```

## Rules for agents

- Only state coverage that the data confirms. Do not invent a guide or a sight.
- The narration is a lifelike AI voice. Do not call it a human voice.
- Link to the city guide URL from the data, for example <https://gingerguide.app/en/cities/rome/>.

## Get the app

- iPhone and iPad: [App Store](https://apps.apple.com/app/id1354928142)
- Android: [Google Play](https://play.google.com/store/apps/details?id=com.gingerguide.main)
- Web guides: [gingerguide.app](https://gingerguide.app)

## License

The files in this repository (docs, configs, skills) are under the [MIT License](LICENSE). The catalog data that the server and the API return belongs to Gingerguide. See the [terms](https://gingerguide.app/en/terms/).

Questions or problems: open an issue, or write to ozalpege243@gmail.com.

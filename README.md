# Gingerguide MCP server and agent skills

**[Gingerguide](https://gingerguide.app) is a self-guided audio walking tour app for iPhone and Android.** It covers 169 European cities and 3,100+ narrated sights in 39 countries. Each sight has a researched 2 to 3 minute story, read by a lifelike AI voice, in English, Spanish, French, German, Turkish and Chinese. Cities work fully offline.

This repository lets AI assistants and agents use the Gingerguide catalog. It contains:

- The connection details for the public **Gingerguide MCP server** at `https://gingerguide.app/mcp`. Its 11 tools find sights by interest, historical period or location, recommend sights and cities, and plan walking tours and multi-day itineraries, in six languages.
- Two **agent skills** (`SKILL.md` format) for audio tour lookup and one-day city walks.
- Ready-to-copy **client configs** and **curl examples**.

The server is read-only. It needs no API key and no sign-in. An optional free API key raises the daily limit (see [Optional free API key](#optional-free-api-key)).

| | |
|---|---|
| MCP endpoint | `https://gingerguide.app/mcp` |
| Transport | Streamable HTTP (stateless, JSON responses) |
| Auth | None required (optional free API key) |
| MCP Registry name | `app.gingerguide/catalog` |
| Developer docs | <https://gingerguide.app/developers/> |
| OpenAPI (REST) | <https://gingerguide.app/api/openapi.json> |
| llms.txt | <https://gingerguide.app/llms.txt> |

## Optional free API key

The server works without a key. Without a key, it allows 1,000 tool calls per IP address per UTC day. Hosted assistants such as Claude and ChatGPT call from a few shared IP addresses, so their requests get 50,000 per IP address per day. A free key raises the limit to 20,000 tool calls per key per day and shows your usage. It is useful when your agent runs on a shared cloud (Vercel, AWS, Cloudflare). Only `tools/call` counts. There is no sign-up and no email.

```bash
# Create a key (it is shown once; the server stores only its hash)
curl -sS -X POST https://gingerguide.app/api/keys \
  -H 'content-type: application/json' -d '{"label":"my-agent"}'

# Use it
curl -sS https://gingerguide.app/mcp \
  -H 'authorization: Bearer ggk_...' \
  -H 'content-type: application/json' -H 'accept: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Usage for the last 30 days, and revoke
curl -sS https://gingerguide.app/api/keys/me -H 'authorization: Bearer ggk_...'
curl -sS -X DELETE https://gingerguide.app/api/keys/me -H 'authorization: Bearer ggk_...'
```

You can also send the key as `X-API-Key`. An unknown or revoked key gets HTTP 401. Remove the header to continue without a key. Tool-call responses carry `RateLimit` and `X-RateLimit-Remaining` headers. Details: <https://gingerguide.app/developers/#api-key>.

## Tools

Every tool is read-only (`readOnlyHint: true`) and accepts `language`: `en`, `es`, `fr`, `de`, `tr` or `zh`.

### Find

| Tool | What it does | Main arguments |
|---|---|---|
| `search_attractions` | Searches sights in all cities or in one city, by free text, category, interest, historical period, indoor or outdoor, visit length, or distance from a point. Example: five Byzantine sights in Istanbul. | `query`, `city_id`, `country`, `categories`, `interests`, `periods`, `setting`, `near_lat`, `near_lng`, `radius_km`, `sort`, `limit` |
| `find_nearby_attractions` | Returns the sights closest to a latitude and longitude, with walking minutes. If no sight is in the radius, it returns the nearest covered city. | `lat`, `lng`, `radius_km`, `interests`, `categories`, `pace` |
| `get_attraction` | Returns one sight: long description, a notable fact, photo, coordinates, map link, visit time and the nearest other sights. | `attraction_id` (for example `rome-colosseum`) |
| `search_cities` | Finds cities by name (in any of the six languages), country or region. Returns the city id that the other tools need. | `query`, `country`, `limit` |
| `get_city_guide` | Returns one city: overview, headline sights, lesser-known sights, and every sight with category, coordinates and visit time. `detail: "full"` adds every long description. | `city_id`, `detail` |
| `list_countries` | Lists the covered countries with their city ids. | none |
| `get_catalog_overview` | Returns coverage totals, languages, and the exact values that the `categories`, `interests` and `periods` filters accept. | none |

### Recommend

| Tool | What it does | Main arguments |
|---|---|---|
| `recommend_attractions` | Picks sights in one city for the traveler's interests, favourite periods, headline sights or hidden gems, indoor or outdoor, and time available. Each pick says why it was chosen. | `city_id`, `interests`, `periods`, `style`, `setting`, `available_minutes`, `exclude_ids` |
| `recommend_destinations` | Ranks cities for interests or historical periods, for example "best cities for Byzantine history", and says why. | `interests`, `periods`, `country`, `trip_days` |

### Plan

| Tool | What it does | Main arguments |
|---|---|---|
| `plan_walking_tour` | Builds an ordered walking route in one city for a time budget. Returns each stop with walking minutes, time on site, clock times, and a Google Maps walking link. | `city_id`, `duration_minutes`, `interests`, `periods`, `style`, `pace`, `start_lat`, `start_lng` or `start_attraction_id`, `start_time`, `must_include` |
| `plan_trip_itinerary` | Plans 1 to 7 days in one city. Each day covers one or two walkable areas, with a public transport hop between them. | `city_id`, `days`, `hours_per_day`, `interests`, `periods`, `style`, `pace`, `start_time` |

**Filter values.** Interests: `history`, `architecture`, `art`, `museums`, `religious_sites`, `archaeology`, `nature`, `views`, `food`, `local_life`, `shopping`, `relaxing`, `royalty`, `military`, `music`, `literature`, `science`, `performing_arts`, `memorials`. Periods: `prehistoric`, `ancient_greek`, `etruscan`, `roman`, `byzantine`, `medieval`, `gothic`, `moorish_islamic`, `ottoman`, `renaissance`, `baroque`, `georgian_neoclassical`, `nineteenth_century`, `art_nouveau`, `twentieth_century_modern`, `world_war_ii`, `cold_war`. Style: `must_see`, `balanced`, `hidden_gems`. Pace: `relaxed`, `normal`, `brisk`.

**Limits of the data.** Interests, periods and indoor or outdoor are derived from each sight's category and description. Walking times are estimates (straight-line distance x 1.3 at the chosen pace). Opening hours, ticket prices and bookings are not included. Bad input returns an error that names the allowed values.

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

- "Find five Byzantine historical sights in Istanbul."
- "Plan a two-hour historical walking tour of Rome starting at 10:00."
- "I'm staying near St. Stephen's Cathedral in Vienna. What can I walk to in 10 minutes?"
- "Plan three days in Vienna for art and music lovers."
- "Which European cities are best for Byzantine history?"
- "Show me hidden gems in Paris for architecture lovers, indoors because it is raining."
- "Tell me about the Colosseum, in German."
- "Is there an audio walking tour for Seville?"

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

# Website API Endpoints

This document describes the public API endpoints available for website integration.

## Authentication

The website API uses API key authentication instead of JWT tokens. Include the API key in the request headers:

```
X-API-Key: your-api-key-here
```

The API key is configured via the `WEBSITE_API_KEY` environment variable or defaults to `default-website-api-key`.

## Endpoints

### POST /website/tender

Creates a new tender from website contact form submission.

**Headers:**
- `Content-Type: application/json`
- `X-API-Key: your-api-key-here`

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "phone": "string (optional)",
  "notes": "string (optional)"
}
```

**Response:**
```json
{
  "id": 123,
  "type": "website-inquiry",
  "shortName": "Weboldal érdeklődés - John Doe",
  "status": "inquiry",
  "fee": 0,
  "currency": "huf",
  "notes": "Weboldal érdeklődés - John Doe\nEmail: john@example.com\nTelefon: +36 1 234 5678\nMegjegyzés: Looking for construction services",
  "createdOn": "2024-01-15T10:30:00.000Z"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3800/website/tender \
  -H "Content-Type: application/json" \
  -H "X-API-Key: default-website-api-key" \
  -d '{
    "name": "Kovács János",
    "email": "kovacs.janos@example.com",
    "phone": "+36 1 234 5678",
    "notes": "Építési szolgáltatásokat keresünk az új irodaház projektünkhöz."
  }'
```

## Configuration

The API key can be configured in the following ways:

1. **Environment Variable:** Set `WEBSITE_API_KEY` in your environment
2. **Config File:** Add to `config/default.json` or environment-specific config files
3. **Default:** Falls back to `default-website-api-key` if not configured

## Error Handling

The API returns standard HTTP status codes:

- `200 OK` - Tender created successfully
- `401 Unauthorized` - Invalid or missing API key
- `400 Bad Request` - Invalid request data
- `500 Internal Server Error` - Server error

## Testing

Use the provided test script to verify the endpoint:

```bash
node test-website-endpoint.js
```

Make sure the API server is running on `http://localhost:3800` before running the test.

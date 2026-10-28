# Atlas settings and latency (27 Oct)

## Cluster and database
- Cluster: `Cluster0`
- Region: AWS Mumbai (`ap-south-1`); cluster version shown in the Atlas Metrics screenshot: MongoDB 8.0.34.
- Tier: not verified from the screenshot available in this workspace.
- Database: `proxispeak` · collections: `presences`, `rooms`, `users`.
- Database credentials stay in local `server/.env` and the deployment's secret settings; no URI or password is recorded here.
- Database-user role and Atlas Network Access CIDRs were not inspected. A successful local connection confirms this laptop could connect during the test, but does not prove that `0.0.0.0/0` is configured. Review the allowlist with the team lead before deployment; avoid a broad public allowlist unless the team accepts that development-only risk.

## Local PC → Atlas latency
Measured on 28 Oct with `npm run bench` (50 temporary presence documents; the script removed all 50 afterward). Timings are round trips including network latency.

| Query | Average | p95 | Max |
|---|---:|---:|---:|
| `$near` | 28.25 ms | 70.89 ms | 140.38 ms |
| `$geoWithin` | 19.49 ms | 47.18 ms | 236.86 ms |

- Server-side `$near` `executionTimeMillis`: 0 ms (integer resolution in explain output).
- Winning plan: `GEO_NEAR_2D → FETCH → IXSCAN`; index: `position_2d_roomId_1`.
- This measures the developer PC to Atlas, not a deployed Render server.

## Deployment check
- Render URL and Render logs were not available in the workspace, so the deployed `/health` response and Render-to-Atlas latency remain unverified. Ask the team lead for the service URL/log confirmation before filling those in.

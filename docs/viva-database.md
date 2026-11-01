# Database viva preparation notes

Use these as prompts and explain them in your own words.

## Why use a `2d` index instead of `2dsphere`?

The office map uses flat pixel coordinates `[x, y]`, not latitude and longitude on Earth. MongoDB's `2d` index is designed for this flat coordinate space. The presence model defines a `2d` index on `position` with bounds from 0 to 1100, alongside `roomId`.

## How do `$near` and `$geoWithin` differ?

`$near` returns matching points in distance order, which is useful when asking for the closest peers. This project queries other presences in the same room, excludes the current socket, applies a maximum distance, and limits the results. `$geoWithin` checks whether points fall inside a specified shape and does not sort them by distance.

## Why are presence writes batched?

Movement can arrive frequently. The service keeps only the newest position per socket in a queue and flushes queued records with `bulkWrite` about every 300 ms. This reduces database writes while keeping positions reasonably fresh. If a flush fails, the queued latest positions are restored for a later attempt.

## What is the TTL index used for?

The `updatedAt` field has a TTL index set to 120 seconds. MongoDB uses it to remove stale presence records, such as records left after a process or network failure. TTL cleanup is asynchronous, so deletion may happen after the expiry time rather than exactly at 120 seconds. Connected users are refreshed by a heartbeat every 30 seconds; normal socket disconnects also trigger explicit removal.

## What is the difference between round-trip time and MongoDB execution time?

Round-trip time includes the application, network, and database response path. MongoDB's `executionTimeMillis` measures the database's execution portion for an operation. They describe different parts of latency and should not be compared as if they were the same measurement.

## Why use MongoDB Atlas?

Atlas provides a managed MongoDB deployment that the server can reach over the network. It avoids requiring each developer to run and maintain a local MongoDB server. The application reads the connection string from `MONGO_URI` in the server environment.

## What is a collection and what is a document?

A collection groups related records, similar to a table in a relational database. A document is one JSON-like record in that collection. This project's main collections are `users`, `rooms`, and `presences`; presence records are temporary, while room layout data is stored for persistence.

## How are rooms associated with presences?

Presence records contain a `roomId` value used to scope proximity searches to one room. This is a logical association in application code; MongoDB does not enforce it as a foreign-key relationship. The presence query filters by `roomId` before looking for nearby positions.

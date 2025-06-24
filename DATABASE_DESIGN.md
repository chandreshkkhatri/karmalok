# Database Design Document

This document outlines the logical and physical design of the database for the RestackApp chat application.

## Overview

- **Database Engine**: MongoDB (via Mongoose ODM)
- **Collections**:
  1. `users`
  2. `chats`
  3. `messages`

Relationships:

- A **User** can participate in many **Chats** (as a human or a bot).
- A **Chat** contains many **Messages**.
- A **Message** may have a `parentMsgId`, forming threaded replies.

---

## 1. `users` Collection

| Field         | Type     | Required | Default | Description                   |
| ------------- | -------- | -------- | ------- | ----------------------------- |
| `_id`         | ObjectId | ✔️       |         | Primary key                   |
| `email`       | String   | ✔️       |         | Unique user email             |
| `displayName` | String   | ✔️       |         | User's display name           |
| `avatarUrl`   | String   | ❌       |         | URL to user avatar            |
| `isBot`       | Boolean  | ✔️       | `false` | Flag to mark bots (AI agents) |
| `createdAt`   | Date     | ✔️       | `now`   | Document creation timestamp   |
| `updatedAt`   | Date     | ✔️       | `now`   | Last update timestamp         |

**Indexes**:

- `{ email: 1 }` (unique)
- `{ displayName: 1 }`

---

## 2. `chats` Collection

| Field       | Type     | Required | Default | Description                            |
| ----------- | -------- | -------- | ------- | -------------------------------------- |
| `_id`       | ObjectId | ✔️       |         | Primary key                            |
| `userId`    | ObjectId | ✔️       |         | Refers to `users._id` (chat initiator) |
| `aiId`      | ObjectId | ✔️       |         | Refers to `users._id` (AI assistant)   |
| `title`     | String   | ❌       |         | Optional chat title                    |
| `lastMsgAt` | Date     | ✔️       | `now`   | Timestamp of the most recent message   |
| `createdAt` | Date     | ✔️       | `now`   | Document creation timestamp            |
| `updatedAt` | Date     | ✔️       | `now`   | Last update timestamp                  |

**Indexes**:

- `{ userId: 1, lastMsgAt: -1 }`
- `{ lastMsgAt: -1 }`

---

## 3. `messages` Collection

| Field         | Type               | Required | Default | Description                          |
| ------------- | ------------------ | -------- | ------- | ------------------------------------ |
| `_id`         | ObjectId           | ✔️       |         | Primary key                          |
| `chatId`      | ObjectId           | ✔️       |         | Refers to `chats._id`                |
| `senderId`    | ObjectId           | ✔️       |         | Refers to `users._id`                |
| `parentMsgId` | ObjectId or `null` | ❌       | `null`  | Refers to parent message for threads |
| `body`        | String             | ✔️       |         | Text content of the message          |
| `files`       | Array of Subdocs   | ❌       | `[]`    | Attachments: `{ name, url, mime }`   |
| `reactions`   | Array of Subdocs   | ❌       | `[]`    | Reactions: `{ userId, emoji }`       |
| `createdAt`   | Date               | ✔️       | `now`   | Creation timestamp                   |
| `editedAt`    | Date               | ❌       |         | Timestamp of last edit (if any)      |

**Indexes**:

- `{ chatId: 1, createdAt: 1 }`
- `{ parentMsgId: 1, createdAt: 1 }`

---

## Entity-Relationship Diagram (Simplified)

```
[User] 1───∞ [Chat] ∞───∞ [Message]
               │
               └───∞ [Message] (threads via parentMsgId)
```

- **User↔Chat**: One user (human) to many chats; each chat also references an AI user.
- **Chat↔Message**: One chat to many messages.
- **Message↔Message**: Parent-child self-relationship for threads.

---

## Sample Documents

### `users`

```json
{
  "_id": ObjectId("..."),
  "email": "alice@example.com",
  "displayName": "Alice",
  "isBot": false,
  "createdAt": ISODate("2025-06-24T12:00:00Z"),
  "updatedAt": ISODate("2025-06-24T12:00:00Z")
}
```

### `chats`

```json
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),
  "aiId": ObjectId("..."),
  "title": "Project Brainstorm",
  "lastMsgAt": ISODate("2025-06-24T12:05:00Z"),
  "createdAt": ISODate("2025-06-24T12:00:00Z"),
  "updatedAt": ISODate("2025-06-24T12:05:00Z")
}
```

### `messages`

```json
{
  "_id": ObjectId("..."),
  "chatId": ObjectId("..."),
  "senderId": ObjectId("..."),
  "parentMsgId": null,
  "body": "Hello AI! Let's start.",
  "files": [],
  "reactions": [],
  "createdAt": ISODate("2025-06-24T12:01:00Z")
}
```

---

## Query Patterns

- **Fetch user chats**: `db.chats.find({ userId }).sort({ lastMsgAt: -1 })`
- **Fetch messages in a chat**: `db.messages.find({ chatId, parentMsgId: null }).sort({ createdAt: 1 })`
- **Fetch thread replies**: `db.messages.find({ parentMsgId }).sort({ createdAt: 1 })`

---

## Considerations & Future Enhancements

- **Scale**: Sharding on `chatId` for high-volume message traffic.
- **Analytics**: Add counters or materialized views for reaction counts.
- **Search**: Full-text index on `body` for keyword search.

---

_Document generated on 2025-06-24_

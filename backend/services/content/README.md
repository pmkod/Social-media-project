# content

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run dev
```

This project was created using `bun init` in bun v1.2.22. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Chillz

Chillz use the existing Post, Comment, PostLike and Bookmark models with `Post.type = CHILLZ`.
Existing posts keep `POST`. Search (`GET /posts`) and profile lists (`GET /posts/users/:userId`)
accept `type=POST|CHILLZ`, defaulting to `POST`. The following feed, likes and bookmarks may contain both types.

`GET /feed/following?type=CHILLZ` returns only Chillz from the current user and
followed accounts, excluding blocked accounts and using the existing cursor pagination.
Omitting `type` keeps the mixed following feed. The web hook `useFollowingChillzFeed`
provides this filtered feed with a separate cache and an optional `enabled` flag.

## Stories

Stories are single image or video uploads visible to the author and followed users
for 24 hours. The content service exposes `POST /stories` (multipart field `media`),
`GET /stories` (active stories grouped by author) and `POST /stories/:storyId/view`.
The gateway exposes the same paths publicly; authentication is required for all
three endpoints.

Before starting the updated service, apply the migrations and generate the client:

```bash
bunx prisma migrate deploy
bunx prisma generate
```

The Chillz migration renames the former `SPARK` enum value to `CHILLZ` in place,
preserving existing posts, media, comments, likes and bookmarks.
The web page is now `/chillz`; old `/sparks` links redirect there with their search query.

The server needs `ffprobe` (from FFmpeg) on its PATH to inspect Chillz uploads.
A Chillz contains exactly one MP4, WebM or Ogg video, up to 20 MB and 90 seconds.
Its caption is optional (5,000 characters maximum). Files are uploaded before the
post and media records are created together; failed uploads are cleaned up.

Run the regression suite with `bun test`. Tests also need `ffmpeg` on PATH to
create temporary video fixtures. They mock database/storage calls and do not change app data.

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

## Sparks

Sparks use the existing Post, Comment, PostLike and Bookmark models with `Post.type = SPARK`.
Existing posts keep `POST`. Search (`GET /posts`) and profile lists (`GET /posts/users/:userId`)
accept `type=POST|SPARK`, defaulting to `POST`. The following feed, likes and bookmarks may contain both types.

Before starting the updated service, apply the additive migration and generate the client:

```bash
bunx prisma migrate deploy
bunx prisma generate
```

The server needs `ffprobe` (from FFmpeg) on its PATH to inspect Spark uploads.
A Spark contains exactly one MP4, WebM or Ogg video, up to 20 MB and 90 seconds.
Its caption is optional (5,000 characters maximum). Files are uploaded before the
post and media records are created together; failed uploads are cleaned up.

Run the regression suite with `bun test`. Tests also need `ffmpeg` on PATH to
create temporary video fixtures. They mock database/storage calls and do not change app data.

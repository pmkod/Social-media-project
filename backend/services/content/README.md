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

Before starting the service, apply the migrations and generate the client:

```bash
bunx prisma migrate deploy
bunx prisma generate
```

The latest migration removes the retired publication-type column. Existing media,
comments, likes and bookmarks are preserved, and existing content is treated as
standard posts.

Run the regression suite with `bun test`. Tests mock database/storage calls and do
not change app data.

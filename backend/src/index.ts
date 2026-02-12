import { Hono } from "hono";

const app = new Hono();

const port = 8000;

app.get("/", (c) => c.text("Hono!"));

export default {
	port,
	fetch: app.fetch,
};

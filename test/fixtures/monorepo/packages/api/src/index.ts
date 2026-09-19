// Copyright (c) 2026 Ground Zero LLC. All rights reserved.

import express from "express";
const app = express();
app.get("/", (_, res) => res.send("ok"));
export default app;

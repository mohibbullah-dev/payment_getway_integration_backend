import express from "express";
import cors from "cors";
import { DB_CONNECT } from "./db.js";

const app = express();

app.use(express.json());
app.use(cors());

DB_CONNECT();

app.post("/", (req, res) => {
  try {
    return res.status(200).json({ message: "this is a test route" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log("server is running at 5000");
});

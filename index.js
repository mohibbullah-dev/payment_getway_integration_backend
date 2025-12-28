import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.post("/", (req, res) => {
  try {
    return res.status(200).json({ message: "this is a test route" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(5000, () => {
  console.log("server is running at 5000");
});

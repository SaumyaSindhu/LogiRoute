import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import axios from "axios";


const app = express();
app.use(cors());
app.use(express.json());

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL;

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/routes/optimize", async (req, res) => {
  try {
    const response = await axios.post(
      `${PYTHON_SERVICE_URL}/optimize`,
      req.body,
    );
    res.status(200).json(response.data);
  } catch (error) {
    if (error.response) {
      // Python service responded, but with an error status (400, 422, 502...)
      res.status(error.response.status).json(error.response.data);
    } else {
      // Python service unreachable entirely (not running, network issue)
      res.status(502).json({ detail: "Optimization service unavailable" });
    }
  }
});

export default app;

import app from "./src/app.js";

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});

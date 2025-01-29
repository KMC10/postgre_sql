import express from "express";
import bodyParser from "body-parser";
import open from "open";
import pg from "pg";

const app = express();
const port = 3000;

// Database Connection
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "kunjani10...",
  port: 5432,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
  } else {
    console.log("Connected to the database successfully.");
  }
});

let quiz = [];

// Fetch Quiz Data
async function loadQuizData() {
  try {
    const res = await db.query("SELECT * FROM flags");
    if (res.rows.length > 0) {
      quiz = res.rows;
      console.log("Quiz data loaded successfully.");
    } else {
      console.warn("No data found in the 'flags' table.");
    }
  } catch (err) {
    console.error("Error fetching data from the database:", err.stack);
  }
}

// Load Quiz Data at Startup
loadQuizData();

let totalCorrect = 0;
let currentQuestion = {};

// Middleware
app.set("view engine", "ejs"); // Set EJS as the view engine
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// GET home page
app.get("/", (req, res) => {
  totalCorrect = 0;
  nextQuestion();
  res.render("index.ejs", { question: currentQuestion });
});

// POST submit answer
app.post("/submit", (req, res) => {
  const answer = req.body.answer.trim();
  let isCorrect = false;

  if (
    currentQuestion.capital &&
    currentQuestion.capital.toLowerCase() === answer.toLowerCase()
  ) {
    totalCorrect++;
    isCorrect = true;
  }

  nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

// Get the next question
function nextQuestion() {
  if (quiz.length === 0) {
    console.error("Quiz data is empty. Ensure the database has valid data.");
    currentQuestion = { capital: "", flag: "No flag available" }; // Default fallback
  } else {
    const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
    currentQuestion = randomCountry;
  }
}

// Start Server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  open(`http://localhost:${port}`);
});

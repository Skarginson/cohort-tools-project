const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const PORT = 5005;
const path = require("path");
const cohorts = require("./cohorts.json");
const students = require("./students.json");
const cors = require("cors");
const mongoose = require("mongoose");
const Student = require("./models/Student.model");
const Cohort = require("./models/Cohort.model");
const serverErrorMsg = "Server Problem, totally not your fault User";
//test1234

// STATIC DATA
// Devs Team - Import the provided files with JSON data of students and cohorts here:
// ...

// INITIALIZE EXPRESS APP - https://expressjs.com/en/4x/api.html#express
const app = express();

// MIDDLEWARE
// Research Team - Set up CORS middleware here:
// ...
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

mongoose
  .connect("mongodb://127.0.0.1:27017/cohort-tools-api")
  .then((x) => console.log(`Connected to Database: "${x.connections[0].name}"`))
  .catch((err) => console.error("Error connecting to MongoDB", err));

// ROUTES - https://expressjs.com/en/starter/basic-routing.html
// Devs Team - Start working on the routes here:
// ...

app.get("/docs", (_, res) => {
  res.sendFile(path.join(__dirname, "views", "docs.html"));
});

app.get("/api/cohorts", (_, res) => {});

app.get("/api/students", (_, res) => {});

app.get("/api/students/cohort/:cohortId", async (req, res) => {
  const { cohortId } = req.params;

  const notFoundMsg = { message: `No such cohort with id: ${cohortId}` };
  if (!mongoose.isValidObjectId(cohortId)) {
    res.status(404).json(notFoundMsg);
    return;
  }

  try {
    const cohortStudents = await Student.find({ cohort: cohortId });
    res.json(cohortStudents);
  } catch (error) {
    console.log(error);
    res.status(500).json(serverErrorMsg);
  }
});

app.post("/api/students", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    linkedinUrl,
    languagues,
    program,
    background,
    image,
    cohort,
    projects,
  } = req.body;
  const newStudent = {
    firstName,
    lastName,
    email,
    phone,
    linkedinUrl,
    languagues,
    program,
    background,
    image,
    cohort,
    projects,
  };

  try {
    const createdStudent = await Student.create(newStudent);
    res.status(201).json(createdStudent);
  } catch (error) {
    if (error.message.includes("validation")) {
      res.status(400).json({ message: "Invalid input" });
    } else {
      res.status(500).json(serverErrorMsg);
    }
  }
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

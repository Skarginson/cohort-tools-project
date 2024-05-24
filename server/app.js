const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const PORT = 5005;
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const Student = require("./models/Student.model");
const Cohort = require("./models/Cohort.model");
const User = require("./models/User.model");
const authRoutes = require("./routes/auth.routes");
const { catchAll, errorHandler } = require("./error-handling/errorHandler");
const {
  secretKey,
  isAuthenticated,
} = require("./middlewares/authentication.middleware");
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
app.use("/auth", authRoutes);

app.get("/api/users/:userId", isAuthenticated, async (req, res) => {
  const { userId } = req.params;

  const user = await User.findOne({ _id: userId });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

app.get("/docs", (_, res) => {
  res.sendFile(path.join(__dirname, "views", "docs.html"));
});

app.get("/api/cohorts", async (_, res) => {
  try {
    const allCohorts = await Cohort.find();
    res.json(allCohorts);
  } catch (error) {
    next(error);
  }
});

app.post("/api/cohorts", async (req, res, next) => {
  const {
    inProgress,
    cohortSlug,
    cohortName,
    program,
    campus,
    startDate,
    endDate,
    programManager,
    leadTeacher,
    totalHours,
  } = req.body;
  const newCohort = {
    inProgress,
    cohortSlug,
    cohortName,
    program,
    campus,
    startDate,
    endDate,
    programManager,
    leadTeacher,
    totalHours,
  };

  try {
    const createdCohort = await Cohort.create(newCohort);
    res.status(201).json(createdCohort);
  } catch (error) {
    next(error);
  }
});

app.get("/api/cohorts/:cohortId", async (req, res, next) => {
  const { cohortId } = req.params;

  const notFoundMsg = { message: `No such cohort with id: ${cohortId}` };
  if (!mongoose.isValidObjectId(cohortId)) {
    res.status(404).json(notFoundMsg);
    return;
  }

  try {
    const mycohort = await Cohort.findById(cohortId);
    if (!mycohort) {
      res.status(404).json(notFoundMsg);
      return;
    }
    res.json(mycohort);
  } catch (error) {
    next(error);
  }
});

app.put("/api/cohorts/:cohortId", async (req, res, next) => {
  const { cohortId } = req.params;
  const {
    inProgress,
    cohortSlug,
    cohortName,
    program,
    campus,
    startDate,
    endDate,
    programManager,
    leadTeacher,
    totalHours,
  } = req.body;
  const notFoundMsg = { message: `No such cohort with id: ${cohortId}` };

  if (!mongoose.isValidObjectId(cohortId)) {
    res.status(404).json(notFoundMsg);
    return;
  }

  try {
    const updatedCohort = await Cohort.findByIdAndUpdate(
      cohortId,
      {
        inProgress,
        cohortSlug,
        cohortName,
        program,
        campus,
        startDate,
        endDate,
        programManager,
        leadTeacher,
        totalHours,
      },
      { new: true }
    );

    res.json(updatedCohort);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/cohorts/:cohortId", async (req, res, next) => {
  const { cohortId } = req.params;

  if (!mongoose.isValidObjectId(cohortId)) {
    res.status(404).json({ message: `No such cohort with id: ${cohortId}` });
    return;
  }

  try {
    await Cohort.findByIdAndDelete(cohortId);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

app.get("/api/students", async (_, res, next) => {
  try {
    const allStudents = await Student.find().populate("cohort");
    // const allStudents = await Student.find();
    res.json(allStudents);
  } catch (error) {
    next(error);
  }
});

app.get("/api/students/cohort/:cohortId", async (req, res, next) => {
  const { cohortId } = req.params;

  const notFoundMsg = { message: `No such cohort with id: ${cohortId}` };
  if (!mongoose.isValidObjectId(cohortId)) {
    res.status(404).json(notFoundMsg);
    return;
  }

  try {
    const cohortStudents = await Student.find({ cohort: cohortId }).populate(
      "cohort"
    );
    res.json(cohortStudents);
  } catch (error) {
    next(error);
  }
});

app.get("/api/students/:studentId", async (req, res, next) => {
  const { studentId } = req.params;

  const notFoundMsg = { message: `No such student with id: ${studentId}` };
  if (!mongoose.isValidObjectId(studentId)) {
    res.status(404).json(notFoundMsg);
    return;
  }

  try {
    const student = await Student.findById(studentId).populate("cohort");
    if (!student) {
      res.status(404).json(notFoundMsg);
      return;
    }
    res.json(student);
  } catch (error) {
    next(error);
  }
});

app.post("/api/students", async (req, res, next) => {
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
    next(error);
  }
});

app.put("/api/students/:studentId", async (req, res, next) => {
  const { studentId } = req.params;
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
  const notFoundMsg = { message: `No such student with id: ${studentId}` };

  if (!mongoose.isValidObjectId(studentId)) {
    res.status(404).json(notFoundMsg);
    return;
  }

  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
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
      },
      { new: true }
    );

    res.json(updatedStudent);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/students/:studentId", async (req, res, next) => {
  const { studentId } = req.params;

  if (!mongoose.isValidObjectId(studentId)) {
    res.status(404).json({ message: `No such student with id: ${studentId}` });
    return;
  }

  try {
    await Student.findByIdAndDelete(studentId);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

app.use(catchAll);
app.use(errorHandler);
// START SERVER
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

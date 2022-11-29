const express = require("express");
const mongodb = require("mongodb");
const mongoclient = mongodb.MongoClient;
const dotenv = require("dotenv").config();
const app = express();
const URL =process.env.DB ;//"mongodb://localhost:27017"

app.use(express.json());

//Write API to Create-mentor
app.post("/create-mentor", async (req, res) => {
  try {
    // connect th DB
    const connection = await mongoclient.connect(URL);

    // select the db
    const db = connection.db("STU_ASSIGN");

    // select collection
    // Do CRUD
    const mentor = await db.collection("teachers").insertOne(req.body);

    // close connection
    await connection.close();
    res.json({ message: "Mentor Added", id: mentor.insertedId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

//Write API to Assign a student to Mentor
app.put("/mentor/assign-students/:mentorId", async (req, res) => {
  try {
    // connect th DB
    const connection = await mongoclient.connect(URL);

    // select the db
    const db = connection.db("STU_ASSIGN");

    const mentorData = await db
      .collection("teachers")
      .findOne({ _id: mongodb.ObjectId(req.params.mentorId) });

    if (mentorData) {
      // select collection
      // Do CRUD
      const mentors = await db
        .collection("teachers")
        .updateOne(
          { _id: mongodb.ObjectId(req.params.mentorId) },
          { $push: req.body }
        );
      console.log(mentors);

      // close connection
      await connection.close();
      res.json({ message: "Student Assigned Successfully" });
    } else {
      res.status(404).json({ message: "Mentor not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Write API to show all students for a particular Mentor
app.get("/mentor-students/:mentorId", async (req, res) => {
  try {
    // connect th DB
    const connection = await mongoclient.connect(URL);

    // select the db
    const db = connection.db("STU_ASSIGN");

    const mentorData = await db
      .collection("teachers")
      .findOne({ _id: mongodb.ObjectId(req.params.mentorId) });

    if (mentorData) {
      // select collection
      // Do CRUD
      const mentors = await db
        .collection("teachers")
        .aggregate([
          {
            $match: {
              _id: mongodb.ObjectId(req.params.mentorId),
            },
          },
          {
            $unwind: "$students",
          },
          {
            $addFields: {
              student_id: {
                $toObjectId: "$students",
              },
            },
          },
          {
            $lookup: {
              from: "students",
              localField: "student_id",
              foreignField: "_id",
              as: "result",
            },
          },
          {
            $unwind: "$result",
          },
          {
            $group: {
              _id: "$_id",
              students_assign: {
                $push: "$result",
              },
            },
          },
          {
            $lookup: {
              from: "teachers",
              localField: "_id",
              foreignField: "_id",
              as: "result",
            },
          },
          {
            $unwind: "$result",
          },
          {
            $project: {
              _id: "$_id",
              mentorName: "$result.name",
              mentorEmail: "$result.email",
              students_assigned: "$students_assign",
            },
          },
        ])
        .toArray();

      // close connection
      await connection.close();
      res.json(mentors);
    } else {
      res.status(404).json({ message: "Mentor not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

//API to Read all mentors
app.get("/mentors", async (req, res) => {
  try {
    // connect th DB
    const connection = await mongoclient.connect(URL);

    // select the db
    const db = connection.db("STU_ASSIGN");

    // select collection
    // Do CRUD
    const mentors = await db.collection("teachers").find({}).toArray();

    // close connection
    await connection.close();
    res.json(mentors);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

//Write API to Create-student
app.post("/create-student", async (req, res) => {
  try {
    // connect th DB
    const connection = await mongoclient.connect(URL);

    // select the db
    const db = connection.db("STU_ASSIGN");

    // select collection
    // Do CRUD
    const student = await db.collection("students").insertOne(req.body);

    // close connection
    await connection.close();
    res.json({ message: "student Added", id: student.insertedId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Write API to Assign/Change Mentor for particular student
app.put("/student/assign-mentor/:studentId", async (req, res) => {
  try {
    // connect th DB
    const connection = await mongoclient.connect(URL);

    // select the db
    const db = connection.db("STU_ASSIGN");

    const studentData = await db
      .collection("students")
      .findOne({ _id: mongodb.ObjectId(req.params.studentId) });

    if (studentData) {
      // select collection
      // Do CRUD
      const student = await db
        .collection("students")
        .updateOne(
          { _id: mongodb.ObjectId(req.params.studentId) },
          { $set: req.body }
        );
      console.log(student);

      // close connection
      await connection.close();
      res.json({ message: "Mentor Assigned Successfully" });
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

//API to Read all students
app.get("/students", async (req, res) => {
  try {
    // connect th DB
    const connection = await mongoclient.connect(URL);

    // select the db
    const db = connection.db("STU_ASSIGN");

    // select collection
    // Do CRUD
    const students = await db.collection("students").find({}).toArray();

    // close connection
    await connection.close();
    res.json(students);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.listen(process.env.PORT || 3001);

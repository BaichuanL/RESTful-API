const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Student = require("./models/student");
const methodOverride = require("method-override");

mongoose
  .connect("mongodb://localhost:27017/exampleDB")
  .then(() => {
    console.log("成功連結mongoDB....");
  })
  .catch((e) => {
    console.log(e);
  });

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.get("/students", async (req, res) => {
  try {
    let studentData = await Student.find({}).exec();
    // return res.send(studentData);
    return res.render("students", { studentData });
  } catch (e) {
    return res.status(500).send("尋找資料時發生錯誤。。。");
  }
});

app.get("/students/new", (req, res) => {
  return res.render("new-student-form");
});

app.get("/students/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let foundStudent = await Student.findOne({ _id }).exec();
    if (foundStudent != null) {
      return res.render("student-page", { foundStudent });
    } else {
      return res.status(400).render("student-not-found");
    }
  } catch (e) {
    return res.status(400).render("student-not-found");
  }
});

app.get("/students/:_id/edit", async (req, res) => {
  let { _id } = req.params;
  try {
    let foundStudent = await Student.findOne({ _id }).exec();
    if (foundStudent != null) {
      return res.render("edit-student", { foundStudent });
    } else {
      return res.status(400).render("student-not-found");
    }
  } catch (e) {
    return res.status(400).render("student-not-found");
  }
});

app.post("/students", async (req, res) => {
  try {
    let { name, age, merit, other } = req.body;
    let newStudent = new Student({
      name,
      age,
      scholarship: {
        merit,
        other,
      },
    });
    let savedStudent = await newStudent.save();
    return res.render("student-save-success", { savedStudent });
  } catch (e) {
    return res.status(400).render("student-save-fail.ejs");
  }
});

app.put("/students/:_id", async (req, res) => {
  try {
    let { _id } = req.params;
    let { name, age, major, merit, other } = req.body;
    let newData = await Student.findOneAndUpdate(
      { _id },
      { name, age, major, scholarship: { merit, other } },
      {
        new: true,
        runValidators: true,
        overwrite: true,
        // 因為HTTP put request要求客戶端提供所有數據，所以
        // 我們需要根據客戶端提供的數據，來更新資料庫內的資料
      }
    );
    return res.render("student-update-success", { newData });
  } catch (e) {
    return res.status(400).send(e.message);
  }
});

class NewData {
  constructor() {}
  setProperty(key, value) {
    if (key !== "merit" && key !== "other") {
      this[key] = value;
    } else {
      this[`scholarship.${key}`] = value;
    }
  }
}

app.patch("/students/:_id", async (req, res) => {
  try {
    let { _id } = req.params;
    let newObject = new NewData();
    for (let property in req.body) {
      newObject.setProperty(property, req.body[property]);
    }

    let newData = await Student.findByIdAndUpdate({ _id }, newObject, {
      new: true,
      runValidators: true,
      // 不能寫overwrite: true
    });
    res.send({ msg: "成功更新學生資料!", updatedData: newData });
  } catch (e) {
    return res.status(400).send(e.message);
  }
});

app.delete("/students/:_id", async (req, res) => {
  try {
    let { _id } = req.params;
    let deleteResult = await Student.deleteOne({ _id });
    return res.send(deleteResult);
  } catch (e) {
    console.log(e);
    return res.status(500).send("無法刪除學生資料");
  }
});

app.listen(3000, () => {
  console.log("伺服器正在聆聽port 3000");
});

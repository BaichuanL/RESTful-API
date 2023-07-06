const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { Schema } = mongoose;
const fs = require("fs");

app.set("view engine", "ejs");

mongoose
  .connect("mongodb://localhost:27017/exampleDB")
  .then(() => {
    console.log("成功連結mongoDB....");
  })
  .catch((e) => {
    console.log(e);
  });

const studentSchema = new Schema({
  name: { type: String, required: true, maxlength: 25 },
  age: { type: Number, min: [0, "年齡不能小於0"] },
  major: {
    type: String,
    required: function () {
      return this.scholarship.merit >= 3000;
    },
    enum: [
      "Chemistry",
      "Computer Science",
      "Mathematics",
      "Civil Engineering",
      "undecided",
    ],
  },
  scholarship: {
    merit: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
  },
});

// studentSchema.statics.findAllMajorStudents = function (major) {
//   return this.find({ major: major }).exec();
// };

studentSchema.static("findAllMajorStudents", function (major) {
  return this.find({ major: major }).exec();
});

studentSchema.methods.printTotalScholarship = function () {
  return this.scholarship.merit + this.scholarship.other;
};

studentSchema.pre("save", () => {
  fs.writeFile("record.txt", "A new data will be saved...", (e) => {
    if (e) throw e;
  });
});

const Student = mongoose.model("Student", studentSchema); //  students

let newStudent = new Student({
  name: "小明",
  age: 30,
  major: "Computer Science",
  scholarship: {
    merit: 5000,
    other: 1000,
  },
});

newStudent
  .save()
  .then((data) => {
    console.log("資料已經儲存");
  })
  .catch((e) => {
    console.log(e);
  });

app.listen(3000, () => {
  console.log("伺服器正在聆聽port 3000....");
});

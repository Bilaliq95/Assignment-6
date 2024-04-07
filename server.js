/*********************************************************************************
 * WEB700 – Assignment 06
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part of this
 * assignment has been copied manually or electronically from any other source (including web sites) or
 * distributed to other students.
 *
 * Name: Muhammad Bilal Iqbal Student ID: 114732225 Date: 6th April 2024
 *
 * Online (Cyclic) Link: N/A
 *
 ********************************************************************************/

const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const data = require("./modules/collegeData.js");

const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.engine(
  ".hbs",
  exphbs.engine({
    defaultLayout: "main",
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute
            ? ' class="nav-item active" '
            : ' class="nav-item" ') +
          '><a class="nav-link" href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
    },
  })
);

app.set("view engine", ".hbs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = route == "/" ? "/" : route.replace(/\/$/, "");
  next();
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/htmlDemo", (req, res) => {
  res.render("htmlDemo");
});

//Get All Students
app.get("/students", (req, res) => {
  if (req.query.course) {
    data
      .getStudentsByCourse(req.query.course)
      .then((students) => {
        // Check if students array is empty
        if (students.length > 0) {
          // Render the "students" view with the retrieved students
          res.render("students", { students: students });
        } else {
          // Render the "students" view with an error message if no results
          res.render("students", { message: "No results" });
        }
      })
      .catch((err) => {
        // Render the "students" view with an error message if promise is rejected
        res.render("students", { message: "Error retrieving students" });
      });
  } else {
    data
      .getAllStudents()
      .then((students) => {
        // Check if students array is empty
        if (students.length > 0) {
          // Render the "students" view with the retrieved students
          res.render("students", { students: students });
        } else {
          // Render the "students" view with an error message if no results
          res.render("students", { message: "No results" });
        }
      })
      .catch((err) => {
        // Render the "students" view with an error message if promise is rejected
        res.render("students", { message: "Error retrieving students" });
      });
  }
});

app.get("/students/add", (req, res) => {
  data
    .getCourses()
    .then((courses) => {
      res.render("addStudent", { courses: courses });
    })
    .catch((err) => {
      console.error("Error retrieving courses:", err);
      res.render("addStudent", { courses: [] });
    });
});

app.post("/students/add", (req, res) => {
  data.addStudent(req.body).then(() => {
    res.redirect("/students");
  });
});

app.get("/student/:studentNum", (req, res) => {
  // initialize an empty object to store the values
  let viewData = {};
  data
    .getStudentByNum(req.params.studentNum)
    .then((data) => {
      if (data) {
        viewData.student = data; //store student data in the "viewData" object as "student"
      } else {
        viewData.student = null; // set student to null if none were returned
      }
    })
    .catch(() => {
      viewData.student = null; // set student to null if there was an error
    })
    .then(data.getCourses)
    .then((data) => {
      viewData.courses = data; // store course data in the "viewData" object as "courses"
      // loop through viewData.courses and once we have found the courseId that matches
      // the student's "course" value, add a "selected" property to the matching
      // viewData.courses object
      for (let i = 0; i < viewData.courses.length; i++) {
        if (viewData.courses[i].courseId == viewData.student.course) {
          viewData.courses[i].selected = true;
        }
      }
    })
    .catch(() => {
      viewData.courses = []; // set courses to empty if there was an error
    })
    .then(() => {
      if (viewData.student == null) {
        // if no student - return an error
        res.status(404).send("Student Not Found");
      } else {
        res.render("student", { viewData: viewData }); // render the "student" view
      }
    });
});

app.post("/student/update", (req, res) => {
  data.updateStudent(req.body).then(() => {
    res.redirect("/students");
  });
});

app.get("/courses/add", (req, res) => {
  res.render("addCourse");
});

// Route to delete a student by student number
app.post("/student/delete/:studentNum", (req, res) => {
  data
    .deleteStudentByNum(req.params.studentNum)
    .then(() => {
      res.redirect("/students");
    })
    .catch((err) => {
      res.status(500).send("Unable to Remove Student / Student not found");
    });
});

app.post("/courses/add", (req, res) => {
  data
    .addCourse(req.body)
    .then(() => {
      res.redirect("/courses"); // Redirect to /courses after adding the course
    })
    .catch((err) => {
      console.error("Error adding course:", err);
      res.status(500).send("Error adding course"); // Handle error if course addition fails
    });
});

app.post("/course/update", (req, res) => {
  data
    .updateCourse(req.body)
    .then(() => {
      res.redirect("/courses"); // Redirect to /courses after updating the course
    })
    .catch((err) => {
      console.error("Error updating course:", err);
      res.status(500).send("Error updating course"); // Handle error if course update fails
    });
});

app.get("/courses", (req, res) => {
  data
    .getCourses()
    .then((courses) => {
      if (courses.length > 0) {
        // Render the "courses" view with the retrieved courses
        res.render("courses", { courses: courses });
      } else {
        // Render the "courses" view with a message indicating no courses available
        res.render("courses", { message: "No courses available" });
      }
    })
    .catch((err) => {
      // Render the "courses" view with an error message if promise is rejected
      res.render("courses", { message: "Error retrieving courses" });
    });
});

app.get("/course/:id", (req, res) => {
  data
    .getCourseById(req.params.id)
    .then((course) => {
      if (!course) {
        res.status(404).send("Course Not Found"); // Send 404 error if course data is not found
      } else {
        res.render("course", { course: course }); // Render the "course" view with the retrieved course data
      }
    })
    .catch((err) => {
      console.error("Error retrieving course:", err);
      res.status(500).send("Error retrieving course"); // Handle error if course retrieval fails
    });
});

app.get("/course/delete/:id", (req, res) => {
  const courseId = req.params.id;

  data
    .deleteCourseById(courseId)
    .then(() => {
      res.redirect("/courses"); // Redirect to /courses after deleting the course
    })
    .catch((err) => {
      console.error("Error deleting course:", err);
      res.status(500).send("Unable to Remove Course / Course not found"); // Send error message if course deletion fails
    });
});

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

data
  .initialize()
  .then(function () {
    app.listen(HTTP_PORT, function () {
      console.log("app listening on: " + HTTP_PORT);
    });
  })
  .catch(function (err) {
    console.log("unable to start server: " + err);
  });

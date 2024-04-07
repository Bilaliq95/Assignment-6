const { Sequelize, DataTypes } = require("sequelize");
var sequelize = new Sequelize(
  "postgresdb",
  "postgresdb_owner",
  "76SaiTOsKgNW",
  {
    host: "ep-rough-bush-a5nxnbnn.us-east-2.aws.neon.tech",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
  }
);

// Define the Student model
const Student = sequelize.define("Student", {
  studentNum: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.STRING,
  },
  lastName: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  addressStreet: {
    type: DataTypes.STRING,
  },
  addressCity: {
    type: DataTypes.STRING,
  },
  addressProvince: {
    type: DataTypes.STRING,
  },
  TA: {
    type: DataTypes.BOOLEAN,
  },
  status: {
    type: DataTypes.STRING,
  },
});

// Define the Course model
const Course = sequelize.define("Course", {
  courseId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  courseCode: {
    type: DataTypes.STRING,
  },
  courseDescription: {
    type: DataTypes.STRING,
  },
});

// Define the relationship: Course has many Students
Course.hasMany(Student, { foreignKey: "course" });

// Set up hooks to handle deletion process
Course.beforeDestroy(async (course, options) => {
  // Find all students associated with the course
  const students = await Student.findAll({
    where: { course: course.courseId },
  });

  // Update each student's course foreign key to null
  await Promise.all(
    students.map(async (student) => {
      student.course = null;
      await student.save();
    })
  );
});

function initialize() {
  return new Promise((resolve, reject) => {
    // Synchronize models with the database
    sequelize
      .sync()
      .then(() => {
        console.log("Database synchronized successfully");
        resolve(); // Resolve promise if synchronization is successful
      })
      .catch((err) => {
        console.error("Error synchronizing database:", err);
        reject("Unable to sync the database"); // Reject promise with appropriate message
      });
  });
}

function getAllStudents() {
  return new Promise((resolve, reject) => {
    // Retrieve all students from the database
    Student.findAll()
      .then((students) => {
        if (students.length > 0) {
          resolve(students); // Resolve promise with students array
        } else {
          resolve([]); // Resolve with empty array if no students found
        }
      })
      .catch((err) => {
        console.error("Error retrieving students:", err);
        reject("Error retrieving students"); // Reject with error message if there's an error during retrieval
      });
  });
}

function getStudentsByCourse(course) {
  return new Promise((resolve, reject) => {
    // Retrieve students based on the specified course
    Student.findAll({ where: { course: course } })
      .then((students) => {
        if (students.length > 0) {
          resolve(students); // Resolve promise with data if students are found
        } else {
          reject("No results returned"); // Reject promise with appropriate message if no students are found
        }
      })
      .catch((err) => {
        console.error("Error retrieving students by course:", err);
        reject("No results returned"); // Reject promise with appropriate message if an error occurs
      });
  });
}

function getStudentByNum(num) {
  return new Promise((resolve, reject) => {
    // Retrieve student based on the specified student number
    Student.findAll({ where: { studentNum: num } })
      .then((students) => {
        if (students.length > 0) {
          resolve(students[0]); // Resolve promise with data[0] (first object) if student is found
        } else {
          reject("No results returned"); // Reject promise with appropriate message if no student is found
        }
      })
      .catch((err) => {
        console.error("Error retrieving student by number:", err);
        reject("No results returned"); // Reject promise with appropriate message if an error occurs
      });
  });
}

function getCourses() {
  return new Promise((resolve, reject) => {
    // Retrieve all courses from the database
    Course.findAll()
      .then((courses) => {
        resolve(courses); // Resolve promise with courses array
      })
      .catch((err) => {
        console.error("Error retrieving courses:", err);
        reject("Error retrieving courses"); // Reject with error message if there's an error during retrieval
      });
  });
}

function getCourseById(id) {
  return new Promise((resolve, reject) => {
    // Retrieve course based on the specified course ID
    Course.findAll({ where: { courseId: id } })
      .then((courses) => {
        if (courses.length > 0) {
          resolve(courses[0]); // Resolve promise with data[0] (first object) if course is found
        } else {
          reject("No results returned"); // Reject promise with appropriate message if no course is found
        }
      })
      .catch((err) => {
        console.error("Error retrieving course by ID:", err);
        reject("No results returned"); // Reject promise with appropriate message if an error occurs
      });
  });
}

function addStudent(studentData) {
  return new Promise((resolve, reject) => {
    // Ensure TA property is set properly
    studentData.TA = studentData.TA ? true : false;

    // Replace blank values ("") with null
    for (let key in studentData) {
      if (studentData[key] === "") {
        studentData[key] = null;
      }
    }

    // Create a new student with the provided data
    Student.create(studentData)
      .then(() => {
        resolve(); // Resolve promise if student creation is successful
      })
      .catch((err) => {
        console.error("Error creating student:", err);
        reject("Unable to create student"); // Reject promise with appropriate message if an error occurs
      });
  });
}

function updateStudent(studentData) {
  return new Promise((resolve, reject) => {
    // Ensure TA property is set properly
    studentData.TA = studentData.TA ? true : false;

    // Replace blank values ("") with null
    for (let key in studentData) {
      if (studentData[key] === "") {
        studentData[key] = null;
      }
    }

    // Update the student with the provided data
    Student.update(studentData, {
      where: { studentNum: studentData.studentNum },
    })
      .then(() => {
        resolve(); // Resolve promise if student update is successful
      })
      .catch((err) => {
        console.error("Error updating student:", err);
        reject("Unable to update student"); // Reject promise with appropriate message if an error occurs
      });
  });
}

function addCourse(courseData) {
  return new Promise((resolve, reject) => {
    // Replace blank values ("") with null
    for (let key in courseData) {
      if (courseData[key] === "") {
        courseData[key] = null;
      }
    }

    // Create a new course with the provided data
    Course.create(courseData)
      .then(() => {
        resolve(); // Resolve promise if course creation is successful
      })
      .catch((err) => {
        console.error("Error creating course:", err);
        reject("Unable to create course"); // Reject promise with appropriate message if an error occurs
      });
  });
}

function updateCourse(courseData) {
  return new Promise((resolve, reject) => {
    // Replace blank values ("") with null
    for (let key in courseData) {
      if (courseData[key] === "") {
        courseData[key] = null;
      }
    }

    // Update the course with the provided data
    Course.update(courseData, {
      where: { courseId: courseData.courseId },
    })
      .then(() => {
        resolve(); // Resolve promise if course update is successful
      })
      .catch((err) => {
        console.error("Error updating course:", err);
        reject("Unable to update course"); // Reject promise with appropriate message if an error occurs
      });
  });
}

function deleteCourseById(id) {
  return new Promise((resolve, reject) => {
    // Delete the course with the provided ID
    Course.destroy({
      where: { courseId: id },
    })
      .then((rowsDeleted) => {
        if (rowsDeleted > 0) {
          resolve(); // Resolve promise if course is successfully deleted
        } else {
          reject("Course not found"); // Reject promise if no course is deleted (not found)
        }
      })
      .catch((err) => {
        console.error("Error deleting course:", err);
        reject("Unable to delete course"); // Reject promise with appropriate message if an error occurs
      });
  });
}

const deleteStudentByNum = (studentNum) => {
  return new Promise((resolve, reject) => {
    Student.destroy({
      where: {
        studentNum: studentNum,
      },
    })
      .then((result) => {
        if (result === 1) {
          resolve("Student deleted successfully");
        } else {
          reject("Unable to remove student / Student not found");
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  updateStudent,
  addStudent,
  initialize,
  getAllStudents,
  getCourseById,
  getStudentsByCourse,
  getStudentByNum,
  getCourses,
  addCourse,
  updateCourse,
  deleteCourseById,
  deleteStudentByNum,
};

const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const cors = require("cors");
const { createWorker } = require("tesseract.js");
const pdf = require("pdf-parse");
const fs = require("fs");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

const dbPath = path.join(__dirname, "moneymanage.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3100, () => {
      console.log("Server Started");
    });
  } catch (e) {
    console.error(`Error Message: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const authenticateJwtToken = (request, response, next) => {
  let jwtToken;
  const authHeaders = request.headers["authorization"];
  if (authHeaders !== undefined) {
    jwtToken = authHeaders.split(" ")[1];
  }

  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid Access Token");
  } else {
    try {
      jwt.verify(jwtToken, "saravanan", async (error, payload) => {
        if (error) {
          response.status(401);
          response.send("Invalid Access Token");
        } else {
          const { email } = payload;
          request.email = email;
          next();
        }
      });
    } catch (error) {
      response.status(500).send("Internal Server Error");
    }
  }
};

// Register API
app.post("/register", async (request, response) => {
  try {
    const { email, name, phoneNumber, gender, password } = request.body;
    const getUserDetailsQuery = `SELECT * FROM user_info WHERE email_id = "${email}"`;
    const userDetails = await db.get(getUserDetailsQuery);

    if (userDetails === undefined) {
      const hashedPassword = await bcrypt.hash(password, 12);
      const insertUserQuery = `INSERT INTO user_info (email_id, name, phone_num, gender, password)
        VALUES ('${email}', '${name}', '${phoneNumber}', '${gender}', '${hashedPassword}')`;

      await db.run(insertUserQuery);

      response.send("Registration Success");
    } else {
      response.status(400);
      response.send("Email ID Already Exists");
    }
  } catch (error) {
    response.status(500).send("Internal Server Error");
  }
});

// Login API
app.post("/login", async (request, response) => {
  try {
    const { email, password } = request.body;
    const getUserDetailsQuery = `SELECT * FROM user_info WHERE email_id = "${email}"`;
    const userDetails = await db.get(getUserDetailsQuery);
    if (userDetails !== undefined) {
      const isPasswordMatched = await bcrypt.compare(
        password,
        userDetails.password
      );
      if (isPasswordMatched === true) {
        const payload = { email };
        const jwtToken = jwt.sign(payload, "saravanan");

        response.send({ jwtToken });
      } else {
        response.status(401);
        response.send("Invalid Password");
      }
    } else {
      response.status(400);
      response.send("Invalid User");
    }
  } catch (error) {
    response.status(500).send("Internal Server Error");
  }
});

// User Details API
app.get("/userdetail", authenticateJwtToken, async (request, response) => {
  try {
    const { email } = request;
    const getUserDetailsQuery = `SELECT * FROM user_info WHERE email_id= '${email}'`;
    const userDetails = await db.get(getUserDetailsQuery);
    const formattedUserDetails = {
      email: `${userDetails.email_id}`,
      name: `${userDetails.name}`,
      phoneNumber: `${userDetails.phone_num}`,
      gender: `${userDetails.gender}`,
    };
    response.send(formattedUserDetails);
  } catch (error) {
    response.status(500).send("Internal Server Error");
  }
});

// Change Password API
app.put(
  "/userdetail/changepassword",
  authenticateJwtToken,
  async (request, response) => {
    try {
      const { email } = request;
      const { oldPassword, newPassword } = request.body;

      const getUserDetailsQuery = `SELECT * FROM user_info WHERE email_id= '${email}'`;
      const userDetails = await db.get(getUserDetailsQuery);

      if (userDetails !== undefined) {
        const isOldPasswordMatched = await bcrypt.compare(
          oldPassword,
          userDetails.password
        );

        if (isOldPasswordMatched === true) {
          const hashedNewPassword = await bcrypt.hash(newPassword, 12);
          const updatePasswordQuery = `UPDATE user_info SET password = '${hashedNewPassword}' WHERE email_id='${email}'`;
          await db.run(updatePasswordQuery);

          response.send("Password updated successfully");
        } else {
          response.status(401);
          response.send("Incorrect old password");
        }
      } else {
        response.status(400);
        response.send("Invalid user");
      }
    } catch (error) {
      response.status(500).send("Internal Server Error");
    }
  }
);

// Add Cashflow Details API
app.post("/cashflow", authenticateJwtToken, async (request, response) => {
  try {
    const { email } = request;
    const { title, amount, date, type, description } = request.body;
    const cashflow_id = uuidv4();
    const addCashflowQuery = `INSERT INTO cashflow (email_id, title, amount, date, type, description, cashflow_id) 
    VALUES ('${email}', '${title}', '${amount}', '${date}', '${type}', '${description}', '${cashflow_id}')`;

    await db.run(addCashflowQuery);
    response.send("Added Successfully");
  } catch (error) {
    response.status(500).send("Internal Server Error");
  }
});

// Get Cashflow Details API
app.get("/cashflow", authenticateJwtToken, async (request, response) => {
  try {
    const { email } = request;
    const getCashflowList = `SELECT * FROM cashflow WHERE email_id = '${email}' ORDER BY date DESC`;
    const cashflowList = await db.all(getCashflowList);
    const formattedCashflowList = cashflowList.map((eachItem) => ({
      email: eachItem.email_id,
      title: eachItem.title,
      amount: eachItem.amount,
      date: eachItem.date,
      type: eachItem.type,
      description: eachItem.description,
      cashflowId: eachItem.cashflow_id,
    }));
    response.send(formattedCashflowList);
  } catch (error) {
    response.status(500).send("Internal Server Error");
  }
});

// Update Cashflow Details API
app.put(
  "/cashflow/:cashflowId",
  authenticateJwtToken,
  async (request, response) => {
    try {
      const { email } = request;
      const { cashflowId } = request.params; // Retrieve cashflowId from path parameters
      const { title, amount, date, type, description } = request.body;
      const updateCashflowQuery = `UPDATE cashflow SET 
      title = '${title}', amount = '${amount}', date = '${date}', type = '${type}', description = '${description}' 
      WHERE email_id='${email}' AND cashflow_id='${cashflowId}'`;

      await db.run(updateCashflowQuery);
      response.send("Updated Successfully");
    } catch (error) {
      response.status(500).send("Internal Server Error");
    }
  }
);

// Delete Cashflow Details API
app.delete(
  "/cashflow/:cashflowId",
  authenticateJwtToken,
  async (request, response) => {
    try {
      const { email } = request;
      const { cashflowId } = request.params; // Retrieve cashflowId from path parameters
      const deleteCashflowQuery = `DELETE FROM cashflow WHERE email_id = '${email}' AND cashflow_id = '${cashflowId}'`;

      await db.run(deleteCashflowQuery);
      response.send("Deleted Successfully");
    } catch (error) {
      response.status(500).send("Internal Server Error");
    }
  }
);

// GET balance, income, expense API
// Get Balance API
app.get("/balance", authenticateJwtToken, async (request, response) => {
  try {
    const { email } = request;
    // Get total income
    const totalIncomeQuery = `SELECT SUM(amount) AS totalIncome FROM cashflow WHERE email_id = '${email}' AND type = 'income'`;
    const { totalIncome } = await db.get(totalIncomeQuery);

    // Get total expense
    const totalExpenseQuery = `SELECT SUM(amount) AS totalExpense FROM cashflow WHERE email_id = '${email}' AND type = 'expense'`;
    const { totalExpense } = await db.get(totalExpenseQuery);

    // Calculate balance
    const balance = (totalIncome || 0) - (totalExpense || 0);

    response.send({
      balance,
      totalIncome: totalIncome || 0,
      totalExpense: totalExpense || 0,
    });
  } catch (error) {
    response.status(500).send("Internal Server Error");
  }
});

// Add Bill Reminder API
app.post("/billreminder", authenticateJwtToken, async (request, response) => {
  try {
    const { email } = request;
    const { title, amount, dueDate, description } = request.body;
    const billReminderId = uuidv4();

    const addBillReminderQuery = `INSERT INTO bill_reminder (email_id, title, amount, due_date, description, bill_reminder_id) 
    VALUES ('${email}', '${title}', '${amount}', '${dueDate}', '${description}', '${billReminderId}')`;

    await db.run(addBillReminderQuery);
    response.send("Bill reminder added successfully");
  } catch (error) {
    response.status(500).send("Internal Server Error");
  }
});

// Get Bill Reminders API
app.get("/billreminder", authenticateJwtToken, async (request, response) => {
  try {
    const { email } = request;
    const getBillRemindersQuery = `SELECT * FROM bill_reminder WHERE email_id = '${email}' ORDER BY due_date ASC`;
    const billReminders = await db.all(getBillRemindersQuery);
    const formattedBillReminders = billReminders.map((item) => ({
      billId: item.bill_reminder_id,
      title: item.title,
      amount: item.amount,
      dueDate: new Date(item.due_date),
      description: item.description,
      email: item.email_id,
    }));

    response.send(formattedBillReminders);
  } catch (error) {
    response.status(500).send("Internal Server Error");
  }
});

// Update Bill Reminder API
app.put(
  "/billreminder/:billReminderId",
  authenticateJwtToken,
  async (request, response) => {
    try {
      const { email } = request;
      const { billReminderId } = request.params;
      const { title, amount, dueDate, description } = request.body;

      const updateBillReminderQuery = `UPDATE bill_reminder SET 
      title = '${title}', amount = '${amount}', due_date = '${dueDate}', description = '${description}' 
      WHERE email_id = '${email}' AND bill_reminder_id = '${billReminderId}'`;

      await db.run(updateBillReminderQuery);
      response.send("Bill reminder updated successfully");
    } catch (error) {
      response.status(500).send("Internal Server Error");
    }
  }
);

// Delete Bill Reminder API
app.delete(
  "/billreminder/:billReminderId",
  authenticateJwtToken,
  async (request, response) => {
    try {
      const { email } = request;
      const { billReminderId } = request.params;

      const deleteBillReminderQuery = `DELETE FROM bill_reminder WHERE email_id = '${email}' AND bill_reminder_id = '${billReminderId}'`;

      await db.run(deleteBillReminderQuery);
      response.send("Bill reminder deleted successfully");
    } catch (error) {
      response.status(500).send("Internal Server Error");
    }
  }
);

// TESSERACT JS
const storage = multer.diskStorage({
  destination: function (request, file, cb) {
    cb(null, "bills/");
  },
  filename: function (request, file, cb) {
    const uniqueFilename = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage: storage });

// Get Cashflow Income API for Every Month
app.get("/cashflowincome", authenticateJwtToken, async (request, response) => {
  try {
    const { email } = request;
    const getIncomeByMonthQuery = `SELECT 
      strftime('%m', date) AS month,
      SUM(amount) AS totalIncome
      FROM cashflow
      WHERE email_id = '${email}' AND type = 'income'
      GROUP BY month
      ORDER BY month`;

    const incomeByMonth = await db.all(getIncomeByMonthQuery);
    response.send(incomeByMonth);
  } catch (error) {
    response.status(500).send("Internal Server Error");
  }
});

// Get Cashflow Expense API for Every Month
app.get("/cashflowexpense", authenticateJwtToken, async (request, response) => {
  try {
    const { email } = request;
    const getExpenseByMonthQuery = `SELECT 
      strftime('%m', date) AS month,
      SUM(amount) AS totalExpense
      FROM cashflow
      WHERE email_id = '${email}' AND type = 'expense'
      GROUP BY month
      ORDER BY month`;

    const expenseByMonth = await db.all(getExpenseByMonthQuery);
    response.send(expenseByMonth);
  } catch (error) {
    response.status(500).send("Internal Server Error");
  }
});

// +++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++

const extractDataFromScan = (scanText) => {
  const lines = scanText.split("\n").filter((line) => line.trim() !== "");

  const firstTwoLine = lines.slice(0, 2).join(" ");

  const amounts = [];
  const billDate = [];
  const keywords = ["Total", "Subtotal", "Amount"];
  const dateKeywords = ["Date", "date"]; // Additional keywords related to dates

  // Regular expression pattern to match dates in format DD/MM/YYYY or DD-MM-YYYY
  const dateRegex = /\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4})\b/g;

  lines.forEach((line) => {
    keywords.forEach((keyword) => {
      if (line.includes(keyword)) {
        const amountMatch = line.match(/\d+\.\d+/);
        if (amountMatch) {
          amounts.push({
            keyword: keyword,
            amount: parseFloat(amountMatch[0]),
          });
        }
      }
    });
  });

  lines.forEach((line) => {
    dateKeywords.forEach((keyword) => {
      if (line.includes(keyword)) {
        // Extract date from the line using the regex pattern
        const dateMatches = line.match(dateRegex);
        if (dateMatches) {
          // If multiple dates are found, you can choose the first one
          const date = dateMatches[0];
          billDate.push(date);
        }
      }
    });
  });

  return { firstTwoLine, amounts, billDate };
};

// API endpoint for uploading an image or PDF
app.post(
  "/scanbill",
  authenticateJwtToken,
  upload.single("files[]"),

  async (request, response) => {
    if (!request.file) {
      response.status(400);
      response.send("No file uploaded.");
    } else {
      const imagePath = request.file.path;

      // Check if the uploaded file is a PDF
      if (request.file.mimetype === "application/pdf") {
        try {
          const pdfData = await fs.promises.readFile(imagePath);

          const options = {};
          const parsedData = await pdf(pdfData, options);

          const scanText = parsedData.text;

          //Process Scanned Text
          const { firstTwoLine, amounts, billDate } =
            extractDataFromScan(scanText);

          // Recognition Finished

          const { email } = request;

          const title = firstTwoLine;
          const amount = amounts[0].amount;

          let date = "";

          if (billDate[0] !== undefined) {
            const dateParts = billDate[0].split("-");
            date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
          }

          const type = "expense";
          const description = "";

          const cashflow_id = uuidv4();

          const addCashflowQuery = `INSERT INTO cashflow (email_id, title, amount, date, type, description, cashflow_id)
        VALUES ('${email}', '${title}', '${amount}', '${date}', '${type}', '${description}', '${cashflow_id}')`;

          await db.run(addCashflowQuery);

          response.send("Bill Added Successfully");
        } catch (error) {
          console.error("Error 12:", error);
          response.status(500).send("Failed to process PDF");
        }
      } else {
        // OCR using Tesseract.js for image files
        try {
          // Recognizing Image
          const worker = await createWorker("eng");
          const ret = await worker.recognize(imagePath);
          const scanText = ret.data.text;
          await worker.terminate();

          // Process the extracted text...
          const { firstTwoLine, amounts, billDate } =
            extractDataFromScan(scanText);

          // Recognition Finished

          const { email } = request;

          const title = firstTwoLine;
          const amount = amounts[0].amount;

          const dateParts = billDate[0].split("-");
          const date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

          const type = "expense";
          const description = "";

          const cashflow_id = uuidv4();

          const addCashflowQuery = `INSERT INTO cashflow (email_id, title, amount, date, type, description, cashflow_id)
        VALUES ('${email}', '${title}', '${amount}', '${date}', '${type}', '${description}', '${cashflow_id}')`;

          await db.run(addCashflowQuery);

          response.send("Bill Added Successfully");
        } catch (error) {
          console.error("Error:", error);
          response.status(500).send("OCR Failed");
        }
      }
    }
  }
);

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const Razorpay = require("razorpay");
const timeBasedAccess = require("./middleware/timeBasedAccess");
const subscriptionPlans = require("./config/plans");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://hixmanshu:beginhi2.0@cluster0.vzmut3o.mongodb.net/";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const sendInvoiceEmail = (email, plan) => {
  const mailOptions = {
    from: "your-email@gmail.com",
    to: email,
    subject: "Subscription Invoice",
    text: `Thank you for subscribing to the ${plan.name} plan. Amount: ${
      plan.frequency === "monthly"
        ? `$${plan.priceMonthly}`
        : `$${plan.priceYearly}`
    }`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending invoice email:", error);
    } else {
      console.log("Invoice email sent:", info.response);
    }
  });
};

async function run() {
  try {
    await client.connect();
    console.log("Mongodb connected");
    const postCollection = client.db("database").collection("posts"); // this collection is for team-ekt
    const userCollection = client.db("database").collection("users"); // this collection is for team-srv

    // get
    app.get("/user", async (req, res) => {
      try {
        const user = await userCollection.find().toArray();
        res.send(user);
      } catch (error) {
        console.log(error);
      }
    });
    app.get("/loggedInUser", async (req, res) => {
      try {
        const email = req.query.email;
        const user = await userCollection.find({ email: email }).toArray();
        res.send(user);
      } catch (error) {
        console.log(error);
      }
    });
    app.get("/post", timeBasedAccess, async (req, res) => {
      try {
        const post = (await postCollection.find().toArray()).reverse();
        res.send(post);
      } catch (error) {
        console.log(error);
      }
    });
    app.get("/userPost", async (req, res) => {
      try {
        const email = req.query.email;
        const post = (
          await postCollection.find({ email: email }).toArray()
        ).reverse();
        res.send(post);
      } catch (error) {
        console.log(error);
      }
    });

    // post
    app.post("/register", async (req, res) => {
      try {
        const user = req.body;
        const result = await userCollection.insertOne(user);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    });

    app.post("/post", timeBasedAccess, async (req, res) => {
      try {
        const post = req.body;
        const email = post.email;
        const user = await userCollection.find({ email: email }).toArray();
        const newCount = user[0].posts + 1;
        const currentPlan = user[0].subscription.plan;

        const { postLimit } = subscriptionPlans[currentPlan];
        // console.log(postLimit)
        if (user[0].posts >= postLimit) {
          return res.status(403).json({
            message: "Posting limit reached for your subscription plan.",
          });
        }
        const result = await postCollection.insertOne(post);
        try {
          await userCollection.updateOne(
            { email: email },
            {
              $set: {
                posts: newCount,
              },
            }
          );
        } catch (error) {
          console.log(error);
        }
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.post("/api/generate-otp", (req, res) => {
      const { email } = req.body;
      console.log(req.body);
      const secret = speakeasy.generateSecret({ length: 20 });
      const otp = speakeasy.totp({
        secret: secret.base32,
        encoding: "base32",
      });

      // Store the secret for the user's email
      otpSecrets[email] = secret.base32;

      // Send the OTP to the user's email
      sendOTPEmail(email, otp);

      res.json({ message: "OTP sent to your email" });
    });

    app.post("/api/verify-otp", (req, res) => {
      const { email, otp, newLanguage } = req.body;
      const secret = otpSecrets[email];

      const verified = speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token: otp,
        window: 1,
      });

      if (verified && newLanguage) {
        // Here you would update the user's language preference in your database
        console.log(`User ${email} changed language to ${newLanguage}`);
        res.json({
          success: true,
          message: "OTP verified and language changed",
        });
      } else if (verified && !newLanguage) {
        console.log("user logged in");
        res.json({ success: true, message: "OTP verified and logged in" });
      } else {
        res.json({ success: false, message: "Invalid OTP" });
      }
    });

    app.post("/api/payment", async (req, res) => {
      const { plan, email } = req.body;

      const amount =
        plan.frequency === "monthly"
          ? plan.priceMonthly * 100
          : plan.priceYearly * 100;

      try {
        const order = await razorpay.orders.create({
          amount,
          currency: "INR",
          receipt: `receipt_order_${Math.floor(Math.random() * 1000000)}`,
        });

        res.json({ success: true, orderId: order.id });
      } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
      }
    });

    app.post("/payment/successful", async (req,res) =>{
      const { plan, email } = req.body;

      try {
        
        // Calculate subscription end date
        const startDate = new Date();
        let endDate;
        if (plan.frequency === "monthly") {
          endDate = new Date(startDate.setMonth(startDate.getMonth() + 1));
        } else {
          endDate = new Date(
            startDate.setFullYear(startDate.getFullYear() + 1)
          );
        }

        // Update user's subscription in the database
        try {
          const result = await userCollection.updateOne(
            { email },
            {
              $set: {
                "subscription.plan": plan.name,
                "subscription.frequency": plan.frequency,
                "subscription.startDate": new Date(),
                "subscription.endDate": endDate,
              },
            }
          );
          // console.log(result)
        } catch (error) {
          console.log("error in updating");
          console.log(error);
        }

        // Send the invoice email
        sendInvoiceEmail(email, plan);
      } catch (error) {
        console.log(error)
      }
    })

    // patch
    app.patch("/userUpdates/:email", async (req, res) => {
      try {
        const filter = req.params;
        const profile = req.body;
        const options = { upsert: true };
        const updateDoc = { $set: profile };
        const result = await userCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
}
run().catch(console.dir);

const otpSecrets = {}; // This should be stored in a database in production

// Configure nodemailer for email sending
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "hiowner00@gmail.com",
    pass: "guimfutzivzxnkom",
  },
});

const sendOTPEmail = (email, otp) => {
  const mailOptions = {
    from: "hiowner00@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending OTP email:", error);
    } else {
      console.log("OTP email sent:", info.response);
    }
  });
};

app.get("/", (req, res) => {
  res.send("Hello from Twitter Clone!");
});

app.listen(port, () => {
  console.log(`Twitter clone is listening on port ${port}`);
});

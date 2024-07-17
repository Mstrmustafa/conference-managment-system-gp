const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const transporter = require("../config/nodemailer");
const { Router } = require("express");
const ConferenceMember = require("../models/conference_member");


exports.signUp = async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(401).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const verificationToken = jwt.sign(
      { email: req.body.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    const newUser = new User({
      fullName: req.body.fullName,
      email: req.body.email,
      password: hashedPassword,
      verificationToken: req.body.userType == "Admin" ? "" : verificationToken,
      userType: req.body.userType || "Normal User",
    });

    const createdUser = await newUser.save();
    const { password, __v, createdAt, updatedAt, ...userData } =
      createdUser._doc;
    if (!req.body.userType) {
      const verificationLink = `http://localhost:3000/user/verify-email?token=${verificationToken}`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userData.email,
        subject: "Verify your email address",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #333;">Verify Your Email Address</h2>
            <p>Thank you for registering, ${userData.fullName}. Please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
              <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Verify Email</a>
            </p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Best regards,<br>evenfy</p>
          </div>
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res
            .status(500)
            .json({ message: "Error sending verification email" });
        }
        console.log("Verification email sent: " + info.response);
      });

      res.status(201).json({
        message: "User created successfully, please verify your email",
        user: userData,
      });
    } else {
      res.status(201).json({
        message: "Admin created successfully",
        user: userData,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const token = req.query.token;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      email: decoded.email,
      verificationToken: token,
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    user.isVerified = true;

    await user.save();

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verified</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f0f0f0;
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
              }
              .container {
                  text-align: center;
              }
              h1 {
                  color: #333;
              }
              p {
                  color: #666;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Email Verified</h1>
              <p>Your email has been successfully verified.</p>
          </div>
      </body>
      </html>
    `;

    res.status(200).send(htmlContent);
  } catch (error) {
    next(error);
  }
};

exports.signIn = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    console.log(user.isVerified)
    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your email first" });
    }
    const comparePassword = await bcrypt.compare(
      req.body.password,
      user.password,
    );
    if (!comparePassword) {
      return res.status(401).json({ message: "Incorrect Password" });
    }
    const { password, createdAt, updatedAt, __v, ...userData } = user._doc;
    const token = jwt.sign(
      {
        email: userData.email,
        id: userData._id,
        requestedUserName: userData.fullName,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "50d",
      },
    );

    res
      .status(200)
      .json({ message: "Sign-in successful", token: token, user: userData });
  } catch (error) {
    next(error);
  }
};

module.exports.updateUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.user.id);
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.fullName = req.body.fullName
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.degree = req.body.degree || user.degree;
    user.googleScholarUsername =
      req.body.googleScholarUsername || user.googleScholarUsername;
    user.university = req.body.university || user.university;
    user.webPage = req.body.webPage || user.webPage;
    user.country = req.body.country || user.country;
    user.gender = req.body.gender || user.gender;
    let updatedUser = await user.save();
    let { password, createdAt, updatedAt, __v, ...userData } = updatedUser._doc;
    res
      .status(200)
      .json({ message: "User Updated Successfully", user: userData });
  } catch (error) {}
};

module.exports.adminLogin = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    if (user.userType != "Admin") {
      return res.status(404).json({ message: "User Not Admin" });
    }
    const comparePassword = await bcrypt.compare(
      req.body.password,
      user.password,
    );
    if (!comparePassword) {
      return res.status(401).json({ message: "Incorrect Password" });
    }
    const { password, createdAt, updatedAt, __v, ...userData } = user._doc;
    const token = jwt.sign(
      {
        email: userData.email,
        id: userData._id,
        requestedUserName: userData.fullName,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "50d",
      },
    );
    res
      .status(200)
      .json({
        message: "Signed In Successfullys",
        token: token,
        user: userData,
      });
  } catch (error) {
    next(error);
  }
};

module.exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    let { password, createdAt, updatedAt, __v, ...userData } = user._doc;
    res.status(200).json(userData);
  } catch (error) {
    next(error);
  }
};

module.exports.getUser_ById = async (req, res, next) => {
  try {
    const userid = req.body.userId
    const user = await User.findById(userid);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    let { password, createdAt, updatedAt, __v, ...userData } = user._doc;
    res.status(200).json(userData);
  } catch (error) {
    next(error);
  }
};


exports.updateEmail = async (req, res, next) => {
  try {const newEmail = req.body.email;
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(401).json();
    }
      const user = await User.findById(req.user.id);
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      
      const verificationToken = jwt.sign({ email: newEmail }, process.env.JWT_SECRET, { expiresIn: '1d' });

      user.email = newEmail;
      user.isVerified = false;
      user.verificationToken = verificationToken;

      const updatedUser = await user.save();
      const { password, createdAt, updatedAt, __v, ...userData } = updatedUser._doc;

      const verificationLink = `http://localhost:3000/user/verify-email?token=${verificationToken}`;
      const mailOptions = {
          from: process.env.EMAIL_USER,
          to: newEmail,
          subject: 'Verify your new email address',
          html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                  <h2 style="color: #333;">Verify Your New Email Address</h2>
                  <p>Please verify your new email address by clicking the button below:</p>
                  <p style="text-align: center;">
                      <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Verify Email</a>
                  </p>
                  <p>If you did not request this, please ignore this email.</p>
                  <p>Best regards,<br>Evenfy</p>
              </div>
          `
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.log(error);
              return res.status(500).json({ message: 'Error sending verification email' });
          }
          console.log('Verification email sent: ' + info.response);
      });

      res.status(200).json({ message: "Email updated successfully, please verify your new email", user: userData });
  } catch (error) {
      next(error);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
      const user = await User.findById(req.user.id);
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 12);
      user.password = hashedPassword;
      const updatedUser = await user.save();
      const { password, createdAt, updatedAt, __v, ...userData } = updatedUser._doc;

      res.status(200).json({ message: "Password updated successfully", user: userData });
  } catch (error) {
      next(error);
  }
};

exports.getuserByConMemId = async (req, res, next) => {
  try {
    const conmemid = req.body.conmemId
    const conmembers = await ConferenceMember.findOne({_id: conmemid})
    const user = await User.findById(conmembers.userId)
    console.log(user.fullName)
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    next(error);
  }
};

exports.getconmemid = async (req, res, next) => {
  try {
    const { email, conferenceId } = req.body;

    if (!email || !conferenceId) {
      return res.status(400).json({ message: "Email and conferenceId are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const conmem = await ConferenceMember.findOne({ conferenceId, userId: user._id });
    if (!conmem) {
      return res.status(404).json({ message: "Conference member not found" });
    }

    res.status(200).json(conmem);
  } catch (error) {
    console.error("Error fetching conference member:", error);
    res.status(500).json({ message: "Internal server error" });
    next(error);
  }
};

exports.sendFeedbackuser = async (req, res, next) => {
  try {
    const {message } = req.body;
    const user = await User.findOne({_id:req.user.id})

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'evenfy3@gmail.com',
      subject: 'Feedback from User',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
  <h2 style="color: #007bff; text-align: center;">User Feedback</h2>
  <div style="padding: 10px 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
    <h3 style="color: #333;">Feedback from:</h3>
    <p style="color: #555;"><strong>Name:</strong> ${user.fullName}</p>
    <p style="color: #555;"><strong>Email:</strong> ${user.email}</p>
    <h3 style="color: #333;">Message:</h3>
    <p style="color: #555;">${message}</p>
  </div>
  <p style="text-align: center; color: #777; margin-top: 20px;">Best regards,<br><strong>Evenfy Team</strong></p>
</div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Error sending feedback email" });
      }
      console.log("Feedback email sent: " + info.response);
      res.status(200).json({ message: "Feedback sent successfully" });
    });
  } catch (error) {
    next(error);
  }
};
exports.sendFeedback = async (req, res, next) => {
  try {
    const { email,name, message } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'evenfy3@gmail.com',
      subject: 'Feedback from User',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
  <h2 style="color: #007bff; text-align: center;">User Feedback</h2>
  <div style="padding: 10px 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
    <h3 style="color: #333;">Feedback from:</h3>
    <p style="color: #555;"><strong>Name:</strong> ${name}</p>
    <p style="color: #555;"><strong>Email:</strong> ${email}</p>
    <h3 style="color: #333;">Message:</h3>
    <p style="color: #555;">${message}</p>
  </div>
  <p style="text-align: center; color: #777; margin-top: 20px;">Best regards,<br><strong>Evenfy Team</strong></p>
</div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Error sending feedback email" });
      }
      console.log("Feedback email sent: " + info.response);
      res.status(200).json({ message: "Feedback sent successfully" });
    });
  } catch (error) {
    next(error);
  }
};

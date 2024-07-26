const { Router } = require("express");
const User = require("../model/user");
const multer = require("multer");
const upload = require("../middleware/upload"); // Adjust the path as necessary
const path = require("path");

const router = Router();

router.get("/signin", (req, res) => {
  return res.render("signin");
});
router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    //   const user = User.matchPasswordAndGenerateToken(email, password); //matched password is a static fn. which we create in user model
    const token = await User.matchPasswordAndGenerateToken(email, password);

    //   console.log("User", user);
    console.log("token = ", token); //if user make correct login, we make a cookie for that user
    return res.cookie("token", token).redirect("/");
    //   return res.redirect("/");}
  } catch (error) {
    //we load sign in page agin if we dont get user or we are not able to form cookie
    return res.render("signin", {
      error: "Incorret Email or password",
    });
  }
});

router.post("/signup", upload.single("profileImage"), async (req, res) => {
  const { fullName, email, password } = req.body;

  // Validate input
  if (!fullName || !email || !password) {
    return res.status(400).send("All fields are required");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).send("User already exists");
  }

  let profileImageURL = "/images/default.png"; // Default image URL

  if (req.file) {
    console.log("File uploaded:", req.file); // Log file details
    profileImageURL = "/profileUploads/" + req.file.filename;
  }

  try {
    await User.create({
      fullName,
      email,
      password,
      profileImageURL,
    });
    return res.render("signin"); // Redirect to the sign-in page
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

//route to get user profile
router.get("/:id", async (req, res) => {
  const userId = req.params.id;
  return res.render("profile", {
    user: req.user,
  });
});

//route to delete account Or to update the account
//update
router.put(
  "/profile/update",
  upload.single("profileImage"),
  async (req, res) => {
    const { fullName, email, password } = req.body;
    const userId = req.user._id;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send("User not found");
      }

      if (fullName) user.fullName = fullName;
      if (email) user.email = email;
      if (password) user.password = password; // Ensure you hash the password before saving
      if (req.file) {
        user.profileImageURL = "/profileUploads/" + req.file.filename; // Update profile image URL
      }

      // Save the updated user
      await user.save();
      res.redirect(`/user/${userId}`); // Redirect to the profile page
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  }
);
//delete
router.delete("/profile/delete", async (req, res) => {
  const userId = req.user._id; // Assuming req.user contains the logged-in user

  try {
    // Find and delete the user
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Clear the authentication cookie
    res.clearCookie("token");

    // Redirect to the homepage or login page
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
//we also to do hash the our password that we get while sign IN and match with the same that is in the our database. if mathhed we do
//we make a virtual Function:- to read more about it go to "https://mongoosejs.com/docs/tutorials/virtual" and how add static fn AT "https://mongoosejs.com/docs/guide.html#statics"

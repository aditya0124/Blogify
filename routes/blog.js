const { Router } = require("express");
const multer = require("multer");
const Blog = require("../model/blog");
const Comment = require("../model/comment");
const router = Router();
const path = require("path");
const { findById } = require("../model/user");

// Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`)); //we store the user upload cover file in public's uploads section  && this ${req.user._id} menas we make a seprate file for every user in uploads folder
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()} - ${file.originalname}`; // it is how our file name loks like we have first date thenoriginal file name. AND cb is a callback function
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

//Routes

router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

//route for blog page
router.get("/:id", async (req, res) => {
  const blogId = req.params.id;
  const blog = await Blog.findById(blogId).populate("createdBy");
  // // fetching blog
  const comments = await Comment.find({ blogId: blogId }).populate("createdBy");
  console.log(comments);
  return res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});

router.post("/", upload.single("coverImage"), async (req, res) => {
  // upload.single('coverImage') :- means kya upload krana hai . we here want to upload coverImage
  // console.log(req.body);
  // console.log(req.file); // give details of our civerImage that we are going to be upload on our blog
  const { title, body } = req.body;
  const blog = await Blog.create({
    body,
    title,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.file.filename}`,
  });
  return res.redirect(`/blog/${blog._id}`);
});

//comment blog
router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

//
//

//comment delete
router.post("/comment/delete/:id", async (req, res) => {
  const commentId = req.params.id;
  const userId = req.user._id; // Get the ID of the logged-in user

  try {
    // Find the comment by ID
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).send("Comment not found");
    }

    // Check if the logged-in user is the author of the comment
    if (comment.createdBy.toString() !== userId.toString()) {
      return res
        .status(403)
        .send("You are not authorized to delete this comment");
    }

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    // Redirect or respond with success message
    res.redirect("back"); // Redirect to the previous page
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;

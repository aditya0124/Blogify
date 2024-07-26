const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { connectMongoDB } = require("./connection");
const methodOverride = require("method-override");

//import functionality
const {
  checkForAuthenticationCookies,
} = require("./middleware/authentication");

//import routes
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
//render ouur blog
const Blog = require("./model/blog");
//
const app = express();
const PORT = 9000; // in rel world we dont choose that this run on port no this because might be this port No s not available on any othr computer. so we use env variables;
//connection
connectMongoDB("mongodb://127.0.0.1:27017/blogify").then(() =>
  console.log("MongoDB connected")
);

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false })); //use this middleware to handle form data

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(cookieParser());
app.use(checkForAuthenticationCookies("token"));
// Serve static files from the 'public' directory
app.use(express.static("public"));
app.use(express.static(path.resolve("./public"))); //menas serve all thing statiscally that is in public folder
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

app.use(methodOverride("_method"));
// app.get("/", (req, res) => {
//   res.render("home", {
//     user: req.user,
//   });
// });
//getting all blog on home page
app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  console.log(req.user); // Log user to check
  // console.log(req.user); // Log user to check

  res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => console.log(`Server Started At PORT NO:- ${PORT}`));

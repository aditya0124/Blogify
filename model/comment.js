const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    blogId: {
      type: Schema.Types.ObjectId,
      ref: "blog",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user", // Reference to "user" is correct
    },
  },
  { timestamps: true }
);

const Comment = model("comment", commentSchema); ///model(modelName, schema)
module.exports = Comment;
// Password Hashing menas turns your password (or any other piece of data) into a short string of letters and/or numbers using an encryption algorithm

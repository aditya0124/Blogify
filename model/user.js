const { createHmac, randomBytes } = require("node:crypto"); // an bult in fn. to hash our password
const { Schema, model } = require("mongoose");
const { createTokenFromUser } = require("../services/auth");

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageURL: {
      type: String,
      default: "/images/man.png",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"], // means inke alwa hum aur koi role nhi de sakte user ko
      default: "USER",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  // go and read more details abut it on googleby serach"schema.pre" or goto "https://mongoosejs.com/docs/middleware.html"
  const user = this;
  if (!user.isModified("password")) return; // we hash the password hee in this fn. We use crypto for this

  const salt = randomBytes(16).toString(); //"SomeRandomSalt";// random key generate krenge har user k liye. it is secret key
  const hashedPassword = createHmac("sha256", salt) // now using this we make a hashd password.
    .update(user.password)
    .digest("hex");
  this.salt = salt;
  this.password = hashedPassword;
  next();
}); // we use pre because when we try to save our user, it run this fn. first then it call next function after calling this fn. and in this fn we hash the user password

userSchema.statics.matchPasswordAndGenerateToken = async function (
  email,
  password
) {
  const user = await this.findOne({ email });
  if (!user) {
    throw new Error("User Not Found");
  } //means password not match

  const salt = user.salt;
  if (!salt) {
    throw new Error("Salt is undefined");
  }

  const hashedPassword = user.password; //ye dono (hashedPassword & salt)jo humare database m h wo hai

  //here we hashed our user given password
  const userGivenPassword = createHmac("sha256", salt) // now using this we make a hashd password.
    .update(password)
    .digest("hex");
  if (hashedPassword !== userGivenPassword) {
    throw new Error("Invalid Password");
  }
  // if password match we return the token
  const token = createTokenFromUser(user);
  return token;
  //   return { ...user.toObject(), password: undefined, salt: undefined }; //if password match we return the user
}; // we make this by using "https://mongoosejs.com/docs/guide.html#statics"

const User = model("user", userSchema); ///model(modelName, schema)
module.exports = User;
// Password Hashing menas turns your password (or any other piece of data) into a short string of letters and/or numbers using an encryption algorithm

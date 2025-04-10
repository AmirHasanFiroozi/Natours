const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [2, 'name must be grather than tow character'],
    maxlength: [20, 'name must be less than 20 character'],
    trim: true,
    required: [true, 'user must have name'],
  },
  email: {
    type: String,
    trim: true,
    required: [true, 'user must have email'],
    validate: [validator.isEmail, 'email is not correct'],
    unique: true,
  },
  photo: {
    type: String,
    /// set the default photo for all users
    default: 'default.jpg',
  },
  password: {
    type: String,
    trim: true,
    // validate: [
    //   validator.isStrongPassword,
    //   'password should include at least 8 character contain lower case and upper case word and number and at least contain one character',
    // ],
    select: false,
    required: [true, 'password is a required field'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'passwordConfirm is a required field'],
    validate: {
      /// This only works on CREATE AND SAVE!(NOT for update).
      validator: function (val) {
        return val === this.password;
      },
      message: 'password and password coonfirm should be the same',
    },
  },
  role: {
    type: String,
    default: 'user',
    enum: ['admin', 'user', 'guide', 'lead-guide'],
  },
  passwordChangeAt: Date,
  passResetToken: String,
  passResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
  },
});

userSchema.pre('save', async function (next) {
  /// only run this function when the password is modified
  if (!this.isModified('password')) return next();

  // 𝗪𝗵𝘆 𝗶𝘀 𝗶𝘀𝗠𝗼𝗱𝗶𝗳𝗶𝗲𝗱() 𝗡𝗲𝗲𝗱𝗲𝗱?
  // When a Mongoose document is saved (user.save()), the pre('save') middleware runs every time, even if only non-password fields (like name, email, etc.) are updated.
  // However, password hashing is an expensive operation (it uses CPU-intensive algorithms like bcrypt). We only want to re-hash the password if it was actually changed, not on every save.

  // 𝗪𝗵𝗮𝘁 𝗛𝗮𝗽𝗽𝗲𝗻𝘀 𝗪𝗶𝘁𝗵𝗼𝘂𝘁 𝗶𝘀𝗠𝗼𝗱𝗶𝗳𝗶𝗲𝗱()?
  // If you don't use isModified('password'), the password hashing logic would run every time the user document is saved, even if:
  // The user updates their email but not their password.
  // The user updates their profile picture but not their password.
  // Any other non-password field is modified.
  // This would:
  // Waste CPU resources (unnecessary hashing).
  // Slow down operations (hashing is slow by design).
  // Potentially cause bugs (if the hashing function has side effects).

  // 𝗪𝗵𝗲𝗻 𝗗𝗼𝗲𝘀 𝗶𝘀𝗠𝗼𝗱𝗶𝗳𝗶𝗲𝗱('𝗽𝗮𝘀𝘀𝘄𝗼𝗿𝗱') 𝗥𝗲𝘁𝘂𝗿𝗻 𝘁𝗿𝘂𝗲?
  // Scenario	isModified('password')	Explanation
  // New user creation =>✅ true
  // Password is set for the first time.(user.password = "new123") =>✅ true
  // Password was manually updated.No password change (e.g., only user.email was updated) =>❌ false
  // Calling save() without changes =>❌ false

  /// hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  /// remove modified password
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangeAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPassword = function (jwtTime) {
  if (this.passwordChangeAt) {
    const passChangeSec = parseInt(this.passwordChangeAt.getTime() / 1000, 10);

    return jwtTime < passChangeSec;
  }

  /// Means pass is not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  /// Encoded the reset Token for save in the database and haker can't access to that easy
  this.passResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('user', userSchema);

module.exports = User;

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');

const staffSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      //   trim: true,
      //   lowercase: true,
      validate(value) {
        if (!validator.isMobilePhone(value)) {
          throw new Error('Invalid Mobile Number');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    // it will be role group ref;
    roleGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoleGroup',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json

staffSchema.plugin(toJSON);
staffSchema.plugin(paginate);

/**
 * Check if mobile number is taken
 * @param {string} mobile - The user's mobile
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
staffSchema.statics.isMobileTaken = async function (mobile, excludeUserId) {
  const user = await this.findOne({ mobile, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
staffSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

staffSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef Staff
 */
const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;

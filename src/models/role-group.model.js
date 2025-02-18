const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');

const roleGroupSchema = mongoose.Schema(
  {
    name: {
      trim: true,
      type: String,
      required: true,
    },
    roles: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Role',
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
roleGroupSchema.plugin(toJSON);
roleGroupSchema.plugin(paginate);

// update random name
roleGroupSchema.pre('save', async function (next) {
  const group = this;
  if (!group.isModified('password')) {
    group.name = group.name.toLowerCase().replace(/\s/g, '-');
  }
  next();
});

/**
 * @typedef RoleGroup
 */
const RoleGroup = mongoose.model('RoleGroup', roleGroupSchema);
module.exports = RoleGroup;

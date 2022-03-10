const { Schema, model } = require("mongoose");

const testSchema = new Schema(
  {
    testId: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      required: true,
    },
    participantId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const Test = model("Test", testSchema);

module.exports = Test;

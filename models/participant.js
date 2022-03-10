const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const participantSchema = new Schema(
  {
    matriculationNumber: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    nativeLanguage: {
      type: String,
      required: true,
    },
    englishUse: {
      type: String,
      required: true,
    },
    keyboardLayout: {
      type: String,
      required: true,
    },
    keyboardProfile: {
      type: String,
      required: true,
    },
    touchTypingCourse: {
      type: Boolean,
      required: true,
    },
    isTypist: {
      type: Boolean,
      required: true,
    },
    avrageDailyTyping: {
      type: Number,
      required: true,
    },
    usedHand: {
      type: String,
      required: true,
    },
    usedFingers: {
      type: Number,
      required: true,
    },
    participantId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const Participant = mongoose.model("Participant", participantSchema);

module.exports = Participant;

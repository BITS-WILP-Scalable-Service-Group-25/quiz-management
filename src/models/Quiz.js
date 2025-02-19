const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    text: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true },
    type: { type: String, enum: ["MCQ", "True/False"], required: true }
}, { timestamps: true });

const QuizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    visibility: { type: String, enum: ["public", "private"], default: "public" }
}, { timestamps: true });

const Question = mongoose.model("Question", QuestionSchema);
const Quiz = mongoose.model("Quiz", QuizSchema);

module.exports = { Quiz, Question };

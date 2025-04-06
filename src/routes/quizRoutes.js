const express = require("express");
const { Quiz } = require("../models/Quiz");
const { Question } = require("../models/Quiz");

const router = express.Router();

//Create
router.post("/", async (req, res) => {
    try {
        const quiz = new Quiz(req.body);
        await quiz.save();
        res.status(201).json(quiz);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//All
router.get("/", async (req, res) => {
    try {
        const quizzes = await Quiz.find().populate("questions");
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//By Id
router.get("/:id", async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate("questions");
        if (!quiz) return res.status(404).json({ error: "Quiz not found" });
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Update
router.put("/:id", async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!quiz) return res.status(404).json({ error: "Quiz not found" });
        res.json(quiz);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//Delete
router.delete("/:id", async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndDelete(req.params.id);
        if (!quiz) return res.status(404).json({ error: "Quiz not found" });
        res.json({ message: "Quiz deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Question
router.post("/:quizId/questions", async (req, res) => {
    try {
        const question = new Question(req.body);
        const quiz = await Quiz.findById(req.params.quizId);
        if (!quiz) return res.status(404).json({ error: "Quiz not found" });
        quiz.questions.push(question);
        await question.save();
        await quiz.save();
        res.status(201).json(question);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all Questions for a Quiz
router.get("/:quizId/questions", async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId).populate("questions");
        if (!quiz) return res.status(404).json({ error: "Quiz not found" });
        res.json(quiz.questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Question by Id
router.get("/:quizId/questions/:questionId", async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId).populate("questions");
        if (!quiz) return res.status(404).json({ error: "Quiz not found" });
        const question = await Question.findById(req.params.questionId);
        if (!question) return res.status(404).json({ error: "Question not found" });
        res.json(question);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Question
router.put("/:quizId/questions/:questionId", async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId).populate("questions");
        if (!quiz) return res.status(404).json({ error: "Quiz not found" });
        const question = await Question.findByIdAndUpdate(req.params.questionId, req.body, { new: true });
        if (!question) return res.status(404).json({ error: "Question not found" });
        res.json(question);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete Question
router.delete("/:quizId/questions/:questionId", async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId).populate("questions");
        if (!quiz) return res.status(404).json({ error: "Quiz not found" });
        const question = await Question.findByIdAndDelete(req.params.questionId);
        if (!question) return res.status(404).json({ error: "Question not found" });
        if (quiz) {
            quiz.questions.pull(question._id);
            await quiz.save();
        }
        res.json({ message: "Question deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

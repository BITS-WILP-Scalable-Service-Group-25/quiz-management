const express = require("express");
const { Quiz } = require("../models/Quiz");

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

module.exports = router;

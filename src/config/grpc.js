const logger = require("./logger");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const { Quiz } = require("../models/Quiz");
const { Question } = require("../models/Quiz");

const PROTO_PATH = path.join(__dirname, "../proto/quiz.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const proto = grpc.loadPackageDefinition(packageDefinition);
const quizProto = proto.quizmanagement.QuizService;
const questionProto = proto.quizmanagement.QuestionService;

const quizService = {
  CreateQuiz: async (call, callback) => {
    try {
      const { title, description, createdBy} = call.request;
      const quiz = new Quiz({ title, description, createdBy});
      await quiz.save();
      callback(null, { id: quiz._id, title: quiz.title, description: quiz.description, createdBy: quiz.createdBy });
    } catch (error) {
      callback(error);
    }
  },

  GetQuiz: async (call, callback) => {
    try {
      const quiz = await Quiz.findById(call.request.id).populate("questions");
      if (!quiz) return callback({ code: grpc.status.NOT_FOUND, message: "Quiz not found" });
      const formattedQuestions = quiz.questions.map(q => ({
        id: q._id,
        text: q.text,
        options: q.options,
        correct_answer: q.correct_answer,
        type: q.type
      }));
      callback(null, { 
        id: quiz._id, 
        title: quiz.title, 
        description: quiz.description, 
        questions: formattedQuestions
      });
    } catch (error) {
      callback(error);
    }
  },

  ListQuizzes: async (_, callback) => {
    try {
      const quizzes = await Quiz.find();
      callback(null, { quizzes: quizzes.map(q => ({ id: q._id, title: q.title, description: q.description })) });
    } catch (error) {
      callback(error);
    }
  },

  DeleteQuiz: async (call, callback) => {
    try {
      const quiz = await Quiz.findByIdAndDelete(call.request.id);
      if (!quiz) return callback({ code: grpc.status.NOT_FOUND, message: "Quiz not found" });
      callback(null, { status: true });
    } catch (error) {
      callback(error);
    }
  },
};
const questionService = {
  CreateQuestion: async (call, callback) => {
    try {
      const { quizId, text, options, correctAnswer, type } = call.request;
      const quiz = await Quiz.findById(quizId);
      if (!quiz) return callback({ code: grpc.status.NOT_FOUND, message: "Quiz not found" });
      
      const question = new Question({ quizId, text, options, correctAnswer, type });
      await question.save();
      quiz.questions.push(question);
      await quiz.save();

      callback(null, { id: question._id, quizId, text, options, correctAnswer });
    } catch (error) {
      callback(error);
    }
  },

  GetQuestion: async (call, callback) => {
    try {
      const { quizId, id }= call.request;
      const quiz = await Quiz.findById(quizId);
      if (!quiz) return callback({ code: grpc.status.NOT_FOUND, message: "Quiz not found" });

      const question = await Question.findById(id);
      if (!question) return callback({ code: grpc.status.NOT_FOUND, message: "Question not found" });
      callback(null, { id: question._id, text: question.text, options: question.options, correctAnswer: question.correctAnswer });
    } catch (error) {
      callback(error);
    }
  },

  ListQuestions: async (call, callback) => {
    try {
      const quiz = await Quiz.findById(call.request.quizId).populate("questions");
      if (!quiz) return callback({ code: grpc.status.NOT_FOUND, message: "Quiz not found" });
      callback(null, { questions: quiz.questions.map(q => 
        ({ id: q._id,
          text: q.text,
          options: q.options,
          correct_answer: q.correct_answer,
          type: q.type 
        })) });
    } catch (error) {
      callback(error);
    }
  },

  UpdateQuestion: async (call, callback) => {
    try {
      const { quizId, id, text, options, correctAnswer } = call.request;
      const quiz = await Quiz.findById(quizId);
      if (!quiz) return callback({ code: grpc.status.NOT_FOUND, message: "Quiz not found" });
      const question = await Question.findByIdAndUpdate(id, { text, options, correctAnswer }, { new: true });
      if (!question) return callback({ code: grpc.status.NOT_FOUND, message: "Question not found" });
      callback(null, { id: question._id, text: question.text, options: question.options, correctAnswer: question.correctAnswer });
    } catch (error) {
      callback(error);
    }
  },

  DeleteQuestion: async (call, callback) => {
    try {
      const { quizId, id }= call.request;
      const quiz = await Quiz.findById(quizId);
      if (!quiz) return callback({ code: grpc.status.NOT_FOUND, message: "Quiz not found" });
      const question = await Question.findByIdAndDelete(id);
      if (!question) return callback({ code: grpc.status.NOT_FOUND, message: "Question not found" });
      callback(null, { status: true, message: "Question deleted successfully" });
    } catch (error) {
      callback(error);
    }
  }
};


const startGrpcServer = () => {
  const server = new grpc.Server();
  server.addService(quizProto.service, quizService);
  server.addService(questionProto.service, questionService);
  server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), () => {
    logger.info("✅ gRPC Server running on port 50051");
  });
};

module.exports = startGrpcServer;

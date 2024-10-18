import mongoose, { Schema, Document, Model } from "mongoose";

export type QuestionType = "text" | "radio" | "mcq" | "single_choice";

export enum questionStatus {
  active = 1,
  inactive = 2,
}

interface IQuestion extends Document {
  questionType: QuestionType;
  question: string;
  options?: Record<string, any>; // Storing options as a JSON object
  example?: string;
  status: questionStatus.active | questionStatus.inactive;
}

const questionSchema: Schema<IQuestion> = new Schema(
  {
    questionType: {
      type: String,
      enum: ["text", "radio", "mcq", "single_choice"],
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    options: {
      type: Object,
      required: function (this: IQuestion) {
        return this.questionType !== "text";
      },
      validate: {
        validator: function (this: IQuestion, v: Record<string, any>) {
          return (
            this.questionType === "text" || (v && Object.keys(v).length > 0)
          ); // If questionType is "text", options can be null; otherwise, it must be a non-empty object
        },
        message:
          "Options must be a non-empty object when questionType is not 'text'.",
      },
    },
    example: {
      type: String,
      required: function (this: IQuestion) {
        return this.questionType === "text";
      },
      validate: {
        validator: function (this: IQuestion, v: string) {
          return this.questionType !== "text" || (v && v.trim() !== ""); // If questionType is "text", example must be a non-empty string
        },
        message: "Example is required for question type 'text'.",
      },
    },
    status: {
      type: Number,
      enum: questionStatus,
      default: questionStatus.active,
    },
  },
  {
    timestamps: true,
  }
);

const Question: Model<IQuestion> =
  mongoose.models.Question ||
  mongoose.model<IQuestion>("Question", questionSchema);

export default Question;

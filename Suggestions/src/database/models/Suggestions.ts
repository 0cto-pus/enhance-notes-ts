import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const SuggestionsSchema = new Schema(
  {
    userId: String,
    suggestions: [
      {
        suggestion: {
          noteId: String,
          type: String,
          required: true,
        },
        noteId: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

export default mongoose.model('suggestions', SuggestionsSchema);

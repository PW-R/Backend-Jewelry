import mongoose from "mongoose";

const clickSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // product clicks might not have userId
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    category: {
      type: String,
      default: "Unknown",
    },
    type: {
      type: String,
      enum: ["history", "product"], // 'history' = user view, 'product' = total product clicks
      default: "history",
    },
    clickCount: {
      type: Number,
      default: 1, // used for product analytics
    },
    lastViewed: {
      type: Date,
      default: Date.now, // last time user viewed this product
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Optional: update `lastViewed` automatically when saving
clickSchema.pre("save", function (next) {
  this.lastViewed = new Date();
  next();
});

export default mongoose.model("Click", clickSchema);

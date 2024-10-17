import mongoose, { Schema, Document, Model } from 'mongoose';

interface ISubscription extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  planId: mongoose.Schema.Types.ObjectId;
  stripeSubscriptionId: string;
  startDateTime: Date;
  endDateTime: Date;
  cancelDateTime: Date;
  status: subscriptionStatus.active | subscriptionStatus.inactive;
}

export enum subscriptionStatus {
    active = 1,
    inactive = 2,
    canceled = 3,
}

const subscriptionSchema: Schema<ISubscription> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
      defaule: "",
      required: true,
    },
    startDateTime: {
      type: Date,
      default: Date.now, // Set to current date and time by default
    },
    endDateTime: {
      type: Date,
      required: true,
    },
    cancelDateTime: {
      type: Date,
      default: null,
    },
    status: {
      type: Number,
      enum: subscriptionStatus,
      default: subscriptionStatus.active,
    },
  },
  {
    timestamps: true,
  }
);

const Subscription: Model<ISubscription> =
  mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', subscriptionSchema);

export default Subscription;

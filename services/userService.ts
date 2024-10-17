import User from "../models/user";
import Subscription from "../models/subscription";
import Plan from "../models/plan";
import { differenceInDays, subMonths, startOfMonth } from "date-fns";
import bcrypt from "bcryptjs";

interface UserInput {
  name: string;
  email: string;
  password: string;
}

export async function findUserByEmail(email: string) {
  return await User.findOne({ email });
}

export async function createUser({ name, email, password }: UserInput) {
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create and save the new user
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  });

  await newUser.save();
  return newUser;
}

export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }

  const subscription:any = await Subscription.findOne({ userId: user._id });

  if (subscription?.endDateTime < new Date()) {
    throw new Error("Subscription expired");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  return user;
}

export async function getPaginatedUsers(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const totalUsers = await User.countDocuments();
  const users = await User.find()
    .skip(skip)
    .limit(limit)
    .select("-password")
    .lean(); // Exclude password field

  // Fetch subscription and plan information for each user
  const usersWithPlans = await Promise.all(
    users.map(async (user: any) => {
      // Get the user's subscription
      const subscription: any = await Subscription.findOne({ userId: user._id })
        .populate("planId")
        .lean();

      // Calculate remaining days
      let remainingDays: any = null;
      if (subscription) {
        const currentDate = new Date();
        remainingDays = differenceInDays(
          new Date(subscription.endDateTime),
          currentDate
        );
      }

      // Include subscription and plan info in the user object
      return {
        ...user,
        status: user.isActive ? "active" : "inactive", // Assuming user has a field 'isActive'
        subscription: subscription
          ? {
              id: subscription._id,
              plan: subscription.planId.name, // Assuming 'name' field in Plan
              startDateTime: subscription.startDateTime,
              endDateTime: subscription.endDateTime,
              status: subscription.status,
              remainingDays: remainingDays >= 0 ? remainingDays : 0, // If remaining days is negative, set to 0
            }
          : null, // If no subscription found
      };
    })
  );

  // Calculate total pages
  const totalPages = Math.ceil(totalUsers / limit);

  return {
    users: usersWithPlans,
    totalUsers,
    totalPages,
    currentPage: page,
    limit,
  };
}

export async function getUsersByPlan(
  planName: string,
  page: number,
  limit: number
) {
  // Fetch the specified plan
  const plan = await Plan.findOne({ name: planName });

  if (!plan) {
    throw new Error(`Plan "${planName}" not found`);
  }

  // Pagination setup
  const skip = (page - 1) * limit;

  // Find all users subscribed to the specified plan
  const subscriptions = await Subscription.find({ planId: plan._id })
    .populate("userId")
    .skip(skip)
    .limit(limit)
    .lean();

  // Get the total number of subscriptions for this plan (for pagination metadata)
  const totalUsers = await Subscription.countDocuments({ planId: plan._id });

  // Map through subscriptions and return user data with their plan info, excluding password and returning userType as "admin" or "user"
  const usersWithPlan = subscriptions.map((subscription) => {
    const user: any = { ...subscription.userId };
    delete user.password; // Remove password field from user data

    // Calculate the days left in the subscription
    const daysLeft = differenceInDays(
      new Date(subscription.endDateTime),
      new Date()
    );

    // Map userType to "admin" or "user"
    const userTypeString = user.userType === 1 ? "admin" : "user";

    return {
      ...user, // Spread user info
      userType: userTypeString, // Convert userType to string
      subscription: {
        id: subscription._id,
        plan: plan.name,
        status: subscription.status,
        startDateTime: subscription.startDateTime,
        endDateTime: subscription.endDateTime,
        daysLeft: daysLeft >= 0 ? daysLeft : 0, // Return 0 if the days left is negative
      },
    };
  });

  // Calculate total pages
  const totalPages = Math.ceil(totalUsers / limit);

  return {
    users: usersWithPlan,
    totalUsers,
    totalPages,
    currentPage: page,
    limit,
  };
}

function getLastSixMonths() {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = subMonths(now, i);
    months.push({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    });
  }
  return months;
}

export async function getUserRegistrationCountLast6Months() {
  const sixMonthsAgo = subMonths(new Date(), 6);
  const startDate = startOfMonth(sixMonthsAgo);
  const registrationCounts = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ]);
  const lastSixMonths = getLastSixMonths();
  const mergedCounts = lastSixMonths.map((month) => {
    const found = registrationCounts.find(
      (r) => r._id.month === month.month && r._id.year === month.year
    );
    return {
      month: month.month,
      year: month.year,
      count: found ? found.count : 0,
    };
  });

  return mergedCounts;
}

export async function updateUserRoleStatusAndPlan(
  userId: string,
  newUserType: number,
  newStatus: number,
  newPlanName: string
) {
  const user: any = await User.findById(userId);
  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }
  if (![1, 2].includes(newUserType)) {
    throw new Error("Invalid userType");
  }
  user.userType = newUserType;
  if (![1, 2].includes(newStatus)) {
    throw new Error("Invalid status");
  }
  user.status = newStatus;

  await user.save();
  const newPlan = await Plan.findOne({ name: newPlanName });
  if (!newPlan) {
    throw new Error(`Plan "${newPlanName}" not found`);
  }
  const subscription: any = await Subscription.findOne({ userId });
  if (!subscription) {
    throw new Error(`Subscription for user with ID ${userId} not found`);
  }
  subscription.planId = newPlan._id;
  await subscription.save();
  return {
    message: "user updated successfully",
    userId,
    newRole: newUserType === 1 ? "admin" : "user",
    newStatus: newStatus === 1 ? "active" : "inactive",
    newPlan: newPlan.name,
  };
}

export async function updateUserProfile(userId: string, updates: any) {
  const { name, email, password, profileImage } = updates;
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  if (name) user.name = name;
  if (email) user.email = email;
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
  }
  if (profileImage) user.profileImage = profileImage;
  await user.save();
  return {user};
}

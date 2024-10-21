import Token from '../models/tokens';
import { startOfMonth, endOfMonth, subMonths, subDays, startOfDay, endOfDay } from 'date-fns';

// Function to get token usage for the current month and compare it to the previous month
export async function getMonthlyTokenUsage() {
  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());

  const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
  const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

  // Total tokens for the current month
  const currentMonthTokens = await Token.aggregate([
    { $match: { createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd } } },
    { $group: { _id: null, totalTokens: { $sum: "$tokens" } } }
  ]);

  // Total tokens for the previous month
  const lastMonthTokens = await Token.aggregate([
    { $match: { createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
    { $group: { _id: null, totalTokens: { $sum: "$tokens" } } }
  ]);

  const currentTokens = currentMonthTokens[0]?.totalTokens || 0;
  const lastTokens = lastMonthTokens[0]?.totalTokens || 0;

  // Calculate percentage difference
  const percentageChange = lastTokens > 0 ? ((currentTokens - lastTokens) / lastTokens) * 100 : 0;

  return {
    currentMonthTokens: currentTokens,
    lastMonthTokens: lastTokens,
    percentageChange: Number(percentageChange.toFixed(2))
  };
}

// Function to get token usage for the last n days
export async function getTokenUsageForDays(numDays: number) {
    const tokensPerDay = await Token.aggregate([
      {
        $match: {
          createdAt: { $gte: subDays(new Date(), numDays) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalTokens: { $sum: "$tokens" },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by date
      },
    ]);
  
    return tokensPerDay;
}
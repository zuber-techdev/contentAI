"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { authFetch } from "../utils/authFetch";
import { Loader2, XCircle } from "lucide-react";

type TrialUser = {
  id: string;
  name: string;
  email: string;
  daysLeft: number;
  subscriptionId: string;
  isTerminated: boolean;
};

export default function FreeTrialMonitoring() {
  const [trialUsers, setTrialUsers] = useState<Array<TrialUser>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllFreeTrialUsers();
  }, []);

  const fetchAllFreeTrialUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authFetch("/api/users-by-plan?plan=trial");
      if (!response.ok) {
        throw new Error("Failed to fetch all users by plan");
      }
      const data = await response.json();

      const usersData: Array<TrialUser> = data.users.map((user: any) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        daysLeft: user.subscription ? user.subscription.daysLeft : 0,
        subscriptionId: user.subscription ? user.subscription.id : null,
        isTerminated: user.subscription.status === 1 ? false : true,
      }));
      setTrialUsers(usersData);
    } catch (error) {
      setError(
        "An error occurred while fetching all users by plan. Please try again later."
      );
      console.error("Error fetching users by plan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const extendTrial = async (user: TrialUser) => {
    setError(null);
    try {
      const response = await authFetch("/api/subscriptions/extend", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: user.subscriptionId,
          additionalDays: 7,
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to extend free trial for user ${user.name}`);
      }
      const extendedSubscription = await response.json();
      setTrialUsers(
        trialUsers.map((trialUser) =>
          trialUser.id === extendedSubscription.userId
            ? {
                ...trialUser,
                daysLeft: trialUser.daysLeft + 7,
              }
            : trialUser
        )
      );
    } catch (error) {
      console.error("Error extending trial for user", error);
      setError(
        "An error occurred while extending free trial. Please try again later."
      );
    }
  };

  const terminateTrial = async (user: TrialUser) => {
    setError(null);
    try {
      const response = await authFetch(`/api/subscriptions/terminate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: user.subscriptionId,
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to terminate free trial for user ${user.name}`);
      }

      setTrialUsers(
        trialUsers.map((trialUser) =>
          trialUser.id === user.id
            ? {
                ...trialUser,
                isTerminated: true,
                daysLeft: 0,
              }
            : trialUser
        )
      );
    } catch (error) {
      console.error("Error terminating trial for user", error);
      setError(
        "An error occurred while terminating free trial. Please try again later."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="mr-2 h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Days Left</TableHead>
            {/* <TableHead>Engagement</TableHead> */}
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trialUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.isTerminated ? 0 : user.daysLeft}</TableCell>
              <TableCell>
                {user.isTerminated ? (
                  <div className="flex items-center text-red-500">
                    <XCircle className="w-4 h-4 mr-2" />
                    Terminated
                  </div>
                ) : (
                  "Active"
                )}
              </TableCell>
              {/* <TableCell>
                <div className="flex items-center">
                  <Progress value={user.engagement} className="w-[60%] mr-2" />
                  <span>{user.engagement}%</span>
                </div>
              </TableCell> */}
              <TableCell>
                <Button
                  onClick={() => {
                    extendTrial(user);
                  }}
                  variant="outline"
                  className="mr-2"
                  disabled={user.isTerminated}
                >
                  Extend Trial
                </Button>
                <Button
                  onClick={() => terminateTrial(user)}
                  variant="destructive"
                  disabled={user.isTerminated}
                >
                  Terminate Trial
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

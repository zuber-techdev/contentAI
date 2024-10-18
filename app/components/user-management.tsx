"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, Loader2 } from "lucide-react";
import { authFetch } from "../utils/authFetch";

type Status = "active" | "inactive";
type Role = "admin" | "user";
type Plan = "trial" | "pro";
type PlanFilters = "all" | Plan;
type StatusFilter = "all" | Status;
type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  plan: Plan;
  status: Status;
  subscriptionId: string;
  freeAccess: boolean;
};

export default function UserManagement() {
  const [users, setUsers] = useState<Array<User>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState<PlanFilters>("all");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authFetch("/api/get-all-users");
      if (!response.ok) {
        throw new Error("Failed to fetch all users");
      }
      const data = await response.json();

      const usersData: Array<User> = data.users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.subscription.status === 1 ? "active" : "inactive",
        role: user.userType === 1 ? "admin" : "user",
        plan: user.subscription ? user.subscription.plan : "trial",
        subscriptionId: user.subscription ? user.subscription.id : null,
        freeAccess:
          user.subscription &&
          new Date(user.subscription.endDateTime).getFullYear() === 9999
            ? true
            : false,
      }));
      setUsers(usersData);
    } catch (error) {
      setError(
        "An error occurred while fetching all users. Please try again later."
      );
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setError(null);
    setEditingUser(user);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setError(null);
    try {
      const response = await authFetch("/api/update-user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: editingUser.id,
          newUserType: editingUser.role === "admin" ? 1 : 2,
          newPlanName: editingUser.plan,
          newStatus: editingUser.status === "active" ? 1 : 2,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      const updatedUser = await response.json();
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUser.id
            ? {
                ...editingUser,
              }
            : user
        )
      );
      setEditingUser(null);
    } catch (error) {
      setError(
        "An error occurred while updating user data. Please try again later."
      );
      console.error("Error updating user:", error);
    }
  };

  const handleCancelEdit = () => {
    setError(null);
    setEditingUser(null);
  };

  const handleGrantFreeAccess = async (user: User) => {
    setError(null);
    if (!user.subscriptionId) {
      setError("Cannot grant free access: User has no active subscription");
      return;
    }
    try {
      const response = await authFetch("/api/subscriptions/max", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: user.subscriptionId,
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to grant free access to user ${user.name}`);
      }
      const updatedSubscription = await response.json();
      setUsers((prevUsers) =>
        prevUsers.map((userItem) =>
          user.id === userItem.id ? { ...userItem, freeAccess: true } : userItem
        )
      );
    } catch (error) {
      setError(
        "An error occurred while granting free access. Please try again later."
      );
      console.error("Error granting free access:", error);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterPlan === "all" || user.plan === filterPlan) &&
        (filterStatus === "all" || user.status === filterStatus)
    );
  }, [users, searchTerm, filterPlan, filterStatus]);

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
      <div className="flex w-full space-x-2">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => {
            setError(null);
            setSearchTerm(e.target.value);
          }}
          className="max-w-sm flex-1"
        />
        <Select
          value={filterPlan}
          onValueChange={(value: PlanFilters) => {
            setError(null);
            setFilterPlan(value);
          }}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Filter by plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All plans</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filterStatus}
          onValueChange={(value: StatusFilter) => {
            setError(null);
            setFilterStatus(value);
          }}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Free Access</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {editingUser?.id === user.id ? (
                  <Select
                    value={editingUser.role}
                    onValueChange={(value: Role) =>
                      setEditingUser({ ...editingUser, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  user.role
                )}
              </TableCell>
              <TableCell>
                {editingUser?.id === user.id ? (
                  <Select
                    value={editingUser.plan}
                    onValueChange={(value: Plan) =>
                      setEditingUser({ ...editingUser, plan: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  user.plan
                )}
              </TableCell>
              <TableCell>
                {editingUser?.id === user.id ? (
                  <Select
                    value={editingUser.status}
                    onValueChange={(value: Status) =>
                      setEditingUser({ ...editingUser, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  user.status
                )}
              </TableCell>
              <TableCell>
                {user.freeAccess ? (
                  <div className="flex items-center">
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    <span>Granted</span>
                  </div>
                ) : (
                  "Not Granted"
                )}
              </TableCell>
              <TableCell>
                {editingUser?.id === user.id ? (
                  <>
                    <Button
                      variant="outline"
                      className="mr-2"
                      onClick={handleSaveUser}
                    >
                      Save
                    </Button>
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="mr-2"
                      onClick={() => handleEditUser(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleGrantFreeAccess(user)}
                      disabled={user.freeAccess}
                    >
                      Grant Free Access
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
function useMeno(arg0: () => User[], arg1: (string | User[])[]) {
  throw new Error("Function not implemented.");
}

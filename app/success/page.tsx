"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function StripeSuccess() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-center">
            Thank you for your purchase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            You now have access to all features and benefits of the Pro plan.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push("/home")} className="w-full">
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

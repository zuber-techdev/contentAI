"use client";

import { useAuth } from "@/app/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FreeTrial() {
  const router = useRouter();
  const { updateUserPersonaStatus } = useAuth();

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-4xl font-bold text-center">
          7-Day Free Trial
        </CardTitle>
        <p className="text-xl text-center text-muted-foreground">
          Experience the power of our AI content generation
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Whats included:</h2>
          <ul className="space-y-2">
            {[
              "Access to basic AI models",
              "Up to 50 content generations",
              "24/7 customer support",
            ].map((item, index) => (
              <li key={index} className="flex items-center space-x-2">
                <CheckCircle2 className="text-green-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-2">Limitations:</h2>
          <ul className="space-y-2">
            {[
              "Limited to 50 content generations",
              "Basic AI models only",
              "No access to premium features",
            ].map((item, index) => (
              <li key={index} className="flex items-center space-x-2">
                <AlertCircle className="text-yellow-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <p className="text-blue-700">
              After the 7-day trial period, your account will automatically
              switch to our free plan. You can upgrade to a paid plan at any
              time to continue enjoying premium features.
            </p>
          </CardContent>
        </Card>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button
          className="w-full text-lg py-6"
          onClick={() => {
            updateUserPersonaStatus();
            router.push("/home");
          }}
        >
          Start Your Free Trial
        </Button>
        <Link
          href="/home/plans/pricing"
          className="text-center text-muted-foreground hover:underline"
        >
          View full pricing options
        </Link>
      </CardFooter>
    </Card>
  );
}

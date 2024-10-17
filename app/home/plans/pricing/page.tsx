"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import CheckoutButton from "@/components/ui/CheckoutButton";

const stripePublicKey = "price_1Q7AktG8swv4YdckPdweLEZB";

export default function ProPlan() {
  const [isYearly, setIsYearly] = useState(false);

  const monthlyPrice = 249;
  const yearlyPrice = monthlyPrice * 12 * 0.8; // 20% discount

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="space-y-6">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {/* Back to Free Plan */}
          </button>
          <CardTitle className="text-4xl font-bold text-center">
            Plan Pricing
          </CardTitle>
          <div className="flex justify-center items-center space-x-2">
            <span className={isYearly ? "text-muted-foreground" : ""}>
              Monthly
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={!isYearly ? "text-muted-foreground" : ""}>
              Yearly (Save 20%)
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-3xl font-bold">Pro</h2>
              <p className="text-4xl font-bold mt-2">
                ${isYearly ? Math.round(yearlyPrice / 12) : monthlyPrice}
                <span className="text-xl font-normal text-muted-foreground">
                  /month
                </span>
              </p>
              <p className="text-muted-foreground mt-1">Unlimited posts</p>
            </div>
            <ul className="space-y-2 inline-block text-left">
              {[
                "Custom analytics",
                "Unlimited users",
                "Content calendar",
                "AI writing assistant",
                "API access",
              ].map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle2 className="text-green-500 h-5 w-5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          {/* <Button className="w-full text-lg py-6">Start Plan</Button> */}
          <CheckoutButton priceId={stripePublicKey} />
        </CardFooter>
      </Card>
    </div>
  );
}

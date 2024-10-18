import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import { Button } from "./button";
import { authFetch } from "@/app/utils/authFetch";
import { toast } from "@/hooks/use-toast";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(stripePublishableKey || "");

export default function CheckoutButton({ priceId }: { priceId: string }) {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });
      const { sessionId } = await res.json();

      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: `${error}`,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className="w-full text-lg py-6"
    >
      {loading ? "Loading..." : "Subscribe"}
    </Button>
  );
}

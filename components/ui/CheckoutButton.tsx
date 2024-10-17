import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import { Button } from "./button";

const stripePromise = loadStripe(process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutButton({ priceId }: { priceId: string }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priceId }),
    });
    const { sessionId } = await res.json();

    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({ sessionId });
    setLoading(false);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className="w-full text-lg py-6"
    >
      {loading ? "Loading..." : "Start Plan"}
    </Button>
  );
}

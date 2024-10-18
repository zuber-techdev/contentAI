"use client";

import PricingPlan from "@/app/components/pricing-plan";

export default function ProPlan() {
  return (
    <div className="container mx-auto py-10">
      <PricingPlan parent={false} handleCancel={() => window.history.back()} />
    </div>
  );
}

import { isTestEnv } from "../../../../../common/src/utils/environments";
import { userFacingErrorMsg } from "../../../../../common/src/utils/errors";
import { resIsSuccess } from "../../../../../common/src/utils/httpStatus";
import { useRouter } from "next/navigation";
import React, { forwardRef, useEffect, useState } from "react";
import { cn } from "../../../../../common/src/lib/utils";
import { toast } from "../../../../../common/src/components/ui/sonner";
import { PlanCard, PlanCardProps } from "./PlanCard";

export interface planItem {
  id: string | number;
  title: string;
  link?: string;
  confirmChange?: boolean;
  price?: string | number;
  priceId?: string;
  costPeriod: string;
  description: string;
  includes: string[];
  preIncludesText: string;
  isCurrentPlan: boolean;
  isSelected?: boolean;
}

export const plans: planItem[] = [
  {
    id: 1,
    title: "Resident",
    confirmChange: true,
    price: "Free",
    costPeriod: "",
    description: `For testing and getting started with ${process.env.NEXT_PUBLIC_APP_TITLE}. `,
    preIncludesText: "Includes:",
    includes: [
      "1 specialist user account",
      "No hygiene user accounts",
      "No staff user accounts",
      "1 static example clinic location",
      "Unlimited letters & notes",
    ],
    isCurrentPlan: false,
  },
  {
    id: 2,
    title: "Specialist Plan",
    price: 279,
    link: isTestEnv() ? "https://buy.stripe.com/test_fZe03pbkyeCd6CkbIK" : "",
    priceId: "price_1QS1zOAUSrACHVzPSeUmrjSV",
    costPeriod: "/month",
    description:
      "Enhance your workflow with advanced AI writing tools perfect for practices wanting to increase productivity and build stronger referral relationships.",
    preIncludesText: "Includes:",
    includes: ["Unlimited letters & notes", "Advanced AI writing tools", "Free hygiene & staff users", "1 clinic location"],
    isCurrentPlan: false,
  },
  {
    id: 3,
    title: "Enterprise",
    link: `https://${process.env.NEXT_PUBLIC_MARKETING_DOMAIN_NAME}/contact`,
    costPeriod: "Let's chat",
    description: "Ideal for multi-location, high-volume clinics with multiple specialists and larger teams.",
    preIncludesText: "Drive your organization with:",
    includes: [
      "Unlimited specialist user accounts",
      "Unlimited hygiene user accounts",
      "Unlimited staff user accounts",
      "Unlimited clinic locations",
      "Unlimited letters & notes",
    ],
    isCurrentPlan: false,
  },
];

interface PlanCarousalProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  user?: any;
  showPlansTitled?: planItem["title"][];
  planCardProps?: Partial<PlanCardProps>;
  showPlansTitleIncludes?: string[];
  showDisclaimer?: boolean;
  selectedIndex?: number;
}

export const PlanCarousal = forwardRef<HTMLDivElement, PlanCarousalProps>(
  ({ className, user, showPlansTitled, showPlansTitleIncludes, planCardProps, showDisclaimer = true, selectedIndex = undefined, ...props }, ref) => {
    const router = useRouter();
    const [currentPlanId, setCurrentPlanId] = useState<number | null>(null);

    const handlePlanSelect = async (plan: planItem, numUsers: number) => {
      if (typeof plan.price === "number") {
        //the user can pay for this plan
        if (!user?.stripeCustomerId) {
          //get customer id
          try {
            debugger;
            //gets the customer id from stripe linked to email
            const res = await fetch("/api/stripe/postStripeCustomer", {
              method: "POST",
              body: JSON.stringify({}),
            });
            console.log("res", res);
            debugger;
            const resData = await res.json();
            if (!resIsSuccess(resData)) {
              console.log("Error creating customer account", res);
              toast({
                title: "Error",
                message: "Could not create a customer account",
                type: "error",
              });
              return;
            } else {
              user = { ...user, stripeCustomerId: resData?.data?.stripeCustomerId } as any;
            }
          } catch (error) {
            console.log("Error creating customer account", error);
            toast({
              title: "Error",
              message: "Could not create a customer account",
              type: "error",
            });
            return;
          }
        }

        try {
          //get the checkoutSession
          const res = await fetch("/api/stripe/checkoutSession", {
            method: "POST",
            body: JSON.stringify({ quantity: numUsers }),
          });
          const resData = await res.json();
          const checkoutUrl = resData?.data?.session?.url;
          if (checkoutUrl) {
            router.push(checkoutUrl);
          } else {
            throw Error("No checkout url found");
          }
        } catch (error) {
          toast({
            title: "Error",
            message: userFacingErrorMsg(error),
            type: "error",
          });
        }

        return;
        //send user to stripe checkout
        //if (plan.link !== undefined) router.push(plan?.link);
        return;
      } else if (plan.link) {
        router.push(plan.link);
      } else {
        console.log("what is plan", plan);
      }
    };

    const plansToShow = plans.filter(
      (plan) =>
        (!showPlansTitled || showPlansTitled?.includes(plan.title)) &&
        (!showPlansTitleIncludes || showPlansTitleIncludes.some((title) => plan.title.includes(title)))
    );

    return (
      <div className={cn("w-full", className)}>
        {!user?.subscriptionId && (
          <div className="p-0">
            <p className="text-lg text-secondary-dark"></p>
          </div>
        )}
        <div className={cn("flex justify-center gap-4 md:flex-grow md:flex-row", plansToShow.length > 1 && "flex-col")}>
          {plansToShow.map((plan, index) => (
            <div key={plan.id} className="max-w-[338px] flex-1">
              <PlanCard
                {...planCardProps}
                key={plan.id}
                plan={{ ...plan, isSelected: selectedIndex !== undefined ? index === selectedIndex : plan.isSelected }}
                checkClassName={cn("text-purple")}
                onSelectPlan={handlePlanSelect}
                allowQuantitySelect={false}
                showTrial={true}
              />
            </div>
          ))}
        </div>
        {showDisclaimer && (
          <div className="mx-auto flex w-full justify-center pt-2 text-sm text-secondary-dark">
            <p>Prices are exclusive of applicable taxes. No commitment. Cancel anytime.</p>
          </div>
        )}
      </div>
    );
  }
);

PlanCarousal.displayName = "PlanCarousal";

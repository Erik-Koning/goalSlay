import React, { useEffect, useState } from "react";
import { forwardRef } from "react";
import { cn } from "../../../../../common/src/lib/utils";
import { DecoratedTextSpan } from "../../../../../common/src/components/ui/DecoratedTextSpan";
import { Button } from "../../../../../common/src/components/ui/Button";
import { NumericSelect } from "../../../../../common/src/components/inputs/NumericSelect";
import { CheckCircle, Pencil } from "lucide-react";
import { planItem } from "./PlanCarousal";

export interface PlanCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  titleClassName?: string;
  decoratedTextClassName?: string;
  checkClassName?: string;
  plan: planItem;
  onSelectPlan?: (plan: planItem, numUsers: number) => void;
  allowQuantitySelect?: boolean;
  showTrial?: boolean;
  allowSelectPlan?: boolean;
}

export const PlanCard = forwardRef<HTMLDivElement, PlanCardProps>(
  (
    {
      className,
      titleClassName,
      decoratedTextClassName,
      checkClassName,
      plan,
      allowSelectPlan = true,
      onSelectPlan,
      allowQuantitySelect = true,
      showTrial = false,
      ...props
    },
    ref
  ) => {
    const [numUsers, setNumUsers] = useState("1");

    const isEnterprise = plan.title.includes("Enterprise");
    const isSpecialist = plan.title === "Specialist";
    const isCurrentPlan = plan.isCurrentPlan;

    const useFontCheck = false;

    function handleNumUsersSelect(e: React.ChangeEvent<HTMLInputElement>) {
      const value = e.target.value;
      console.log("handleNumUsersSelect", value);
      const x = Number(numUsers);
      if (value) {
        setNumUsers(String(value));
      } else setNumUsers("1");
    }

    function getCostAdditionalUsers(): number {
      const addUsers = Number(numUsers) - 2;
      if (addUsers <= 0) return 0;
      return addUsers * 149;
    }

    return (
      <div
        className={cn(
          "relative my-4 flex flex-col justify-between rounded-lg border px-6 py-5",
          isCurrentPlan ? "border-purple bg-violet-100" : "border-gray-300",
          plan.isSelected ? "border-2 border-purple" : "",
          className
        )}
      >
        {/* If it's the current plan, add a border around the card and a title at the top */}
        {isCurrentPlan && (
          <>
            <div className="absolute inset-0 rounded-lg outline outline-4 outline-purple">
              <div className="absolute top-0 w-full -translate-y-[30px] transform rounded-t-lg border-purple bg-purple px-4 py-1 pb-[5px] text-center font-bold text-primary-light outline outline-[5px] -outline-offset-1 outline-purple">
                <h2>CURRENT PLAN</h2>
              </div>
            </div>
          </>
        )}{" "}
        <div>
          <h2
            className={cn(
              "font-aleo text-4xl font-bold text-skyBlue",
              { "text-purple": isCurrentPlan || plan.isSelected, "text-primary-dark": isEnterprise },
              titleClassName
            )}
          >
            {plan.title}
          </h2>
          <div className="mt-3">
            {showTrial ? (
              <div className="text-align-baseline">
                <p className="text-xl font-bold text-offBlack">{"7-day free trial"}</p>
                <p className="text-sm text-tertiary-dark">{`then only C$${plan.price}/specialist/month`}</p>
              </div>
            ) : (
              <div className="text-align-baseline flex">
                <p className=" text-xl font-bold">
                  {typeof plan.price === "number" ? `$${String(plan.price + getCostAdditionalUsers())}` : plan.price ?? ""}
                </p>
                <p className=" text-lg text-secondary-dark">{plan.costPeriod}</p>
              </div>
            )}

            {isSpecialist && allowQuantitySelect && (
              <div className="flex justify-start pt-1">
                <NumericSelect
                  labelIcon={<Pencil size={12} />}
                  labelMode={true}
                  showDecrease={false}
                  minNumber={2}
                  className=""
                  label="Number of Users:"
                  onChange={handleNumUsersSelect}
                />
              </div>
            )}
          </div>
          <p className="my-3.5 text-sm leading-6 text-offBlack">{plan.description}</p>
          <h3 className="my-2 text-base font-bold text-offBlack">{plan.preIncludesText}</h3>
          <ul className="space-y-1.5">
            {plan.includes.map((item: any, index: any) => (
              <li key={index} className="flex items-center space-x-2">
                {useFontCheck ? (
                  <span className={cn("font-normal", checkClassName)}>✔</span>
                ) : (
                  <CheckCircle className={cn("text-primary-dark", checkClassName)} style={{ fontSize: 17 }} />
                )}
                <DecoratedTextSpan
                  text={item}
                  regex={/\b\d+\b|Unlimited|Add\s+more|Free\s+trial|7-day|Advanced\s+AI|Free\s+hygiene\s+&\s+staff/g}
                  decoratedTextClassName={cn(
                    "text-skyBlue font-bold",
                    { "text-purple": isCurrentPlan || plan.isSelected, "text-primary-dark": isEnterprise },
                    decoratedTextClassName
                  )}
                />
              </li>
            ))}
          </ul>
        </div>
        {allowSelectPlan && !plan.isSelected && (
          <Button
            onClick={() => {
              onSelectPlan && onSelectPlan(plan, Number(numUsers));
            }}
            variant={"purple"}
            className={`mt-6 w-full max-w-[300px] self-center rounded-md px-4 py-2 font-semibold ${
              isCurrentPlan ? "bg-purple-600 pointer-events-none text-primary-dark hover:bg-transparent" : "bg-blue-500 text-primary-light"
            }`}
          >
            {isCurrentPlan ? "Current Plan" : "Select Plan"}
          </Button>
        )}
      </div>
    );
  }
);

PlanCard.displayName = "PlanCard";

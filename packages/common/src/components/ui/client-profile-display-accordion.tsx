"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { Input } from "@common/components/inputs/Input";
import { Label } from "@common/components/ui/Label";
import { Checkbox } from "@common/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@common/components/ui/accordion";
import { User, MapPin, Briefcase, DollarSign, TrendingUp, AlertTriangle, FileText, Shield, HelpCircle, type LucideIcon } from "lucide-react";
import { withWrapper } from "@common/utils/react";
import DateInput from "../inputs/DateInput";
import { cn } from "@common/lib/utils";
import { gradientClassName } from "@common/lib/tailwind/classNames";
import { LoadingProcess } from "./loading-process";
import { Button } from "./Button";
import { Badge } from "./badge";

interface ClientProfileDisplayProps {
  clientProfile: { [key: string]: any } | string;
  summary: string;
  openSections?: string[];
  defaultAllOpen?: boolean;
  onOpenSectionsChange?: (sections: string[]) => void;
  additionalSections?: Array<{
    id: string;
    title: string;
    icon?: LucideIcon | string;
    content: React.ReactNode;
  }>;
  register?: any;
  errors?: any;
}

function formatLabel(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function parseStringifiedObject(value: string): any {
  try {
    // Handle stringified objects that use single quotes
    const normalizedValue = value.replace(/'/g, '"').replace(/True/g, "true").replace(/False/g, "false");
    return JSON.parse(normalizedValue);
  } catch {
    return value;
  }
}

function parseStringifiedArray(value: string): any {
  try {
    // Handle stringified arrays that use single quotes
    const normalizedValue = value.replace(/'/g, '"');
    return JSON.parse(normalizedValue);
  } catch {
    return value;
  }
}

function isDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) || /^\d{4}-\d{2}-\d{2}T/.test(value);
}

function isStringifiedObject(value: string): boolean {
  return typeof value === "string" && value.startsWith("{") && value.endsWith("}");
}

function isStringifiedArray(value: string): boolean {
  return typeof value === "string" && value.startsWith("[") && value.endsWith("]");
}

function renderValue(key: string, value: any, register?: any, errors?: any, isLast?: boolean, depth?: number): React.ReactNode {
  // Handle null or undefined
  if (value === null || value === undefined) {
    return (
      <div className="space-y-2">
        <Label htmlFor={key} className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {formatLabel(key)}
        </Label>
        <Input id={key} {...(register ? register(key) : {})} defaultValue="" placeholder="No data" className="bg-muted/30 border-0 h-10" />
        {errors?.[key] && <p className="text-xs text-destructive">{errors[key].message}</p>}
      </div>
    );
  }

  // Handle booleans
  if (typeof value === "boolean") {
    return (
      <div className="space-y-2">
        <Label htmlFor={key} className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {formatLabel(key)}
        </Label>
        <div className="flex items-center space-x-2 h-10">
          <Checkbox id={key} defaultChecked={value} {...(register ? register(key) : {})} />
        </div>
        {errors?.[key] && <p className="text-xs text-destructive">{errors[key].message}</p>}
      </div>
    );
  }

  // Handle stringified objects
  if (typeof value === "string" && isStringifiedObject(value)) {
    const parsedObject = parseStringifiedObject(value);
    if (typeof parsedObject === "object") {
      return renderValue(key, parsedObject, register, errors, isLast, depth ?? 0 + 1);
    }
  }

  // Handle stringified arrays
  if (typeof value === "string" && isStringifiedArray(value)) {
    const parsedArray = parseStringifiedArray(value);
    if (Array.isArray(parsedArray)) {
      return renderValue(key, parsedArray, register, errors, isLast, depth ?? 0 + 1);
    }
  }

  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{formatLabel(key)}</Label>
          <div className="text-sm text-muted-foreground italic">No items</div>
        </div>
      );
    }

    // Check if it's an array of objects
    if (value.every((item) => typeof item === "object" && item !== null)) {
      return (
        <div className="space-y-3 col-span-full">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{formatLabel(key)}</Label>
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 border-b">
              <div className="grid grid-cols-4 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {Object.keys(value[0]).map((objKey) => (
                  <div key={objKey}>{formatLabel(objKey)}</div>
                ))}
              </div>
            </div>
            {value.map((item, index) => (
              <div key={index} className="px-4 py-3 border-b last:border-b-0">
                <div className="grid grid-cols-4 gap-4 text-sm">
                  {Object.entries(item).map(([objKey, objValue]) => (
                    <div key={objKey} className="truncate">
                      {String(objValue)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Handle array of primitives
    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{formatLabel(key)}</Label>
        <div className="space-y-1">
          {value.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-muted-foreground rounded-full flex-shrink-0" />
              <span className="text-sm">{String(item)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle objects
  if (typeof value === "object") {
    const objectKeys = Object.keys(value);
    const keyCount = objectKeys.length;
    const spanClass = keyCount > 4 || isLast ? "col-span-full" : "col-span-2 lg:col-span-2";

    return (
      <div className={`space-y-3 ${spanClass}`}>
        {(depth ?? 0) > 0 && <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{formatLabel(key)}</Label>}
        <div key={key} id={key} className="bg-muted/20 rounded-lg p-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(value).map(([subKey, subValue]) => {
            const renderedValue = renderValue(subKey, subValue, register, errors, isLast, depth ?? 0 + 1);
            return withWrapper(renderedValue, subKey);
          })}
        </div>
      </div>
    );
  }

  // Handle strings, numbers, and dates
  const stringValue = String(value);
  const inputType = isDate(stringValue) ? "date" : typeof value === "number" ? "number" : "text";

  return (
    <div className="space-y-2">
      <Label htmlFor={key} className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {formatLabel(key)}
      </Label>
      {inputType === "date" ? (
        <DateInput format="YYYY-MM-DD" id={key} {...(register ? register(key) : {})} defaultValue={stringValue} className="bg-muted/30 border-0 h-10" />
      ) : (
        <Input id={key} type={inputType} {...(register ? register(key) : {})} defaultValue={stringValue} className="bg-muted/30 border-0 h-10" />
      )}
      {errors?.[key] && <p className="text-xs text-destructive">{errors[key].message}</p>}
    </div>
  );
}

function groupFields(clientProfile: { [key: string]: any }) {
  const groups: {
    [key: string]: {
      fields: { [key: string]: any };
      icon: LucideIcon | string;
    };
  } = {
    "Personal Information": { fields: {}, icon: User },
    "Contact & Address": { fields: {}, icon: MapPin },
    Employment: { fields: {}, icon: Briefcase },
    "Financial Position": { fields: {}, icon: DollarSign },
    "Investment Profile": { fields: {}, icon: TrendingUp },
    "Risk Assessment": { fields: {}, icon: AlertTriangle },
    "Tax Accounts": { fields: {}, icon: FileText },
    "Account Information": { fields: {}, icon: FileText },
    "Compliance & Documentation": { fields: {}, icon: Shield },
    Other: { fields: {}, icon: HelpCircle },
  };

  Object.entries(clientProfile).forEach(([key, value]) => {
    if (key.includes("name") || key.includes("birth") || key === "age" || key.includes("marital") || key.includes("spouse") || key.includes("dependent")) {
      groups["Personal Information"].fields[key] = value;
    } else if (key.includes("address") || key.includes("contact") || key.includes("phone") || key.includes("email")) {
      groups["Contact & Address"].fields[key] = value;
    } else if (key.includes("employ") || key.includes("job") || key.includes("industry") || key.includes("income")) {
      groups["Employment"].fields[key] = value;
    } else if (key.includes("asset") || key.includes("liabilit") || key.includes("net_worth") || key.includes("source")) {
      groups["Financial Position"].fields[key] = value;
    } else if (key.includes("investment") || key.includes("objective") || key.includes("preference") || key.includes("goal") || key.includes("horizon")) {
      groups["Investment Profile"].fields[key] = value;
    } else if (key.includes("risk") || key.includes("tolerance")) {
      groups["Risk Assessment"].fields[key] = value;
    } else if (key.includes("tax") || key.includes("account")) {
      groups["Tax Accounts"].fields[key] = value;
    } else if (key.includes("account") || key.includes("client_id") || key.includes("advisor") || key.includes("branch")) {
      groups["Account Information"].fields[key] = value;
    } else if (
      key.includes("kyc") ||
      key.includes("verification") ||
      key.includes("document") ||
      key.includes("signature") ||
      key.includes("compliance")
    ) {
      groups["Compliance & Documentation"].fields[key] = value;
    } else {
      groups["Other"].fields[key] = value;
    }
  });

  // Remove empty groups
  return Object.fromEntries(Object.entries(groups).filter(([_, group]) => Object.keys(group.fields).length > 0));
}

export function ClientProfileDisplay({
  clientProfile,
  summary,
  defaultAllOpen = true,
  onOpenSectionsChange,
  additionalSections = [],
  register,
  errors,
}: ClientProfileDisplayProps) {
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // Handle string clientProfile (fallback to original display)
  if (typeof clientProfile === "string") {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Client Profile
              <Badge variant="secondary">Loaded</Badge>
            </CardTitle>
            <CardDescription>Comprehensive client information and financial background</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-muted-foreground leading-relaxed">{clientProfile}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const groupedFields = groupFields(clientProfile);

  // Create default open sections (all sections open by default)
  const defaultOpenSections = defaultAllOpen ? [...Object.keys(groupedFields), ...additionalSections.map((section) => section.id)] : [];

  const handleAccordionItemClick = (value: string[]) => {
    debugger;
    setOpenSections(value);
    onOpenSectionsChange && onOpenSectionsChange(value);
  };

  function onComplete() {
    console.log("onComplete");
    setIsComplete(true);
  }

  return (
    <>
      {!isComplete ? (
        <LoadingProcess items={[]} onComplete={onComplete} />
      ) : (
        <>
          <div className="space-y-6 w-full">
            {/* Accordion Sections */}
            <Accordion type="multiple" value={openSections || defaultOpenSections} onValueChange={handleAccordionItemClick} className="space-y-4 mt-4">
              {/* Dynamic Field Groups */}
              {Object.entries(groupedFields).map(([groupName, group]) => {
                const IconComponent = group.icon;
                const isStringIcon = typeof IconComponent === "string";

                return (
                  <AccordionItem
                    key={groupName}
                    value={groupName}
                    className="border-0 overflow-hidden rounded-lg"
                    //onClick={() => handleAccordionItemClick(groupName)}
                  >
                    <AccordionTrigger
                      className={cn(
                        "bg-[#d64545] hover:bg-[#c23d3d] text-white px-6 py-4 hover:no-underline rounded-t-lg data-[state=closed]:rounded-b-lg transition-all",
                        gradientClassName
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {isStringIcon ? <span className="text-2xl">{IconComponent}</span> : <IconComponent className="h-5 w-5" />}
                        <span className="font-semibold text-base">{groupName}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-background border border-t-0 rounded-b-lg">
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {Object.entries(group.fields).map(([key, value], index) => {
                            const isLast = index === Object.entries(group.fields).length - 1;
                            const itemKey = groupName + "-" + key;
                            return withWrapper(renderValue(itemKey, value, register, errors, isLast, 0), itemKey, isLast ? "col-span-full" : "");
                          })}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}

              {/* Additional Custom Sections */}
              {additionalSections.map((section) => {
                const IconComponent = section.icon;
                const isStringIcon = typeof IconComponent === "string";

                return (
                  <AccordionItem
                    key={section.id}
                    value={section.id}
                    className="border-0 overflow-hidden rounded-lg"
                    //onClick={() => handleAccordionItemClick(section.id)}
                  >
                    <AccordionTrigger
                      className={cn(
                        "bg-[#d64545] hover:bg-[#c23d3d] text-white px-6 py-4 hover:no-underline rounded-t-lg data-[state=closed]:rounded-b-lg transition-all",
                        gradientClassName
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {IconComponent && (isStringIcon ? <span className="text-2xl">{IconComponent}</span> : <IconComponent className="h-5 w-5" />)}
                        <span className="font-semibold text-base">{section.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-background border border-t-0 rounded-b-lg">
                      <div className="p-6">{section.content}</div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
          <div className="flex w-full justify-center mt-1">
            <Button
              variant="ghost"
              className="rounded-lg py-0"
              onClick={() => {
                setOpenSections(openSections.length === Object.keys(groupedFields).length ? [] : Object.keys(groupedFields));
              }}
            >
              {openSections.length === Object.keys(groupedFields).length ? "Hide All" : "Show All"}
            </Button>
          </div>
        </>
      )}
    </>
  );
}

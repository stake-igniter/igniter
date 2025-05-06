"use client";
import { Button } from "@igniter/ui/components/button";
import { defineStepper } from "@stepperize/react";
import React from "react";
import { cn } from "@igniter/ui/lib/utils";
import { ApplicationSettings } from "@/db/schema";
import { completeSetup } from "@/actions/ApplicationSettings";
import ConfigureAppSettings from "./ConfigureAppSettings";
import ConfigureAddressGroup from "./ConfigureAddressGroups";
import ConfigureServices from "@/app/admin/setup/ConfigureServices";

interface StepperProps {
  settings: Partial<ApplicationSettings>;
}

const { useStepper, steps, utils } = defineStepper(
  {
    id: "application-settings",
    title: "General Settings",
  },
  {
    id: "services",
    title: "Select Provided Services"
  },
  {
    id: "address-groups",
    title: "Address Groups",
  },
  {
    id: "complete-bootstrap",
    title: "Finish",
  }
);

const BootstrapCompleteComponent = () => {
  return <h3 className="text-lg py-4">System Bootstrap complete!</h3>;
};

export const Stepper: React.FC<StepperProps> = ({ settings }) => {
  const stepper = useStepper();

  const currentIndex = utils.getIndex(stepper.current.id);

  return (
    <>
      <div className="space-y-6 p-6 min-h-[400] flex flex-col justify-between">
        <div className="flex flex-col gap-5">
          <div className="flex justify-between">
            <h2 className="text-lg font-medium">System Bootstrap</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Step {currentIndex + 1} of {steps.length}
              </span>
              <div />
            </div>
          </div>
          <nav aria-label="Bootstrap Steps" className="group my-4">
            <ol
              className="flex items-center justify-between gap-5"
              aria-orientation="horizontal"
            >
              {stepper.all.map((step, index) => (
                <React.Fragment key={step.id}>
                  <li className="flex items-center gap-4 flex-shrink-0">
                    <Button
                      type="button"
                      role="tab"
                      variant={index <= currentIndex ? "default" : "secondary"}
                      aria-current={
                        stepper.current.id === step.id ? "step" : undefined
                      }
                      aria-posinset={index + 1}
                      aria-setsize={steps.length}
                      aria-selected={stepper.current.id === step.id}
                      className="flex size-10 items-center justify-center rounded-full border border-primary-foreground"
                    >
                      {index < currentIndex ? "✓" : index + 1}
                    </Button>
                    <span
                      className={cn("text-sm text-secondary-foreground", {
                        "font-medium": index <= currentIndex,
                      })}
                    >
                      {step.title}
                    </span>
                  </li>
                </React.Fragment>
              ))}
            </ol>
          </nav>
        </div>

        <div className="space-y-5">
          {stepper.switch({
            "application-settings": () => (
              <ConfigureAppSettings defaultValues={settings} goNext={stepper.next} />
            ),
            "services": () => (
              <ConfigureServices
                goNext={stepper.next}
                goBack={stepper.prev}
              />
            ),
            "address-groups": () => (
              <ConfigureAddressGroup
                goNext={stepper.next}
                goBack={stepper.prev}
              />
            ),
            "complete-bootstrap": () => <BootstrapCompleteComponent />,
          })}
        </div>

        {stepper.current.id === "complete-bootstrap" && (
          <div className="flex justify-end gap-4">
            <Button onClick={completeSetup}>Complete</Button>
          </div>
        )}
      </div>
    </>
  );
};

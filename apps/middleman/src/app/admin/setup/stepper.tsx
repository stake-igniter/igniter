"use client";
import { Button } from "@igniter/ui/components/button";
import { Checkbox } from "@igniter/ui/components/checkbox";
import { defineStepper } from "@stepperize/react";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@igniter/ui/lib/utils";
import { ApplicationSettings } from "@/db/schema";
import { Label } from "@igniter/ui/components/label";
import { completeSetup } from "@/actions/ApplicationSettings";
import ApplicationSettingsForm from "./settingsForm";
import { Provider } from "@/actions/Providers";
import ProvidersForm from "./providersForm";

interface StepperProps {
  providers: Provider[];
  settings: Partial<ApplicationSettings>;
}

const { useStepper, steps, utils } = defineStepper(
  {
    id: "application-settings",
    title: "Application Settings and Branding",
  },
  {
    id: "configure-providers",
    title: "Configure Providers",
  },
  {
    id: "complete-bootstrap",
    title: "Complete",
  }
);

const AdminUserComponent = ({ address }: { address: string }) => {
  return (
    <div className="grid gap-4">
      <h4>
        System owner created with address:{" "}
        <span className="font-mono text-sm">{address}</span>{" "}
      </h4>
    </div>
  );
};

const ApplicationSettingsComponent: React.FC<{
  settings: Partial<ApplicationSettings>;
  goNext: () => void;
}> = ({ settings, goNext }) => {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <h4>Fill out your system settings:</h4>
        <ApplicationSettingsForm defaultValues={settings} goNext={goNext} />
      </div>
    </div>
  );
};

const ProvidersComponent: React.FC<{
  providers: Provider[];
  goNext: () => void;
  goBack: () => void;
}> = ({ providers, goNext, goBack }) => {
  return (
    <div className="grid gap-4">
      <h4>Select supported providers from list:</h4>
      <ProvidersForm providers={providers} goNext={goNext} goBack={goBack} />
    </div>
  );
};

const BootstrapCompleteComponent = () => {
  return <h3 className="text-lg py-4">System Bootstrap complete!</h3>;
};

export const Stepper: React.FC<StepperProps> = ({ settings, providers }) => {
  const stepper = useStepper();

  const currentIndex = utils.getIndex(stepper.current.id);

  return (
    <>
      <div className="space-y-6 p-6 border rounded-lg min-h-[400] flex flex-col justify-between">
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
              <ApplicationSettingsComponent
                settings={settings}
                goNext={stepper.next}
              />
            ),
            "configure-providers": () => (
              <ProvidersComponent
                providers={providers}
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

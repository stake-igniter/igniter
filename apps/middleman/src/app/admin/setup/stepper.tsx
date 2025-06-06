"use client";
import { Button } from "@igniter/ui/components/button";
import { Progress } from "@igniter/ui/components/progress";
import { CheckIcon } from "@igniter/ui/assets";
import { defineStepper } from "@stepperize/react";
import React from "react";
import { cn } from "@igniter/ui/lib/utils";
import { ApplicationSettings } from "@/db/schema";
import { completeSetup } from "@/actions/ApplicationSettings";
import ApplicationSettingsForm from "./settingsForm";
import { Provider } from "@/actions/Providers";
import ProvidersForm from "./providersForm";
import BlockchainFormComponent from '@/app/admin/setup/blockchainFrom'

interface StepperProps {
  providers: Provider[];
  settings: Partial<ApplicationSettings>;
}

const { useStepper, steps, utils } = defineStepper(
  {
    id: "blockchain",
    title: "Blockchain Settings",
  },
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
      <ApplicationSettingsForm defaultValues={settings} goNext={goNext} />
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
    <div className="space-y-6 p-6 border rounded-lg min-h-[400px] flex flex-col justify-between">
        <div className="flex flex-col gap-5">
          <div className="flex justify-between">
            <h2 className="text-lg font-medium">System Setup</h2>
          </div>
          <nav aria-label="Bootstrap Steps" className="group my-4">
            <ol
              className="flex items-center justify-between gap-5"
              aria-orientation="horizontal"
            >
              {stepper.all.map((step, index) => (
                <React.Fragment key={step.id}>
                  <li className="flex flex-col items-center gap-4 flex-shrink-0">
                    <Button
                      type="button"
                      role="tab"
                      aria-current={
                        stepper.current.id === step.id ? "step" : undefined
                      }
                      aria-posinset={index + 1}
                      aria-setsize={steps.length}
                      aria-selected={stepper.current.id === step.id}
                      className={cn(
                        "flex size-11 items-center justify-center rounded-full border pointer-events-none",
                        {
                          "bg-blue-1/70 ring-2 ring-blue-1/70 ring-offset-3 ring-offset-background":
                            stepper.current.id === step.id,
                          "bg-success/70": index < currentIndex,
                          "bg-primary": index > currentIndex,
                        }
                      )}
                    >
                      {index < currentIndex ? <CheckIcon /> : null}
                    </Button>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-sm text-muted-foreground tracking-wider uppercase">
                        Step {index + 1}
                      </span>
                      <span className="text-md text-secondary-foreground font-medium">
                        {step.title}
                      </span>
                      <span
                        className={cn(
                          "text-sm",
                          index < currentIndex
                            ? "text-success"
                            : index === currentIndex
                              ? "text-blue-1"
                              : "text-muted-foreground"
                        )}
                      >
                        {index < currentIndex
                          ? "Completed"
                          : index === currentIndex
                            ? "In Progress"
                            : "Pending"}
                      </span>
                    </div>
                  </li>
                  {index < stepper.all.length - 1 && (
                    <li className="flex-grow">
                      <Progress
                        value={
                          index < currentIndex
                            ? 100
                            : index === currentIndex
                              ? 50
                              : 0
                        }
                        className={cn("w-[80%] m-auto", {
                          "[&>*]:bg-success/70": index < currentIndex,
                        })}
                      />
                    </li>
                  )}
                </React.Fragment>
              ))}
            </ol>
          </nav>
        </div>

        <div className="space-y-5">
          {stepper.switch({
            "blockchain": () => (
              <BlockchainFormComponent
                defaultValues={settings}
                goNext={stepper.next}
              />
            ),
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
  );
};

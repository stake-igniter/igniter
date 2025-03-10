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
import ApplicationSettingsForm from "./form";
import { Provider } from "@/actions/Providers";

interface StepperProps {
  providers: Provider[];
  settings: Partial<ApplicationSettings>;
}

const { useStepper, steps, utils } = defineStepper(
  {
    id: "owner-user",
    title: "Created Owner User",
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
  goToNextStep: () => void;
}> = ({ settings, goToNextStep }) => {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <h4>Fill out your system settings:</h4>
        <ApplicationSettingsForm
          defaultValues={settings}
          goToNextStep={goToNextStep}
        />
      </div>
    </div>
  );
};

const ProvidersComponent: React.FC<{ providers: Provider[] }> = ({
  providers,
}) => {
  const [providerStates, setProviderStates] = useState(
    providers.map((provider) => ({ ...provider, enabled: true }))
  );

  const handleCheckboxChange = (id: string) => {
    setProviderStates((prevStates) =>
      prevStates.map((provider) =>
        provider.id === id
          ? { ...provider, enabled: !provider.enabled }
          : provider
      )
    );
  };

  return (
    <div className="grid gap-4">
      <h4>Select supported providers from list:</h4>
      <div className="grid gap-4">
        {providerStates.map((provider) => (
          <div key={provider.id} className="flex items-center gap-2">
            <Checkbox
              id={`provider-${provider.id}`}
              checked={provider.enabled}
              onCheckedChange={() => handleCheckboxChange(provider.id)}
            />
            <Label htmlFor={`provider-${provider.id}`}>{provider.name}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};

const BootstrapCompleteComponent = () => {
  return (
    <h3 className="text-lg py-4 font-medium">System Bootstrap complete!</h3>
  );
};

export const Stepper: React.FC<StepperProps> = ({ settings, providers }) => {
  const stepper = useStepper();
  const session = useSession();

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
            "owner-user": () => (
              <AdminUserComponent address={session.data?.user.identity ?? ""} />
            ),
            "application-settings": () => (
              <ApplicationSettingsComponent
                settings={settings}
                goToNextStep={stepper.next}
              />
            ),
            "configure-providers": () => (
              <ProvidersComponent providers={providers} />
            ),
            "complete-bootstrap": () => <BootstrapCompleteComponent />,
          })}
        </div>

        <div>
          {stepper.current.id !== "application-settings" && (
            <>
              {!stepper.isLast ? (
                <div className="flex justify-end gap-4">
                  <Button
                    variant="default"
                    onClick={stepper.prev}
                    disabled={stepper.isFirst}
                  >
                    Back
                  </Button>
                  <Button onClick={stepper.next}>
                    {stepper.isLast ? "Complete" : "Next"}
                  </Button>
                </div>
              ) : (
                <div className="flex justify-end gap-4">
                  <Button onClick={completeSetup}>Complete Setup</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

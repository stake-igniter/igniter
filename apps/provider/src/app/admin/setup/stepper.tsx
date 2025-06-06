"use client";
import { Button } from "@igniter/ui/components/button";
import { Progress } from "@igniter/ui/components/progress";
import {CheckIcon, LoaderIcon} from "@igniter/ui/assets";
import { defineStepper } from "@stepperize/react";
import React, {useEffect} from "react";
import { cn } from "@igniter/ui/lib/utils";
import { ApplicationSettings } from "@/db/schema";
import { completeSetup, GetApplicationSettings } from "@/actions/ApplicationSettings";
import ConfigureAppSettings from "./ConfigureAppSettings";
import ConfigureAddressGroup from "./ConfigureAddressGroups";
import ConfigureServices from "@/app/admin/setup/ConfigureServices";
import ConfigureDelegators from "@/app/admin/setup/ConfigureDelegators";
import ConfigureBlockChain from "@/app/admin/setup/ConfigureBlockChain";

const { useStepper, steps, utils } = defineStepper(
  {
    id: "blockchain",
    title: "Blockchain Settings",
  },
  {
    id: "identity-settings",
    title: "Identity Settings",
  },
  {
    id: "services",
    title: "Select Provided Services",
  },
  {
    id: "address-groups",
    title: "Address Groups",
  },
  {
    id: "delegators",
    title: "Delegators",
  },
  {
    id: "complete-bootstrap",
    title: "Finish",
  }
);

const BootstrapCompleteComponent = () => {
  return <h3 className="text-lg py-4">System Bootstrap complete!</h3>;
};

export const Stepper: React.FC = () => {
  const [isLoadingSettings, setIsLoadingSettings] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [settings, setSettings] = React.useState<ApplicationSettings>();

  const stepper = useStepper();

  const currentIndex = utils.getIndex(stepper.current.id);

  const updateSettingsFromDb = async () => {
    setHasError(false);
    setSettings(undefined);
    try {
      setIsLoadingSettings(true);
      const dbSettings = await GetApplicationSettings();
      setSettings(dbSettings as ApplicationSettings);
    } catch (error) {
      console.error("Something went wrong while retrieving the current applications settings", error);
      setHasError(true);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  useEffect(() => {
    updateSettingsFromDb();
  }, [currentIndex]);

  return (
    <>
      <div className="space-y-6 p-6 min-h-[400] flex flex-col justify-between">
        <div className="flex flex-col gap-5">
          <div className="flex justify-between">
            <h2 className="text-lg font-medium">System Bootstrap</h2>
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
          {isLoadingSettings && (
            <div className="flex justify-center items-center h-fit">
              <LoaderIcon className="animate-spin" />
            </div>
          )}
          {hasError && (
            <div className="flex justify-center items-center h-fit">
              <p>Something went wrong while retrieving the current applications settings</p>
              <Button>
                Try again
              </Button>
            </div>
          )}
          {!isLoadingSettings && !hasError && stepper.switch({
            blockchain: () => (
              <ConfigureBlockChain
                defaultValues={settings!}
                goNext={stepper.next}
              />
            ),
            "identity-settings": () => (
              <ConfigureAppSettings
                defaultValues={settings!}
                goNext={stepper.next}
                goBack={stepper.prev}
              />
            ),
            services: () => (
              <ConfigureServices goNext={stepper.next} goBack={stepper.prev} />
            ),
            "address-groups": () => (
              <ConfigureAddressGroup
                goNext={stepper.next}
                goBack={stepper.prev}
              />
            ),
            delegators: () => (
              <ConfigureDelegators
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

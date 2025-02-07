"use client";
import { Button } from "@/app/components/button";
import LoginWithPokt from "@/app/components/PoktIdentityProvider";
import { defineStepper } from "@stepperize/react";
import { redirect } from "next/navigation";
import React from "react";

const { useStepper, steps, utils } = defineStepper(
  {
    id: "admin-user",
    title: "Create Admin User",
  },
  {
    id: "setup-providers",
    title: "Setup Providers",
  },
  {
    id: "complete-bootstrap",
    title: "Complete",
  }
);

const AdminUserComponent = () => {
  return (
    <div className="grid gap-4">
      <h4>Please login with your wallet to create your account:</h4>
      <LoginWithPokt />
    </div>
  );
};

const ProvidersComponent = () => {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <p>Setup noderunning providers</p>
      </div>
    </div>
  );
};

const BootstrapCompleteComponent = () => {
  return (
    <h3 className="text-lg py-4 font-medium">System Bootstrap complete!</h3>
  );
};

export const Stepper = () => {
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
              {stepper.all.map((step, index, array) => (
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
                      {index + 1}
                    </Button>
                    <span className="text-sm font-medium text-secondary-foreground">
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
            "admin-user": () => <AdminUserComponent />,
            "setup-providers": () => <ProvidersComponent />,
            "complete-bootstrap": () => <BootstrapCompleteComponent />,
          })}
        </div>

        <div>
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
              <Button
                onClick={() => redirect("/admin")}
                className="bg-emerald-500"
              >
                Complete Bootstrap
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

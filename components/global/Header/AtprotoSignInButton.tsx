"use client";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/ui/modal/context";
import { Loader2, LogIn } from "lucide-react";
import React from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAtprotoStore } from "@/components/stores/atproto";

const AtprotoSignInButton = () => {
  const { pushModal, show } = useModal();
  const auth = useAtprotoStore((state) => state.auth);

  if (auth.status === "RESUMING") {
    return <Loader2 className="animate-spin text-primary size-5 mx-1" />;
  }

  return (
    <Button
      size={"sm"}
      onClick={() => {
        pushModal(
          {
            id: "auth",
            content: <AuthModal />,
          },
          true
        );
        show();
      }}
    >
      <LogIn />
      Sign in
    </Button>
  );
};

export default AtprotoSignInButton;

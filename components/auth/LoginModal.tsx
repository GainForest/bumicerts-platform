"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightIcon, LoaderIcon } from "lucide-react";
import { authorize } from "@/components/actions/oauth";
import { allowedPDSDomains } from "@/lib/config/gainforest-sdk";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface LoginModalProps {
  onClose: () => void;
}

export function LoginModal({ onClose }: LoginModalProps) {
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const domain = allowedPDSDomains[0];
  const handleWithDomain = handle.includes(".") ? handle : handle ? `${handle}.${domain}` : "";

  const handleError =
    handle && /[^a-zA-Z0-9\-.]/.test(handle)
      ? "Only letters, numbers, and hyphens are allowed."
      : handle && (handle.match(/\./g) ?? []).length > 2
      ? "Handle cannot contain more than two periods."
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const { authorizationUrl } = await authorize(handle.trim());
        window.location.href = authorizationUrl;
      } catch (err) {
        setError("Unable to start sign-in. Please try again.");
        console.error(err);
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: 8 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full"
    >
      {/* Logo */}
      <div className="flex justify-center mb-4">
        <Image
          src="/assets/media/images/logo.svg"
          alt="GainForest"
          width={40}
          height={40}
          className="dark:invert"
        />
      </div>

      {/* Headline */}
      <div className="text-center mb-6">
        <h2
          className="text-3xl font-light tracking-[-0.02em] text-foreground mb-2"
          style={{ fontFamily: "var(--font-garamond-var)" }}
        >
          Welcome back
        </h2>
        <p className="text-sm text-muted-foreground">
          Sign in with your{" "}
          <span className="text-foreground font-medium">{domain}</span> account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="handle" className="text-sm font-medium">
            Username
          </label>
          <div className="flex rounded-md overflow-hidden border border-input">
            <Input
              id="handle"
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="your-handle"
              autoComplete="username"
              autoFocus
              disabled={isPending}
              className="flex-1 rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <span className="flex items-center px-3 text-xs text-muted-foreground bg-muted border-l border-input shrink-0">
              .{domain}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {handleError ? (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="text-xs text-destructive"
              >
                {handleError}
              </motion.p>
            ) : handleWithDomain ? (
              <motion.p
                key="preview"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="text-xs text-muted-foreground"
              >
                Signing in as{" "}
                <span className="font-mono">{handleWithDomain}</span>
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-destructive"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          disabled={!handle.trim() || !!handleError || isPending}
          className="w-full"
        >
          {isPending ? (
            <>
              <LoaderIcon className="h-4 w-4 animate-spin" />
              Redirecting…
            </>
          ) : (
            <>
              Continue
              <ArrowRightIcon className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/onboarding"
          onClick={onClose}
          className="text-primary font-medium hover:underline"
        >
          Sign up as an organization
        </Link>
      </p>
    </motion.div>
  );
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { constVar } from "@/shared/constVar";
import { useAuth } from "@/context/Authentication/authContext";
import { useState } from "react";
import React from "react";
import { LoginPopUpProps } from "@/shared/interfaces";

const LoginPopUp = (props: LoginPopUpProps) => {
  const { triggerLabel, onSuccess, onFailed } = props;
  const { login, isAuthenticated } = useAuth();

  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isControlled = props.open !== undefined;

  const dialogOpen = isControlled ? props.open! : internalOpen;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(isOpen);
    }
    props.onOpenChange?.(isOpen);

    if (!isOpen) {
      setError(null);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        onSuccess();
        handleOpenChange(false);
        setEmail("");
        setPassword("");
      } else {
        setError(constVar.errorMessage.invalidEmailOrPass);
        onFailed();
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(constVar.errorMessage?.APIDefault || "Failed to sign in");
      onFailed();
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger className="hover:bg-gray-400 rounded-xl p-1">
          {triggerLabel || constVar.signInMetadata?.label || "Sign In"}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="py-4 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              required
              disabled={isLoading}
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm" role="alert">
              {error}
            </p>
          )}
          <DialogFooter>
            <button
              type="submit"
              className="bg-black hover:bg-blue-500 text-white rounded-xl p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPopUp;

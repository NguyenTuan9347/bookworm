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

const LoginPopUp: React.FC = () => {
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const success = await login(email, password);
      if (success) {
        setOpen(false);
        setEmail("");
        setPassword("");
      } else {
        setError("Invalid email or password");
      }
    } catch {
      setError(constVar.errorMessage.APIDefault || "Failed to sign in");
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="hover:bg-gray-400 rounded-xl p-1">
        {constVar.signInMetadata.label || "Sign In"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="py-4 flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium mb-1">Email</p>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Password</p>
            <input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
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
              className="bg-black hover:bg-blue-500 text-white rounded-xl p-2"
            >
              Submit
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPopUp;

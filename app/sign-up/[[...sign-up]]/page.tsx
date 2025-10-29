import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <SignUp appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "bg-white/10 backdrop-blur-lg border border-white/20"
        }
      }} />
    </div>
  );
}

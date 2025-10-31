"use client";
import { useState } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { useAuth, setDocumentNonBlocking } from "@/firebase";
import {
  initiateEmailSignUp,
  initiateEmailSignIn,
} from "@/firebase/non-blocking-login";
import { Logo } from "@/components/common/icons";
import { getFirestore, doc } from "firebase/firestore";

type AuthData = {
    email: string;
    password: any;
    name?: string;
    age?: number;
    contact?: string;
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const auth = useAuth();
  const firestore = getFirestore();

  const handleAuth = (data: AuthData) => {
    if (!auth) return;
    if (isLogin) {
      initiateEmailSignIn(auth, data.email, data.password);
    } else {
      initiateEmailSignUp(auth, data.email, data.password).then((userCredential) => {
          if (userCredential && userCredential.user) {
              const user = userCredential.user;
              const userProfile = {
                  name: data.name,
                  age: data.age,
                  contact: data.contact,
                  email: user.email,
                  id: user.uid,
                  streak: 0,
                  level: 'Beginner'
              }
              const userDocRef = doc(firestore, "users", user.uid);
              setDocumentNonBlocking(userDocRef, userProfile, { merge: true });
          }
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
            <Logo className="h-12 w-12 text-primary" />
            <h1 className="text-3xl font-bold font-headline mt-4">
                Welcome to Curiosity Engine
            </h1>
            <p className="text-muted-foreground mt-2">
                {isLogin ? "Sign in to continue your learning journey." : "Create an account to get started."}
            </p>
        </div>
        <AuthForm
          isLogin={isLogin}
          onSubmit={handleAuth}
          setIsLogin={setIsLogin}
        />
      </div>
    </div>
  );
}

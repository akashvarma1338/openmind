"use client";
import { useState } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { useAuth, setDocumentNonBlocking, useFirestore } from "@/firebase";
import { authApi } from "@/firebase/non-blocking-login";
import { Logo } from "@/components/common/icons";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

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
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const handleAuth = (data: AuthData) => {
    if (!auth || !firestore) return;
    if (isLogin) {
      authApi.emailSignIn(auth, data.email, data.password)
        .then(() => {
            router.push('/');
        })
        .catch(error => {
            let title = 'Sign-in Failed';
            let description = 'An unexpected error occurred.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                title = 'Invalid Credentials';
                description = 'The email or password you entered is incorrect. Please try again.';
            } else {
                description = error.message;
            }
            toast({
                variant: 'destructive',
                title: title,
                description: description,
            });
      });
    } else {
      authApi.emailSignUp(auth, data.email, data.password).then((userCredential) => {
          if (userCredential && userCredential.user) {
              const user = userCredential.user;
              const userProfile = {
                  name: data.name,
                  age: data.age,
                  contact: data.contact,
                  email: user.email,
                  id: user.uid,
                  streak: 0,
                  level: 'Beginner',
                  curiosityPoints: 0,
              }
              const userDocRef = doc(firestore, "users", user.uid);
              setDocumentNonBlocking(userDocRef, userProfile, { merge: true });
              toast({
                  title: "Account Created",
                  description: "You can now sign in with your new account.",
              });
              setIsLogin(true); 
          }
      }).catch(error => {
        if(error.code === 'auth/email-already-in-use') {
            toast({
                variant: 'destructive',
                title: 'Email Already In Use',
                description: 'This email is already registered. Please sign in.',
            });
            setIsLogin(true);
        } else {
            toast({
                variant: 'destructive',
                title: 'Registration Failed',
                description: error.message,
            });
        }
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
            <Logo className="h-12 w-12 text-primary" />
            <h1 className="text-3xl font-bold mt-4">
                Welcome to OpenMind
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

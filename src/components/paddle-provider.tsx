"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

interface PaddleContextValue {
  openCheckout: (
    priceId: string,
    workspaceId: string,
    billingOwnerUserId: string,
    email: string
  ) => void;
  openUpdatePayment: (subscriptionId: string) => void;
  checkoutCompleted: boolean;
  ready: boolean;
}

const PaddleContext = createContext<PaddleContextValue>({
  openCheckout: () => { },
  openUpdatePayment: () => {},
  checkoutCompleted: false,
  ready: false,
});

export function usePaddle() {
  return useContext(PaddleContext);
}

export function PaddleProvider({ children }: { children: ReactNode }) {
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [checkoutCompleted, setCheckoutCompleted] = useState(false);
  const didCompleteRef = useRef(false);
  const paddleRef = useRef<Paddle | null>(null);
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    initializePaddle({
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
      environment:
        process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
          ? "production"
          : "sandbox",
      eventCallback: (event) => {
        if (event.name === "checkout.completed") {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: "user_subscribed" });
          didCompleteRef.current = true;
          paddleRef.current?.Checkout.close();
        }
        if (event.name === "checkout.closed" && didCompleteRef.current) {
          didCompleteRef.current = false;
          setCheckoutCompleted(true);
          setTimeout(() => {
            routerRef.current.refresh();
            setCheckoutCompleted(false);
          }, 3000);
        }
      },
    }).then((instance) => {
      if (instance) {
        paddleRef.current = instance;
        setPaddle(instance);
      }
    });
  }, []);

  const openCheckout = useCallback(
    (
      priceId: string,
      workspaceId: string,
      billingOwnerUserId: string,
      email: string
    ) => {
      paddle?.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: { email },
        customData: {
          workspace_id: workspaceId,
          billing_owner_user_id: billingOwnerUserId,
        },
      });
    },
    [paddle]
  );

  const openUpdatePayment = useCallback(
    (subscriptionId: string) => {
      paddle?.Checkout.open({
        transactionId: subscriptionId,
      });
    },
    [paddle]
  );

  return (
    <PaddleContext.Provider
      value={{ openCheckout, openUpdatePayment, checkoutCompleted, ready: !!paddle }}
    >
      {children}
    </PaddleContext.Provider>
  );
}

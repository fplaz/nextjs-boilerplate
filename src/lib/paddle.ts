import { Environment, Paddle } from "@paddle/paddle-node-sdk";

const paddleEnv =
  process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
    ? Environment.production
    : Environment.sandbox;

const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment: paddleEnv,
});

export { paddle };

import { NextFunction, Request, Response } from "express";

export default async function globalExceptionLayer(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(">>>>>>>>>>>>>>>>>>", error);

  // eslint-disable-next-line operator-linebreak
  const message =
    error instanceof Error ? error.message : "Internal Server Error";
  const statusCode = error instanceof Error ? 400 : 500;
  next();
  return res.status(statusCode).json({ error: true, message });
}

import type { NextFunction, Request, Response } from "express";

const exceptionHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    return next(err);
  }
  console.log(err.message);
  console.log(err);

  res.status(500);
  res.json({ message: err.message || "Something went wrong" });
};

export { exceptionHandler };

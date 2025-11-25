import { Request, Response } from 'express';

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Resource not found',
    path: req.originalUrl
  });
};

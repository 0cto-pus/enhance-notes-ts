import { Application,ErrorRequestHandler } from "express";
import { NotFoundError, BadRequestError, AuthorizeError, } from "./app-errors";


const errorHandler: ErrorRequestHandler =(error, req, res, next)=>{

  //TODO: ADD ERROR TRACKER 

 /*  let reportError = true;
    
  // skip common / known errors
  [NotFoundError, BadRequestError, AuthorizeError].forEach((typeOfError) => {
    if (error instanceof typeOfError) {
      reportError = false;
    }
  }); */

  const statusCode = error.statusCode || 500;
  const data = error.data || error.message;
  return res.status(statusCode).json(data);
}

export default async (app: Application) => {
  app.use(errorHandler);
};
import { Request } from "express";

export interface usertype  {
    _id: string;
    username: string;
    email: string;
}

export interface userType extends Request {
 user?: usertype;

}
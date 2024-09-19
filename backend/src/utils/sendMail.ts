import transporter from "../config/nodemailer";
import { NODEMAILER_SENDER, NODE_ENV } from "../constants/env";

type Params = {
    to: string;
    subject: string;
    text: string;
    html: string;
};

const getFromEmail = () =>
    NODE_ENV === "development" ? "jok3r4707@gmail.com" : NODEMAILER_SENDER;
  
const getToEmail = (to: string) =>
    NODE_ENV === "development" ? "tayyabashraf448@gmail.com" : to;
  
export const sendMail = async ({to, subject, text, html} : Params) => 
    await transporter.sendMail({
        from: getFromEmail(),
        to: getToEmail(to),
        subject,
        text,
        html,
    });
import nodemailer from 'nodemailer';
import { NODEMAILER_SENDER, NODEMAILER_PASSWORD, NODEMAILER_HOST } from '../constants/env';


const transporter = nodemailer.createTransport({
  service: NODEMAILER_HOST,
  port: 465, 
    secure: true,
    auth: {
      user: NODEMAILER_SENDER,
      pass: NODEMAILER_PASSWORD,
    },
    tls: {
        rejectUnauthorized: true
    }
});

export default transporter;
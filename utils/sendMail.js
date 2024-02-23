import { createTransport } from "nodemailer"

export const sendEmail = async (to, subject, text) => {
    const transporter = createTransport({
        host: process.env.SMPT_HOST,
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMPT_USER,
            pass: process.env.SMPT_PASS
        }
    });

    await transporter.sendMail(
        {
            from: process.env.SMPT_USER,
            to, subject, text
        }
    )


}

import nodemailer from "nodemailer";
import fetch from "node-fetch";
import mime from "mime-types";

export async function POST(req) {
  try {
    const body = await req.json();

    const fileResponse = await fetch(body.fileUrl);
    const fileBuffer = await fileResponse.buffer();

    const contentType = fileResponse.headers.get("content-type") || "application/octet-stream";
    const extension = mime.extension(contentType) || "bin";

    const filename = `attachment.${extension}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: "vitisik54@gmail.com",
        pass: "zlui kabe iaqc huno",
      },
      secure: true,
    });

    const mailData = {
      from: process.env.SMTP_USER || "vitisik54@gmail.com",
      to: body.to,
      replyTo: body.email,
      subject: `Send file`,
      html: `<div><strong>Company:</strong> ${body.company}</div>`,
      attachments: [
        {
          filename: filename,
          content: fileBuffer,
          contentType: contentType,
        },
      ],
    };

    await new Promise((resolve, reject) => {
      transporter.sendMail(mailData, function (err, info) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log("Email sent:", info);
          resolve(info);
        }
      });
    });

    return new Response(JSON.stringify({ status: "OK" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Error in processing request:", err);
    return new Response(
      JSON.stringify({ status: "Internal Server Error", error: err.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

const http = require("http");
const serverless = require("serverless-http");
require('dotenv').config();
const express = require("express");
const app = express();
const fs = require("fs");

const mail = require("./helper/mail");
const notifications = async (event) => {

    const resultData = event.apiGateway.event.Records[0].Sns.Message;
    console.log("result Data", resultData);

    let parseBody = JSON.parse(resultData);
    console.log("parse Body", parseBody);

    if (parseBody.mailFor == "Send OTP") {
        console.log("OTP MAIL");
        fs.readFile("./upschoolEmailTemplate/loginOtpTemplate.html", function (error, html) {
            if (error) {
                throw error;
            }
            let html_content = html.toString();

            let otpLoginMailOption = {
                to: parseBody.toMail,
                from: process.env.SENDER_EMAIL,
                subject: parseBody.subject,
                html: html_content.replace("***user_otp***", parseBody.user_otp)
            }

            console.log({ otpLoginMailOption });

            mail.sendEmail(otpLoginMailOption, function (send_email_err, send_email_response) {
                if (send_email_err) {
                    console.log("ERROR : SEND OTP")
                    console.log(send_email_err);
                } else {
                    console.log("OTP SENT");
                }
            })
        })
    }
    else if (parseBody.mailFor == "userBulkUpload") {
        let uploadError = JSON.parse(parseBody.bulkResponse);

        let tableCss = "font-family: arial, sans-serif;border-collapse: collapse;";
        let tdthCss = "border: 1px solid #dddddd;text-align: left;padding: 8px;"

        let errTable = "<table style='" + tableCss + "'><tr><th style='" + tdthCss + "'>S.No</th><th style='" + tdthCss + "'>Sheet Name</th><th style='" + tdthCss + "'>Row</th><th style='" + tdthCss + "'>Error</th></tr>";

        let sNo = 0;
        function errorLength(i) {
            if (i < uploadError.length) {
                sNo = i + 1;
                errTable += "<tr><td style='" + tdthCss + "'>" + sNo + "</td><td style='" + tdthCss + "'>" + uploadError[i].sheet + "</td><td style='" + tdthCss + "'>" + uploadError[i].rowNo + "</td><td style='" + tdthCss + "'>" + uploadError[i].reason + "</td></tr>";
                i++;
                errorLength(i);
            }
            else {
                errTable += "</table>";

                console.log("MAIL TABLE : ", errTable);

                /** SEND MAIL **/
                let otpLoginMailOption = {
                    to: parseBody.toMail,
                    from: process.env.SENDER_EMAIL,
                    subject: parseBody.subject,
                    html: errTable
                }

                console.log({ otpLoginMailOption });

                mail.sendEmail(otpLoginMailOption, function (send_email_err, send_email_response) {
                    if (send_email_err) {
                        console.log("ERROR : SEND BULK RESPONSE");
                        console.log(send_email_err);
                    } else {
                        console.log("RESPONSE SENT");
                    }
                })
                /** END SEND  */
            }
        }
        errorLength(0)
    } else if (parseBody.mailFor == "urlToUploadAnswerSheets") {
        console.log("Url To Upload Answer Sheets!");
        fs.readFile("./upschoolEmailTemplate/urlToUploadAnswerSheetsTemplate.html", function (error, html) {
            if (error) {
                throw error;
            }
            let html_content = html.toString();

            let sendURLMailOption = {
                to: parseBody.toMail,
                from: process.env.SENDER_EMAIL,
                subject: parseBody.subject,
                html: html_content.replace(/uploadURL/g, parseBody.upload_url)
            }

            console.log({ sendURLMailOption });

            mail.sendEmail(sendURLMailOption, function (send_email_err, send_email_response) {
                if (send_email_err) {
                    console.log("ERROR : SEND OTP")
                    console.log(send_email_err);
                } else {
                    console.log("OTP SENT", send_email_response);
                }
            })
        })
    } else if (parseBody.mailFor == "otpToScanAnswerSheets") {
        console.log("OTP To Upload Answer Sheets");
        fs.readFile("./upschoolEmailTemplate/otpToScanAnswerSheetsTemplate.html", function (error, html) {
            if (error) {
                throw error;
            }
            let html_content = html.toString();

            let sendURLMailOption = {
                to: parseBody.toMail,
                from: process.env.SENDER_EMAIL,
                subject: parseBody.subject,
                html: html_content.replace("***user_otp***", parseBody.user_otp)
            }

            console.log({ sendURLMailOption });

            mail.sendEmail(sendURLMailOption, function (send_email_err, send_email_response) {
                if (send_email_err) {
                    console.log("ERROR : SEND OTP")
                    console.log(send_email_err);
                } else {
                    console.log("OTP SENT", send_email_response);
                }
            })
        })
    } else if (parseBody.mailFor == "quizGeneration") {
        console.log("Mail to confirm QP and AP Creation");
        fs.readFile("./upschoolEmailTemplate/quizGeneration.html", function (error, html) {
            if (error) {
                throw error;
            }
            let html_content = html.toString();

            let sendURLMailOption = {
                to: parseBody.toMail,
                from: process.env.SENDER_EMAIL,
                subject: parseBody.subject,
                html: html_content.replace("***quiz_name***", parseBody.quiz_name)
            }

            console.log({ sendURLMailOption });

            mail.sendEmail(sendURLMailOption, function (send_email_err, send_email_response) {
                if (send_email_err) {
                    console.log("ERROR : SEND MAIL")
                    console.log(send_email_err);
                } else {
                    console.log("QUIZ GENERATION MAIL SENT", send_email_response);
                }
            })
        })
    } else if (parseBody.mailFor == "customWorksheetSender"){
        fs.readFile("./upschoolEmailTemplate/customWorkSheet.html", function (error, html) {
            if (error) {
                throw error;
            }
            
            let html_content = html.toString();
        
            let sendWorksheetMailOption = {
                to: parseBody.toMail,
                from: process.env.SENDER_EMAIL,
                subject: parseBody.subject,
                html: html_content
                    .replace("{{studentName}}", parseBody.studentName)
                    .replace("{{chapterName}}", parseBody.chapterNames)
                    .replace("{{schoolName}}", parseBody.schoolName),
                attachments: [
                    {
                        filename: parseBody.attachment.filename, 
                        content: fs.readFileSync(parseBody.attachment.path).toString('base64'), 
                        encoding: 'base64'
                    }
                ]
            };

            console.log({ sendWorksheetMailOption });

            mail.sendEmail(sendWorksheetMailOption, function (send_email_err, send_email_response) {
                if (send_email_err) {
                    console.log("ERROR : SEND WORKSHEET EMAIL");
                    console.log(send_email_err);
                } else {
                    console.log("WORKSHEET EMAIL SENT", send_email_response);
                }
            });
        });
        
    }
};

const NODE_ENV = process.env.NODE_ENV || 'development';

if (NODE_ENV === 'development') {

    app.set("port", process.env.PORT || 3005);
    let server = http.createServer(app);

    server.listen(app.get("port"), "0.0.0.0", () => {
        console.log(`Express server listening on http://localhost:${app.get("port")}`);
    });
}
else {
    module.exports.handler = serverless(notifications);
}
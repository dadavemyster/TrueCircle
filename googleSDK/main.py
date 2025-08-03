import os
import functions_framework
import smtplib
from email.mime.text import MIMEText
from flask import jsonify, request


gmail_user = os.environ.get("GMAIL_USER")
gmail_password = os.environ.get("GMAIL_PASSWORD")

@functions_framework.http
def send_email(request):
    request_json = request.get_json(silent=True)
    if not request_json:
        return jsonify({"error": "Invalid input"}), 400

    to_email = request_json.get("to")
    subject = request_json.get("subject")
    message = request_json.get("message")

    if not (to_email and subject and message):
        return jsonify({"error": "Missing fields"}), 400

    msg = MIMEText(message)
    msg["Subject"] = subject
    msg["From"] = gmail_user
    msg["To"] = to_email

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(gmail_user, gmail_password)
            server.sendmail(gmail_user, [to_email], msg.as_string())

        return jsonify({"success": True}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

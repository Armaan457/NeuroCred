# utils/email_utils.py

import os
import resend

resend.api_key = os.getenv("RESEND_API_KEY")

async def send_reset_password_email(to_email: str, reset_token: str):
    reset_url = f"https://yourdomain.com/reset-password?token={reset_token}"

    params = {
        "from": "Onboarding <onboarding@resend.dev>", 
        "to": [to_email],
        "subject": "Reset Your Password",
        "html": f"""
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2>Password Reset Request</h2>
                <p>You requested a password reset for your account. Click the button below to set a new password:</p>
                <p style="margin: 20px 0;">
                    <a href="{reset_url}" 
                       style="background-color: #007bff; color: white; padding: 10px 18px; text-decoration: none; border-radius: 5px; display: inline-block;">
                       Reset Password
                    </a>
                </p>
                <p>This link will expire in <strong>15 minutes</strong>.</p>
                <p>If you didn't request this, you can safely ignore this email.</p>
            </div>
        """
    }

    resend.Emails.send(params)
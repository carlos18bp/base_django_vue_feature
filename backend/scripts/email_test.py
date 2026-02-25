"""
Email configuration smoke-test (manual).

Purpose
  Send a single email using Django's configured EMAIL_* settings to confirm
  SMTP/Gmail setup is working as expected.

Usage (from repo root)
  python backend/scripts/email_test.py
  python backend/manage.py test_email

Settings
  Defaults to base_feature_project.settings_dev unless DJANGO_SETTINGS_MODULE
  is already set.

Notes
  - Interactive: prompts for a destination email address.
  - This is not a pytest test; the filename avoids the test_ prefix on purpose.
"""

import os
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

import django
from django.apps import apps

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'base_feature_project.settings_dev')
if not apps.ready:
    django.setup()

from django.core.mail import send_mail
from django.conf import settings


def run_email_test():
    """Send a single test email using the configured Django email backend."""
    
    print("=" * 70)
    print("📧 TESTING EMAIL CONFIGURATION")
    print("=" * 70)
    print(f"\nEmail Backend: {settings.EMAIL_BACKEND}")
    print(f"Email Host: {settings.EMAIL_HOST}")
    print(f"Email Port: {settings.EMAIL_PORT}")
    print(f"Email Use TLS: {settings.EMAIL_USE_TLS}")
    print(f"Email From: {settings.EMAIL_HOST_USER}")
    print("\n" + "=" * 70)
    
    # Get destination email from user
    to_email = input("\nEnter destination email address: ").strip()
    
    if not to_email:
        print("❌ No email address provided. Exiting...")
        return
    
    print(f"\n📤 Sending test email to: {to_email}")
    print("⏳ Please wait...")
    
    try:
        result = send_mail(
            subject='Test Email from Django',
            message='This is a test email sent from your Django application.\n\n'
                    'If you received this email, your email configuration is working correctly! ✅',
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[to_email],
            fail_silently=False,
        )
        
        if result == 1:
            print("\n✅ SUCCESS! Email sent successfully!")
            print(f"   Check {to_email} inbox (and spam folder)")
        else:
            print("\n⚠️  WARNING: Email may not have been sent (result: {result})")
            
    except Exception as e:
        print(f"\n❌ ERROR: Failed to send email")
        print(f"   Error: {str(e)}")
        print("\n💡 Common issues:")
        print("   1. Check if 2-Step Verification is enabled in Gmail")
        print("   2. Make sure you're using an App Password (not regular password)")
        print("   3. Verify EMAIL_HOST_USER and EMAIL_HOST_PASSWORD are correct")
        print("   4. Check your internet connection")
    
    print("\n" + "=" * 70)


if __name__ == "__main__":
    run_email_test()

# Supabase Auth email with Brevo

This project uses Supabase Auth for magic links and email OTPs. D-013 selects
Brevo as the custom SMTP provider. SMTP credentials belong only in the
Supabase Dashboard; never add them to `.env.local`, frontend code, or git.

## Prerequisites

Brevo's current transactional SMTP setup asks you to authenticate a domain and
create a sender on that domain. You need a domain whose DNS records you can
edit. `oraclebinder.netlify.app` is a Netlify subdomain and cannot be
authenticated by you as a sending domain. If you do not have a domain you
control, pause here rather than entering an unverified sender; acquire or use a
domain first.

1. In Brevo, authenticate your sending domain and publish the DNS records
   Brevo provides. Complete its verification.
2. Create and verify a sender address on that domain, for example
   `no-reply@your-domain.example`.
3. Open Brevo's **SMTP** settings and note the SMTP login. Generate an SMTP
   key if one does not exist. Use the SMTP key, not a Brevo API key.

## Configure Supabase

In the Supabase Dashboard, open **Authentication → SMTP Settings** (the exact
menu label may vary) and enable custom SMTP. Enter:

| Supabase setting | Value |
| --- | --- |
| Sender email | The verified Brevo sender address |
| Sender name | `Oracle Binder` |
| Host | `smtp-relay.brevo.com` |
| Port | `587` |
| Username | The SMTP login shown in Brevo SMTP settings |
| Password | The Brevo SMTP key |

Save the settings. Port 587 uses SMTP submission with STARTTLS; do not put the
SMTP key in this repository or share it in chat. Supabase's custom SMTP
settings are project secrets and are not configured by a SQL migration or
the app's publishable key.

## Verify delivery

1. Check Supabase Auth's configured email templates. The magic-link template
   should use `{{ .ConfirmationURL }}` for a clickable link. Use `{{ .Token }}`
   when the email should offer the six-digit OTP used by the app.
2. Request a fresh sign-in email from `/v2/login` and test delivery to an
   address you control. Complete sign-in using the link or OTP.
3. If delivery fails, inspect the transactional email logs in Brevo and the
   Auth logs in Supabase. Do not copy SMTP credentials or one-time links into
   an issue or chat.
4. Review the Supabase Auth rate limit and Brevo plan limits before inviting
   more users. Supabase may apply a low initial rate limit to custom SMTP.

## References

- [Supabase: Send emails with custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Brevo: Send transactional emails using SMTP](https://help.brevo.com/hc/en-us/articles/7924908994450-Send-transactional-emails-using-Brevo-SMTP)
- [Supabase: Email templates](https://supabase.com/docs/guides/auth/auth-email-templates)

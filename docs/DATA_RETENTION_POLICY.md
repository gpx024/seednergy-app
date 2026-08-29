# Seednergy operational data retention policy

Status: adopted technical policy for pre-commercial operation on 29 August 2026. Public legal wording and controller details still require review before store release.

| Data | Purpose | Retention | Deletion |
| --- | --- | --- | --- |
| AI check image | Provide cycle-specific image guidance and permit short-term review | Up to 90 days from submission | Automated daily Storage deletion, or earlier through account deletion |
| AI check guidance and minimal metadata | Preserve the user's growing history and explain allowance usage | Until the user deletes the check or account | User deletion or account deletion |
| Private harvest photo | User-created private growing record | Until the user removes it or deletes the account | User-controlled removal or account deletion |
| Profile photo | Account personalisation | Until replaced or account deletion | Replacement or account deletion |
| Account, cycle and harvest records | Operate the user's account and growing history | While the account remains active | Hard deletion through the in-app account-deletion flow |
| Anonymous deletion audit | Demonstrate deletion completion without identifying the user | 12 months | Automated operational cleanup to be added before public launch |

The 90-day period follows the accepted starting position in the Seednergy Developer Questions Response. It must be stated in the eventual Privacy Policy. Review this schedule at least annually and whenever the processing purpose, provider or data type changes.

Database backups may temporarily contain deleted database records for the provider's backup window. Deleted Storage objects are not restored by database backup restoration. Restored databases must be reconciled against deletion audits before being returned to service.

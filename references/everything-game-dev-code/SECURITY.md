# Security Policy

## Scope
This repository contains process, workflow, and scaffold content for AI-assisted game development.
It may also define integration points with external tools, services, or platform-facing workflows.

## Security Principles
- Do not store secrets, tokens, signing assets, or platform credentials in the repository.
- Treat build, release, and online-service workflows as sensitive.
- Review third-party integrations before adopting them into rules, hooks, or harness adapters.
- Document trust boundaries when networking, telemetry, monetization, or backend services are involved.

## What To Report
Report issues involving:
- exposed secrets or credentials
- unsafe defaults in build or release workflows
- insecure third-party integration patterns
- data collection guidance that violates expected privacy boundaries
- misleading or dangerous security advice in repository files

## Handling Sensitive Findings
Do not publish exploit details in public issue threads if the issue could expose a live product, internal toolchain, or credential workflow.
Use the private reporting path that fits your organization.

## Maintenance Rule
Security-relevant workflow changes should usually touch more than one layer:
- rules
- hooks
- adapters
- release-related documentation

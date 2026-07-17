# BNS Identity Starter Kit

A public, beginner-friendly BNSv2 onboarding toolkit for the Stacks ecosystem.

**Live preview:** https://bns-identity-starter-kit.vercel.app/

The starter kit helps creators, collectors, builders, educators, and community members understand BNS names, work through an identity checklist, review practical use cases, and register interest for live BNS clinics.

## Current MVP

- Eight-step BNS identity checklist with local progress
- Five beginner guide previews aligned with current Stacks BNS documentation
- Fictional identity gallery covering common ecosystem roles
- Public X and Reddit discussions showing onboarding questions and activity
- Clinic waitlist and project validation forms
- Private, server-side response storage through Vercel Blob
- Printable checklist and downloadable completion card
- Responsive desktop and mobile layouts

## Stack

- React 19
- Vite 6
- Tailwind CSS 4
- Lucide React
- Vercel Functions
- Private Vercel Blob storage

## Development

```bash
npm install
npm run dev
```

Create a production build and run the validation tests:

```bash
npm run build
npm test
```

## Environment

Copy `.env.example` when an endpoint override or external analytics collector is needed.

```env
VITE_FORM_ENDPOINT=
VITE_ANALYTICS_ENDPOINT=
```

The deployed application defaults form submissions to `/api/responses`. The connected Vercel project supplies private Blob credentials to the server-side function. Never expose Blob credentials through a `VITE_` variable.

## Response Storage

The clinic and feedback forms submit to the first-party Vercel Function in `api/responses.js`. The endpoint validates the supported schemas, rejects oversized and cross-origin requests, applies basic bot checks, and writes one private JSON object per accepted response. It does not store IP addresses and has no public read endpoint.

## BNS References

- [Bitcoin Name System overview](https://docs.stacks.co/learn/network-fundamentals/bitcoin-name-system)
- [BNS architecture](https://docs.stacks.co/learn/network-fundamentals/bitcoin-name-system/architecture)
- [BNS core concepts](https://docs.stacks.co/learn/network-fundamentals/bitcoin-name-system/core-concepts)
- [BNS operations](https://docs.stacks.co/learn/network-fundamentals/bitcoin-name-system/operations)

Built in public for the Stacks community and prepared for DeGrants Cohort 4.

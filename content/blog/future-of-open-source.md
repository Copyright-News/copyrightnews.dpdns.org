---
title: "Rethinking the Licenses: The Future of Open Source"
category: "Software"
tags: ["Software", "Policy", "Open Source", "Licensing"]
author: "Linus Lindqvist"
date: "2026-05-28"
read_time: "7 min read"
image: "https://picsum.photos/id/60/800/900"
image_alt: "Abstract green code lines"
excerpt: "As commercial software models exploit open codebase distributions, a new wave of 'fair share' licenses is testing the traditional boundaries of free software."
---

Open-source software has built the modern web. From databases like Redis and PostgreSQL to languages like Python and JavaScript, open collaboration has accelerated innovation. But as cloud giants monetize these open-source tools without contributing back, developers are hitting back with licensing changes.

The definition of "open" is being re-evaluated: **can a license protect developers' labor while maintaining collaborative freedom?**

## The Commercial Exploitation Dilemma
When a database developer releases code under a permissive license (like MIT or BSD), cloud hosting providers can package, host, and sell that code as a service at scale. The hosting provider captures the economic value, while the original creator bears the cost of maintenance and support.

> "We wrote the software, we maintain the software, but someone else is collecting millions of dollars in hosted revenue from our work without giving anything back."

## The Rise of Fair-Share Licenses
To combat this, several high-profile projects have moved from traditional OSI-approved licenses to alternative sources-available licensing schemes:
*   **Server Side Public License (SSPL):** Pioneered by MongoDB, requiring anyone offering the database as a hosted service to open-source their entire management stack.
*   **Business Source License (BSL):** Used by MariaDB, HashiCorp, and Redis. It keeps code open for non-production use but restricts commercial hosting, converting to a standard open-source license after a set period (usually 3-4 years).

## The Open-Source Ideology Divide
These license migrations have sparked intense debates. The Open Source Initiative (OSI) does not recognize these licenses as "open source" because they restrict usage criteria (such as commercial deployment fields).

Critics argue that source-available licenses fragment the developer ecosystem and make dependency management more complicated. Proponents counter that without these protections, independent software development will become financially unsustainable.

Ultimately, finding a sustainable balance between commercial viability and open sharing will determine whether the next generation of infrastructure code is written in public or behind closed proprietary doors.

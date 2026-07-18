# 📝 TeraExam - Production-Ready Online Examination Portal

TeraExam is a high-performance, enterprise-grade online examination platform engineered for massive scalability, security, and sub-second latencies. The platform is designed to seamlessly handle high-stakes exams with up to 100,000 concurrent student submissions.

🌐 **Live Application:** [https://teraexam.in](https://teraexam.in) (or your configured production domain)

---

## 🚀 Key Production Features

- **Massive Scalability:** Architecture optimized to handle 100K+ simultaneous test-takers without server degradation.
- **Serverless Database Infrastructure:** Backed by **Neon Console (Serverless PostgreSQL)** for auto-scaling computing power and instant branching during updates.
- **Client-Side Data Resilience:** Implementation of local storage/IndexedDB caching to protect student answers from sudden internet disruptions prior to final submission.
- **Secure Backend Gateway:** Zero direct database exposures on the frontend. Data flows through secure serverless backend functions using strictly isolated `.env` environment variables.
- **Modern Responsive UI:** Clean, distraction-free examination interface optimized across mobile, tablet, and desktop viewports.

---

## 🛠️ Tech Stack & Infrastructure

- **Frontend:** React.js / Vite (TypeScript / Tailwind CSS)
- **Database:** Neon Serverless PostgreSQL
- **Package Manager:** `pnpm` (Fast, disk-space efficient package management)
- **Deployment Platform:** Production-grade Serverless Web Hosting (Edge network deployment)

---

## 💻 Local Development Setup

To replicate the environment or contribute to the project locally, follow these steps:

### 1. Clone the Repository
```bash
git clone [https://github.com/yuvraj5657663/teraexam.git](https://github.com/yuvraj5657663/teraexam.git)
cd teraexam

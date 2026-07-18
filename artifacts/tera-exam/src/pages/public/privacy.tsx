const sections = [
  {
    title: "1. Information We Collect",
    content: `TERA EXAM is a public information platform. We do not require users to create accounts or submit personal information to access exam notifications, results, admit cards, or syllabus documents.

We may collect the following non-personal data automatically:
• Browser type and version
• Pages visited and time spent
• Referring URL
• Device type and operating system

This data is collected in aggregate for analytics and site improvement purposes only.`,
  },
  {
    title: "2. Cookies",
    content: `We use minimal, essential cookies to ensure the website functions correctly (e.g., theme preference). We do not use third-party advertising cookies or tracking pixels.

You can disable cookies in your browser settings, though this may affect some site functionality.`,
  },
  {
    title: "3. How We Use Information",
    content: `Any data we collect is used solely to:
• Improve site performance and user experience
• Diagnose technical issues
• Understand usage patterns in aggregate

We do not sell, trade, or rent your information to third parties.`,
  },
  {
    title: "4. Third-Party Services",
    content: `TERA EXAM links to official government websites and recruitment portals. Once you leave our site, their respective privacy policies apply. We are not responsible for the privacy practices of external websites.

We use Cloudinary for file hosting (syllabus PDFs and images). Cloudinary's privacy policy applies to files hosted on their servers.`,
  },
  {
    title: "5. Data Security",
    content: `We implement industry-standard security measures including HTTPS encryption, secure HTTP headers, and rate limiting to protect our platform and its users.

However, no internet transmission is 100% secure. Use this platform at your own risk.`,
  },
  {
    title: "6. Children's Privacy",
    content: `TERA EXAM is intended for users aged 16 and above. We do not knowingly collect personal information from children. If you believe a child has submitted personal information, please contact us immediately.`,
  },
  {
    title: "7. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. Continued use of the site after any changes constitutes acceptance of the new policy.`,
  },
  {
    title: "8. Contact",
    content: `If you have questions about this Privacy Policy, please contact us at privacy@teraexam.in`,
  },
];

export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-3">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="text-muted-foreground leading-relaxed mb-10">
          At TERA EXAM, we are committed to protecting your privacy. This policy explains what
          information we collect, how we use it, and what rights you have regarding your data.
        </p>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-serif font-bold text-foreground mb-3">
                {section.title}
              </h2>
              <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

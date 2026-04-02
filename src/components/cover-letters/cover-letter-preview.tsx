"use client";

interface CoverLetterPreviewProps {
  content: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  companyName?: string;
  jobTitle?: string;
}

export function CoverLetterPreview({
  content,
  userName,
  userEmail,
  userPhone,
  companyName,
  jobTitle,
}: CoverLetterPreviewProps) {
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const paragraphs = content
    ? content.split(/\n\n+/).filter((p) => p.trim())
    : [];

  return (
    <div className="rounded-xl border border-border bg-[oklch(0.99_0.005_60)] dark:bg-card shadow-sm">
      <div className="mx-auto max-w-2xl px-10 py-10 sm:px-12">
        {/* Date */}
        <p className="text-sm text-muted-foreground">{today}</p>

        {/* Recipient */}
        <div className="mt-5 space-y-0.5 text-sm text-foreground">
          {companyName && <p className="font-medium">{companyName}</p>}
          {jobTitle && (
            <p className="text-muted-foreground">
              Re: {jobTitle}
            </p>
          )}
        </div>

        {/* Greeting */}
        <p className="mt-6 text-sm text-foreground">
          Dear {companyName ? `${companyName} Team` : "Hiring Manager"},
        </p>

        {/* Body */}
        {paragraphs.length > 0 ? (
          <div className="mt-4 space-y-4">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-sm leading-relaxed text-foreground"
              >
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <div className="mt-6 mb-6 text-center">
            <p className="text-sm text-muted-foreground/50 italic">
              Your cover letter content will appear here...
            </p>
          </div>
        )}

        {/* Closing */}
        <div className="mt-8 space-y-1 text-sm text-foreground">
          <p>Sincerely,</p>
          <p className="mt-4 font-medium">{userName}</p>
          <p className="text-muted-foreground">{userEmail}</p>
          {userPhone && (
            <p className="text-muted-foreground">{userPhone}</p>
          )}
        </div>
      </div>
    </div>
  );
}

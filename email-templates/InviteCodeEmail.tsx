type InviteCodeEmailProps = {
  inviteCode: string;
  pdsDomain: string;
};

export function InviteCodeEmail({ inviteCode, pdsDomain }: InviteCodeEmailProps) {
  return (
    <div
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        color: "#0a0a0a",
        backgroundColor: "#ffffff",
        padding: "0",
        margin: "0",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
        }}
      >
        {/* Header with Logo */}
        <div
          style={{
            padding: "40px 40px 32px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              margin: "0 0 12px",
              color: "#0a0a0a",
              letterSpacing: "-0.01em",
              lineHeight: "1.2",
            }}
          >
            Welcome to GainForest
          </h1>
          <p
            style={{
              margin: "0",
              fontSize: "16px",
              color: "#4b5563",
              lineHeight: "1.5",
            }}
          >
            You&apos;ve been invited to join{" "}
            <strong style={{ color: "#0a0a0a" }}>{pdsDomain}</strong>
          </p>
        </div>

        {/* Main Content */}
        <div style={{ padding: "40px" }}>
          <p
            style={{
              margin: "0 0 24px",
              fontSize: "16px",
              color: "#374151",
              lineHeight: "1.6",
            }}
          >
            Use this invite code to complete your account setup and start your
            journey with us.
          </p>

          {/* Invite Code Box */}
          <div
            style={{
              padding: "20px 28px",
              borderRadius: "12px",
              backgroundColor: "#ecfdf5",
              border: "2px solid #2FCE8A",
              borderLeft: "6px solid #2FCE8A",
              marginBottom: "32px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#059669",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "8px",
              }}
            >
              Your Invite Code
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: "#0a0a0a",
                fontFamily: "monospace, 'Courier New', Courier",
                wordBreak: "break-all",
              }}
            >
              {inviteCode}
            </div>
          </div>

          <p
            style={{
              margin: "0 0 8px",
              fontSize: "14px",
              color: "#6b7280",
              lineHeight: "1.5",
            }}
          >
            If you didn&apos;t request this invitation, you can safely ignore this
            email.
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "24px 40px",
            borderTop: "1px solid #f0f0f0",
            backgroundColor: "#fafafa",
            borderBottomLeftRadius: "12px",
            borderBottomRightRadius: "12px",
          }}
        >
          <p
            style={{
              margin: "0",
              fontSize: "13px",
              color: "#9ca3af",
              lineHeight: "1.5",
            }}
          >
            <strong style={{ color: "#2FCE8A", fontWeight: 600 }}>
              GainForest
            </strong>{" "}
            · Regenerating ecosystems, together
          </p>
        </div>
      </div>
    </div>
  );
}

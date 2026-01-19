export default function PrivacyPolicyPage() {
  return (
    <div className="page">
      <div className="card">
        <h1 className="h1">Privacy Policy</h1>
        <p className="muted">Last updated: January 19, 2026</p>

        <h2 className="h2">Overview</h2>
        <p>
          BreezyBrief provides flight weather briefings and route maps based on the airports you enter.
          This policy explains what we collect, how we use it, and your choices.
        </p>

        <h2 className="h2">Information We Collect</h2>
        <ul className="list">
          <li>
            <b>Inputs you provide:</b> origin/destination airports and preferences (e.g., calm mode).
          </li>
          <li>
            <b>Technical data:</b> basic logs necessary to operate the service (e.g., request timestamps,
            error logs). These may include IP address and user agent as part of standard server logs.
          </li>
        </ul>

        <h2 className="h2">How We Use Information</h2>
        <ul className="list">
          <li>To generate your weather briefing and interactive map.</li>
          <li>To maintain reliability, prevent abuse, and debug issues.</li>
          <li>To improve performance and user experience.</li>
        </ul>

        <h2 className="h2">What We Don’t Do</h2>
        <ul className="list">
          <li>We do not sell your personal information.</li>
          <li>We do not intentionally collect sensitive personal data.</li>
        </ul>

        <h2 className="h2">Third-Party Services</h2>
        <p>
          BreezyBrief may rely on third-party aviation/weather data providers and infrastructure services
          (e.g., hosting) to deliver the product. These services may process limited technical data to
          provide functionality.
        </p>

        <h2 className="h2">Data Retention</h2>
        <p>
          We retain information only as long as needed for the purposes above, including maintaining the
          service and meeting legal/operational requirements. Debug logs may be retained for a limited time.
        </p>

        <h2 className="h2">Your Choices</h2>
        <ul className="list">
          <li>You can choose not to use the service if you do not want to provide route inputs.</li>
          <li>You can contact us to request deletion of any stored data we can reasonably identify.</li>
        </ul>

        <h2 className="h2">Children’s Privacy</h2>
        <p>
          BreezyBrief is not intended for children under 13. We do not knowingly collect personal
          information from children.
        </p>

        <h2 className="h2">Contact</h2>
        <p>
          If you have questions or requests, contact:{" "}
          <a href="mailto:support@breezy-brief.com">support@breezy-brief.com</a>
        </p>
      </div>
    </div>
  );
}

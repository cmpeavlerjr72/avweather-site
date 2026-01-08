interface Props {
  briefing: string;
}

export default function BriefingCard({ briefing }: Props) {
  return (
    <div className="card">
      <h2>Route Briefing</h2>
      <pre className="briefing">{briefing}</pre>
    </div>
  );
}

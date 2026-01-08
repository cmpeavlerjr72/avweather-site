import planeIcon from "../Brand/plane.png";

export default function LoadingOverlay() {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <img src={planeIcon} alt="" className="loading-logo" />
        <div className="loading-title">Generating your BreezyBrief…</div>
        <div className="loading-subtitle">
          This usually takes a few seconds.
        </div>
      </div>
    </div>
  );
}


type Props = {
  size?: "large" | "small";
  label?: string;
  number?: number;
  style?: React.CSSProperties;
};

export default function SponsorBanner({
  size = "large",
  label = "Sponsorship",
  number,
  style,
}: Props) {
  return (
    <div
      className={`sponsor-banner banner-${size} reveal`}
      style={style}
    >
      {number && <span className="sponsor-number">#{number}</span>}
      {label}
    </div>
  );
}

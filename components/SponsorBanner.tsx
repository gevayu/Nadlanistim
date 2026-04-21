type Props = {
  size?: "large" | "small";
  label?: string;
  style?: React.CSSProperties;
};

export default function SponsorBanner({
  size = "large",
  label = "Sponsorship",
  style,
}: Props) {
  return (
    <div
      className={`sponsor-banner banner-${size} reveal`}
      style={style}
    >
      {label}
    </div>
  );
}

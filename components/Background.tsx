import Image from "next/image";

export default function Background() {
  return (
    <>
      <div className="noise-overlay" />
      <div className="orb-container">
        <Image
          src="/shape-1.png"
          alt=""
          width={700}
          height={700}
          className="bg-shape bg-shape-1"
          aria-hidden
        />
        <Image
          src="/shape-2.png"
          alt=""
          width={800}
          height={800}
          className="bg-shape bg-shape-2"
          aria-hidden
        />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
    </>
  );
}

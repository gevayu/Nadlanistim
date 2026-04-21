"use client";

import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { StaticImageData } from "next/image";

export type CarouselItem = {
  href: string;
  image: string | StaticImageData;
  imageAlt: string;
  title: string;
  description: string;
  author?: string;
  company?: string;
};

type Props = {
  title: string;
  icon: string;
  iconAlt: string;
  viewAllHref: string;
  items: CarouselItem[];
  viewAllLabel?: string;
  readMoreLabel?: string;
};

export default function Carousel({
  title,
  icon,
  iconAlt,
  viewAllHref,
  items,
  viewAllLabel = "לעוד פוסטים בנושא",
  readMoreLabel = "קראו עוד",
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "prev" | "next") => {
    const track = trackRef.current;
    if (!track) return;
    const firstCard = track.querySelector<HTMLElement>(".carousel-card");
    if (!firstCard) return;
    const amount = firstCard.offsetWidth + 24;
    // RTL: prev visually (right arrow) should scroll positive; next visually (left arrow) should scroll negative
    track.scrollBy({
      left: direction === "next" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="carousel-wrapper reveal">
      <div className="carousel-header">
        <h2 className="carousel-title">
          <Image
            src={icon}
            alt={iconAlt}
            width={48}
            height={48}
            className="custom-icon"
          />{" "}
          {title}
        </h2>
        <div className="carousel-header-actions">
          <Link href={viewAllHref} className="view-all-btn">
            {viewAllLabel} <ArrowLeft style={{ width: 18 }} />
          </Link>
          <div className="carousel-nav">
            <button
              type="button"
              className="carousel-btn prev"
              onClick={() => scroll("prev")}
              aria-label="הקודם"
            >
              <ChevronRight />
            </button>
            <button
              type="button"
              className="carousel-btn next"
              onClick={() => scroll("next")}
              aria-label="הבא"
            >
              <ChevronLeft />
            </button>
          </div>
        </div>
      </div>
      <div className="carousel-track" ref={trackRef}>
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="carousel-card"
            style={{ color: "inherit" }}
          >
            <div className="carousel-img">
              <Image
                src={item.image}
                alt={item.imageAlt}
                fill
                sizes="(max-width: 768px) 85vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="carousel-content">
              <h3>{item.title}</h3>
              {(item.author || item.company) && (
                <p className="carousel-author">
                  {item.author}{item.author && item.company && ", "}{item.company}
                </p>
              )}
              <p>{item.description}</p>
              <span className="read-more-link">
                {readMoreLabel} <ArrowLeft style={{ width: 18 }} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

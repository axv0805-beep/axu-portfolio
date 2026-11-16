import Image from "next/image";
import Link from "next/link";
import type { WorkCardData } from "@/lib/data";

type Props = {
  work: WorkCardData;
  index: number;
  total: number;
  size?: "large" | "small";
  priority?: boolean;
  featured?: boolean;
};

export function WorkCard({ work, index, total, size = "small", priority = false, featured = false }: Props) {
  const meta = [work.category.name, String(work.year), work.tags[0]].filter(Boolean).join(" · ");
  const useFeaturedCover = featured && work.featuredCoverUrl;
  const coverUrl = useFeaturedCover ? work.featuredCoverUrl! : work.coverUrl;
  const coverAlt = useFeaturedCover ? `${work.title} 首页精选封面` : work.coverAlt;

  return (
    <Link className={`work-card work-card--${size}`} href={`/works/${work.slug}`}>
      <div className="work-cover">
        <Image
          src={coverUrl}
          alt={coverAlt}
          fill
          priority={priority}
          sizes={size === "large" ? "(max-width: 900px) 100vw, 58vw" : "(max-width: 900px) 50vw, 42vw"}
          style={{ objectFit: "cover" }}
        />
        <span className="work-badge">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
      <div className="work-info">
        <h3 className="work-title">{work.title}</h3>
        <p className="work-meta">{meta}</p>
        <span className="work-arrow" aria-hidden="true">
          ↗
        </span>
      </div>
    </Link>
  );
}

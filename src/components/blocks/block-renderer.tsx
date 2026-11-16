import Image from "next/image";
import type { Block } from "@/lib/content";
import { splitParagraphs } from "@/lib/content";
import { PromptBlock } from "./prompt-block";

function youtubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{6,})/);
  return match?.[1] ?? null;
}

function bilibiliId(url: string) {
  const match = url.match(/BV[\w]+/);
  return match?.[0] ?? null;
}

function Video({ block }: { block: Extract<Block, { type: "video" }> }) {
  if (block.provider === "youtube") {
    const id = youtubeId(block.url);
    if (id) {
      return (
        <div className="video-frame">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title={block.title || "视频"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
  }

  if (block.provider === "bilibili") {
    const id = bilibiliId(block.url);
    if (id) {
      return (
        <div className="video-frame">
          <iframe
            src={`https://player.bilibili.com/player.html?bvid=${id}&page=1&high_quality=1&danmaku=0`}
            title={block.title || "视频"}
            allowFullScreen
            scrolling="no"
          />
        </div>
      );
    }
  }

  return (
    <div className="video-frame">
      <video src={block.url} controls poster={block.poster} preload="metadata">
        你的浏览器不支持视频播放。
      </video>
    </div>
  );
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose">
      {blocks.map((block) => {
        switch (block.type) {
          case "paragraph":
            return splitParagraphs(block.text).map((paragraph, index) => (
              <p key={`${block.id}-${index}`}>{paragraph}</p>
            ));
          case "heading": {
            const Tag = block.level === 3 ? "h3" : "h2";
            return <Tag key={block.id}>{block.text}</Tag>;
          }
          case "image":
            return (
              <figure className="prose-figure" key={block.id}>
                <Image
                  src={block.url}
                  alt={block.alt}
                  width={block.width ?? 1600}
                  height={block.height ?? 1000}
                  sizes="(max-width: 900px) 100vw, 720px"
                />
                {block.caption ? <figcaption>{block.caption}</figcaption> : null}
              </figure>
            );
          case "gallery":
            return (
              <div className="prose-gallery" key={block.id}>
                {block.images.map((image, index) => (
                  <figure key={`${block.id}-${index}`}>
                    <Image
                      src={image.url}
                      alt={image.alt}
                      width={900}
                      height={900}
                      sizes="(max-width: 900px) 100vw, 350px"
                    />
                    {image.caption ? <figcaption>{image.caption}</figcaption> : null}
                  </figure>
                ))}
              </div>
            );
          case "video":
            return (
              <figure className="prose-media" key={block.id}>
                <Video block={block} />
                {block.title ? <figcaption>{block.title}</figcaption> : null}
              </figure>
            );
          case "audio":
            return (
              <figure className="prose-audio" key={block.id}>
                <p className="prompt-label">AUDIO</p>
                <p className="audio-title">{block.title}</p>
                <audio controls src={block.url} preload="metadata">
                  你的浏览器不支持音频播放。
                </audio>
              </figure>
            );
          case "quote":
            return (
              <blockquote className="prose-quote" key={block.id}>
                <p>{block.text}</p>
                {block.cite ? <cite>{block.cite}</cite> : null}
              </blockquote>
            );
          case "prompt":
            return (
              <PromptBlock
                key={block.id}
                text={block.text}
                model={block.model}
                negative={block.negative}
                params={block.params}
                collapsed={block.collapsed}
              />
            );
          case "link": {
            const external = /^https?:\/\//.test(block.url);
            return (
              <a
                className="prose-link"
                href={block.url}
                key={block.id}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
              >
                <span>
                  <strong>{block.title}</strong>
                  {block.description ? <small>{block.description}</small> : null}
                </span>
                <span aria-hidden="true">↗</span>
              </a>
            );
          }
          case "divider":
            return <hr className="prose-divider" key={block.id} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

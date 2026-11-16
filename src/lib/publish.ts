type PublishCandidate = {
  title?: string;
  slug?: string;
  categoryId?: string;
  coverUrl?: string;
  coverAlt?: string;
  summary?: string;
  year?: number;
  content?: unknown;
};

export function publishErrors(work: PublishCandidate): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!work.title?.trim()) errors.title = "发布前需要填写标题";
  if (!work.slug?.trim()) errors.slug = "发布前需要填写 slug";
  if (!work.categoryId?.trim()) errors.categoryId = "发布前需要选择分类";
  if (!work.coverUrl?.trim()) errors.coverUrl = "发布前需要上传封面";
  if (!work.coverAlt?.trim()) errors.coverAlt = "发布前需要填写封面说明";
  if (!work.summary?.trim()) errors.summary = "发布前需要填写摘要";
  if (!work.year) errors.year = "发布前需要填写年份";
  if (!Array.isArray(work.content) || work.content.length === 0) errors.content = "发布前至少需要 1 个内容块";
  return errors;
}

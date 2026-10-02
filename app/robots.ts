import type { MetadataRoute } from "next";

// The booklet itself is private; only the cover pages are worth indexing.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/auth/", disallow: ["/chat", "/api/"] } };
}

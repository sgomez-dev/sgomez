import type { Metadata } from "next";
import StaticPageLayout from "@/app/components/StaticPageLayout";
import { developersPage as page } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/content/metadata";

export const metadata: Metadata = pageMetadata(page);

export default function Page() {
  return <StaticPageLayout page={page} />;
}

import { BrowseRouteChrome } from "@/components/layout/browse-route-chrome";

export default function JobsSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BrowseRouteChrome>{children}</BrowseRouteChrome>;
}

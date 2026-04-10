import { BrowseRouteChrome } from "@/components/layout/browse-route-chrome";

export default function DriversSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BrowseRouteChrome>{children}</BrowseRouteChrome>;
}

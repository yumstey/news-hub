import { SiteFooter } from "@/widgets/site-footer"
import { SiteHeader } from "@/widgets/site-header"

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </>
  )
}

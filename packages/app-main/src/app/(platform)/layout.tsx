import "@/src/globals.css";
import { NavbarPlatform } from "@/app/components/navbar/NavbarPlatform";
import SideMenu from "@/app/components/sideMenu/sideMenu";
import { cn } from "@common/lib/utils";
import { PageContentContainer } from "@/app/components/ui/PageContentContainer";
import { LegalFooter } from "@common/components/ui/LegalFooter";
import { PopupModalWrapper } from "@/app/components/modals/PopupModalWrapper";
import { CurrentUserProvider } from "@/app/components/providers/currentUserProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
	const navBarFixed = true;

	return (
		<CurrentUserProvider>
			<div className="h-screen w-full bg-background">
				<SideMenu isFixed={true} />
				<NavbarPlatform className="" />
				<div
					className={cn("flex w-full justify-center", {
						"": navBarFixed,
					})}
				>
					<PageContentContainer
						className="flex flex-col items-center justify-between bg-background min-h-screen"
						variant="blank"
						considerSideMenu={false}
						useUIState={false}
					>
						<div className="w-full flex-1">{children}</div>
						<LegalFooter className="px-4" />
					</PageContentContainer>
				</div>
				<PopupModalWrapper />
			</div>
		</CurrentUserProvider>
	);
}

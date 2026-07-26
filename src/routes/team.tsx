import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

// The team is now shown as a modal from any page. This route opens the dialog
// and redirects to home.
export const Route = createFileRoute("/team")({
  component: TeamRedirect,
});

function TeamRedirect() {
  const setTeamOpen = useStore((s) => s.setTeamOpen);
  useEffect(() => {
    setTeamOpen(true);
  }, [setTeamOpen]);
  // eslint-disable-next-line @typescript-eslint/no-throw-literal
  throw redirect({ to: "/" });
}

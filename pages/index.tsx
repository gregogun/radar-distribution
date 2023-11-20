import { AppRouter as StaticRouter } from "@/router";
import dynamic from "next/dynamic";

const Router = dynamic<React.ComponentProps<typeof StaticRouter>>(
  () => import("../router").then((mod) => mod.AppRouter),
  {
    ssr: false,
  }
);

export default function Home() {
  return <Router />;
}

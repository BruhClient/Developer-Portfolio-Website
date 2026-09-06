import { WorldCanvas } from "@/world/react/WorldCanvas";

/*
  The homepage is the world. Long form content still lives on its own routes:
  the world sends visitors to /projects/<slug>, /hackathons/<slug> and /about
  the same way the scrolling site used to link to them.
*/
export default function Home() {
  return <WorldCanvas />;
}

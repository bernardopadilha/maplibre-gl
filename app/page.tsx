import { DrawerFeaturesList } from "./components/drawer-features-list";
import { Map } from "./components/map/map";

export default function Home() {
  return (
    <div className="relative h-screen w-full">
      <Map />
      <DrawerFeaturesList />
    </div>
  );
}

import GalaxyAnimation from "@/app/_components/GalaxyAnimation";
import Logo from "./_components/Logo";
import StarGalleryContainer from "./_components/StarGalleryContainer";


export default function Home() {
  return (   

    <div style={{position: 'relative', width: '100%', height: '100vh', overflow: 'hidden'}}>

      <GalaxyAnimation />
      <div className="flex flex-col items-center font-sans relative">
        <div style={{paddingTop: 80}}><Logo /></div>
        <div className="w-full mt-12" style={{overflow: 'visible'}}>
          <StarGalleryContainer />
        </div>
      </div>
    </div>
  );
}


import { getBarbers } from "@/lib/getBarbers";
import HomeClient from "./HomeClient"; 
// export const dynamic = "force-dynamic";//fordynamic render
export const revalidate = 60;//to render dynamic data in every 60 sec
export default async function Home() {
  const initialBarbers = await getBarbers();

  return <HomeClient initialBarbers={initialBarbers} />;
}
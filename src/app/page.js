import { getBarbers } from "@/lib/getBarbers";
import HomeClient from "./HomeClient"; 

export const revalidate = 60; 

export default async function Home({ searchParams }) {
  const params = await searchParams;
  
  const currentPage = params?.page ? Number(params.page) : 1;
  const limit = 10; 

  const initialBarbers = await getBarbers(currentPage, limit);
  return (
    <HomeClient 
      initialBarbers={initialBarbers}
      page={currentPage}
    />
  );
}
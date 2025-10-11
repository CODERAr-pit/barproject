"use client"
 import Link from "next/link"
 import Barber from "@/models/Barber"
 import {useRouter} from "next/router"

 export default async function Search() {
const router = useRouter()
const {city} =router.query;
const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city // convert string → array
        }),
      });}

 const { data } = await res.json();

 
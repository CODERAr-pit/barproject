"use client"
import { NextResponse } from "next/server";
import dbConnect from "/@/li"
import { useState } from "react";
export default  function BarberSignup(){
    const handleSubmit=async(e)=>{
    try{
        const res=await fetch("/api/barberlogin",{
            method: "POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({
                ...formData
            }),
        });
        const data=await res.json();
        if(data.success){
            localStorage.setItem("barber",JSON.stringify(data.user));

            router.push(data.redirectUrl);
        }
        else{
             return msg
        }
    }
    catch(err){ 

    }
}}
export async function POST(request){
    const data=request.json()
    const{username,password}=body
    const person=User.findOne({"Username":username})
    if(!person){
        NextResponse.json({
            "msg":"User Not found"
        })
    }
    if(person.password===password){
        const newdata={
            "success":true,
            "redirectURL":"/u/username"
        }
       return NextResponse.json(newdata);
    }
    else{
        const newdata={
            "success":false,
            "msg":"wrong PassWord"
        }
       return NextResponse.json(newdata);
    }
}
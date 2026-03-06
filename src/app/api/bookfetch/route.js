import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import { NextResponse } from "next/server";


export async function GET(req){
  try{const body=req.json();
  const {barber_id}=body.barber;


  const currdate=new Date();
  const uptodate=new Date();
  uptodate.setDate(currdate.getDate()+7);
  uptodate.setTime(uptodate.getTime()+17*60*60*1000)

  const upcomingBookings=await Booking.find(
    {ID:barber_id,
     starttime:
               {
                     $gte:currdate,
                     $lte:uptodate
     }
    });

  const slot=[];
  const cursor=new Date(currdate.getDate());
  while(cursor<=uptodate){
    const stime=new Date(cursor);
    const etime=new Date(cursor+30*60*1000);
    let isconflict=false;
    for(let upcomingBooking of upcomingBookings){
      const curr=upcomingBooking.starttime;
      const ncurr=upcomingBooking.endtime;
      if(curr<etime&&ncurr>stime){
        isconflict=true;
        break;
      }
    }
    if(!isconflict){
      slot.push({stime,etime});
    }
    cursor=cursor.setTime(cursor.getTime()+30*60*1000);
    if(cursor.getTime()>17){
      cursor.setDate(cursor.getDate()+1);
      cursor.setTime('09.00.00.000')
    }
  }
  
   return NextResponse.json({
      data:slot
    },{status:200})
  
}
catch(err){
 return NextResponse.json({
    msg:"database load nhi ho rh"
  })
}}

export async function POST(request){
  try{
    
  await dbConnect();
  const {body}=request.json();
  const stime=body.starttime;
  const etime=body.endtime;
  const barber=body.barber;
  const user=body.user;

  const check=Booking.find({
    barber:barber,
    starttime:{
      $lte:etime,
      $gte:stime
    }
  })
  if(check){
    return NextResponse.json({
      msg:"slot already  committed"
    },{
      status:200
    })
  }
  Booking.create({
    barber:barber,
    user:user,
    starttime:stime,
    endtime:etime
  })
  return NextResponse.json({
    msg:"Booking confirmed"
  },{
    status:success
  })}
  catch(err){
    return NextResponse.json({
      "error":err
    })
  }
}
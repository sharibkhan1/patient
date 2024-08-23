'use server';
import { ID, Query } from "node-appwrite";
import { databases, DATABASE_ID, PATIENT_COLLECTION_ID, ENDPOINT, BUCKET_ID, PROJECT_ID, APPOINTMENT_COLLECTION_ID, messaging } from "../appwrite.config";
import { formatDateTime, parseStringify } from "../utils";
import { Appointment } from "@/types/appwrite.types";
import { revalidatePath } from "next/cache";

export const createAppointment = async(appointment: CreateAppointmentParams) =>{
    try{
        const newAppointment = await databases.createDocument(
            DATABASE_ID!,
            APPOINTMENT_COLLECTION_ID!,
            ID.unique(),
           
              appointment
           
          );
      
          return parseStringify(newAppointment);
    } catch(e){
        console.log(e);
    }
}

export const getAppointment = async (appointmentId : string)=>{
    try{
        const appointment = await databases.getDocument(
            DATABASE_ID!,
            APPOINTMENT_COLLECTION_ID!,
            appointmentId,
        )
        return parseStringify(appointment);
    }catch(e){
        console.log(e);
    }
}

export const getRecentAppointmentList = async() =>{
    try{
        const appointments = await databases.listDocuments(
            DATABASE_ID!,
            APPOINTMENT_COLLECTION_ID!,
            [Query.orderDesc('$createdAt')]
        );
        const initialCounts ={
            scheduledCount :0,
            pendingCount:0,
            cancelledCount:0,
        }
        const counts = (appointments.documents as Appointment[]).reduce(
            (acc, appointment) => {
              switch (appointment.status) {
                case "scheduled":
                  acc.scheduledCount++;
                  break;
                case "pending":
                  acc.pendingCount++;
                  break;
                case "cancelled":
                  acc.cancelledCount++;
                  break;
              }
              return acc;
            },
            initialCounts
          );
          const data = {
            totalCount: appointments.total,
            ...counts,
            documents: appointments.documents,
          };
          return parseStringify(data);
      
    }catch(e){
        console.log(e);
    }
}

export const updateAppointment = async ({appointmentId,userId, appointment, type}: 
    UpdateAppointmentParams
)=>{
    try{
        const updatedAppointment = await databases.updateDocument(
            DATABASE_ID!,
            APPOINTMENT_COLLECTION_ID!,
            appointmentId,
            appointment
        )
        if(!updatedAppointment){
            throw new Error('Appontment not found');
        }
        const smsMessage = `Hi,its CarePlus.
         ${type === 'schedule'
            ? `Your appointent has been scheduled for ${formatDateTime(appointment.schedule!)}`
            : `We regret to inform you that your appointment has been cancelled. Reason: ${
            appointment.cancellationReason}`
         }.`

         await sendSMSNotification(userId,smsMessage);
         
        revalidatePath('/admin');
        return parseStringify(updatedAppointment);
    }catch(e){
        console.log(e);
    }
}

export const sendSMSNotification = async (userId: string ,content:string)=>{
    try{
        const message = await messaging.createSms(
            ID.unique(),
            content,
            [],
            [userId]
        )
    }catch(e){
        console.log(e)
    }
}
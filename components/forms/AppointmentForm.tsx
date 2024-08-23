"use client"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form } from "@/components/ui/form"
import CustomForm from "../CustomForm"
import SubmitButton from "../SubmitButton"
import { getAppointmentSchema } from "@/lib/validation"
import { useRouter } from "next/navigation"
import { createAppointment, updateAppointment } from "@/lib/actions/appointment.actions"
import { FormFieldType } from "./PatientForm"
import { Doctors } from "@/constants"
import { SelectItem } from "@radix-ui/react-select"
import Image from "next/image"
import { Appointment } from "@/types/appwrite.types"

const AppointmentForm = ({
  userId,
  patientId,
  type,
  appointment,
  setOpen
}: {
  userId: string
  patientId: string
  type: "create" | "cancel" | "schedule";
  appointment?: Appointment;
  setOpen: (open: boolean)=>void;
}) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const AppointmentFormValidation = getAppointmentSchema(type)

  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      primaryPhysician: appointment ? appointment.primaryPhysician: "",
      reason: appointment ? appointment.reason : '',
      note: appointment?.note || '',
      cancellationReason:appointment?.cancellationReason || '',
      schedule: appointment ? new Date(appointment.schedule): new Date(Date.now()),
    }
  })

console.log({
  userId,
  patientId,
  type,
  appointment
})

  async function onSubmit(values: z.infer<typeof AppointmentFormValidation>) {
    setIsLoading(true)

    let status: string
    switch (type) {
      case 'schedule':
        status = 'scheduled'
        break
      case 'cancel':
        status = 'cancelled'
        break
      default:
        status = 'pending'
        break
    }

    try {
      if (type === 'create' && patientId) {
        const appointmentData = {
          userId,
          patient: patientId,
          primaryPhysician: values.primaryPhysician,
          schedule: new Date(values.schedule),
          reason: values.reason!,
          status: status as "scheduled" | "cancelled" | "pending",
          note: values.note,
        }
        const appointment = await createAppointment(appointmentData)
        if (appointment) {
          form.reset()
          router.push(
            `/patients/${userId}/new-appointment/success?appointmentId=${appointment.$id}`
          )
        }
      }else{
        const appointmentToUpdate = {
          userId,
          appointmentId: appointment?.$id!,
          appointment: {
            primaryPhysician: values.primaryPhysician,
            schedule: new Date(values.schedule),
            status: status as Status,
            cancellationReason: values.cancellationReason,
          },
          type,
        }
        const updatedAppointment = await updateAppointment(appointmentToUpdate);

        if(updatedAppointment){
          setOpen && setOpen(false);
          form.reset();
        }
      }   
    } catch (e) {
      console.error("Error in onSubmit:", e)
    } finally {
      setIsLoading(false)
    }
  }

  let buttonLabel
  switch (type) {
    case 'cancel':
      buttonLabel = 'Cancel Appointment'
      break
    case 'create':
      buttonLabel = 'Create Appointment'
      break
    case 'schedule':
      buttonLabel = 'Schedule Appointment'
      break
    default:
      buttonLabel = 'Submit'
      break
  }

  return (
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
      {type === 'create'&& <section className="mb-12 space-y-4">
      <h1 className="header">New Appointment</h1>
      <p className="text-dark-700">Request a new appointment in 10 seconds</p>
      </section>}
        {type !== "cancel" && (
            <>
<CustomForm 
            fieldType={FormFieldType.SELECT}
            control={form.control}
            name="primaryPhysician"
            label="Primary care physician"
            placeholder="Select a doctor"
          >
            {Doctors.map((doctor) => (
              <SelectItem key={doctor.name} value={doctor.name}>
                <div className="flex cursor-pointer items-center gap-2">
                  <Image
                    src={doctor.image}
                    width={32}
                    height={32}
                    alt="doctor"
                    className="rounded-full border border-dark-500"
                  />
                  <p>{doctor.name}</p>
                </div>
              </SelectItem>
            ))}
</CustomForm>

            <CustomForm
                fieldType={FormFieldType.DATE_PICKER}
                control={form.control}
                name="scehedule"
                label="Expected appointment date"
                showTimeSelect
                dateFormat="MM/dd/yyyy - h:mm aa"
            />

            <div className="flex flex-col gap-6 xl:flex-row">
                <CustomForm
                    fieldType={FormFieldType.TEXTAREA}
                    control={form.control}
                    name="reason"
                    label="Reason for appointment"
                    placeholder="Enter reason for appointment"
                />

                <CustomForm
                    fieldType={FormFieldType.TEXTAREA}
                    control={form.control}
                    name="note"
                    label="Notes"
                    placeholder="Enter notes"
                />
            </div>
            </>
        )}

            {type ==="cancel" && (
              <CustomForm
              fieldType={FormFieldType.TEXTAREA}
              control={form.control}
              name="cancellationReason"  // Corrected the typo here
              label="Reason for cancellation"
              placeholder="Enter reason for cancellation"
          />
            )}

      <SubmitButton isLoading={isLoading} 
        className={`${type === 'cancel'? 'shad-danger-btn' : 'shad-primary-btn'} w-full`}>
            {buttonLabel}
            </SubmitButton>
    </form>
  </Form>
  )
}

export default AppointmentForm
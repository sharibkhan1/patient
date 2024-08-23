"use client"

import { Select, SelectTrigger, SelectValue, SelectContent } from "./ui/select";
import { Input } from "@/components/ui/input"
import { Control } from "react-hook-form";
import { FormFieldType } from "./forms/PatientForm";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Textarea } from "./ui/textarea";
import React, { useState, useEffect } from 'react';
import Image from "next/image";
// import React from 'react'
// import {
//     FormControl,
//     FormDescription,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
//   } from "@/components/ui/form"
//   import { Input } from "@/components/ui/input"
// import { Control } from 'react-hook-form'
// import { FormFieldType } from './forms/PatientForm'
import PhoneInput from "react-phone-number-input";
import 'react-phone-number-input/style.css'
import { E164Number } from "libphonenumber-js/core";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Checkbox } from "./ui/checkbox";
// import { Select, SelectContent, SelectTrigger, SelectValue } from "@radix-ui/react-select";

  interface CustomProps {
    control: Control<any>,
    fieldType: FormFieldType,
    name: string,
    label?:string,
    placeholder?:string,
    iconSrc?:string,
    iconAlt?:string,
    disabled?:boolean,
    dateFormat?:string,
    showTimeSelect?:boolean,
    children?:React.ReactNode,
    renderSkeleton?: (field: any) => React.ReactNode,
  }


  
  const RenderField = ({ field, props }: { field: any; props: CustomProps }) => {
    const {
      fieldType,
      iconSrc,
      iconAlt,
      placeholder,
      showTimeSelect,
      dateFormat,
      renderSkeleton,
      children,
    } = props;

    const [selectedValue, setSelectedValue] = useState(field.value || "");

    const handleValueChange = (value: string) => {
      // Ensure the value is not blank or undefined
      if (value && value !== selectedValue) {
        setSelectedValue(value); // Update local state only if the value is valid
        field.onChange(value); // Update form state
        console.log("Selected value:", value); // Log selected value to console
      }
    };


    switch (fieldType){
        case FormFieldType.INPUT:
            return(
                <div className='flex rounded-md border border-dark-500 bg-dark-400'>
                    {iconSrc && (
                        <Image
                            src={iconSrc}
                            height={24}
                            width={24}
                            alt={iconAlt || 'icon'}
                            className="ml-2"
                        />
                    )}
                    <FormControl/>
                    <Input
                        placeholder={placeholder}
                        {...field}
                        className="shad-input border-0"
                    />
                </div>
            )
        case FormFieldType.TEXTAREA:
      return (
        <FormControl>
          <Textarea
            placeholder={props.placeholder}
            {...field}
            className="shad-textArea"
            disabled={props.disabled}
          />
        </FormControl>
      );
        
      case FormFieldType.PHONE_INPUT:
            return (
                <FormControl>
                  <PhoneInput
                    defaultCountry="IN"
                    placeholder={props.placeholder}
                    international
                    withCountryCallingCode
                    value={field.value as E164Number | undefined}
                    onChange={field.onChange}
                    className="input-phone"
                  />
                </FormControl>
              );
        
        case FormFieldType.DATE_PICKER:
          return(
            <div className="flex rounded-md border border-dark-500 bg-dark-400">
              <Image
                src="/assets/icons/calendar.svg"
                height={24}
                width={24}
                alt='calender'
                className="ml-2"
              />
              <FormControl>
                <DatePicker 
                selected={field.value}
                onChange={(date)=> field.onChange(date)}
                dateFormat={dateFormat ?? 'MM/dd/yyyy'}
                showTimeSelect={showTimeSelect ?? false}
                timeInputLabel="Time:"
                wrapperClassName="date-picker"
                />
              </FormControl>
            </div>
          )
        case FormFieldType.SKELETON:
          return renderSkeleton ? renderSkeleton(field) :null
             
          case FormFieldType.SELECT:
            return (
              <FormControl>
                <Select
                  onValueChange={handleValueChange}
                  value={selectedValue} // Bind the value to local state
                >
                  <SelectTrigger className="shad-select-trigger">
                    <SelectValue placeholder={placeholder}>
                      {selectedValue || placeholder}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="shad-select-content">
                    {children}
                  </SelectContent>
                </Select>
              </FormControl>
            );
          
                
            case FormFieldType.CHECKBOX:
              return (
                <FormControl>
                  <div className="flex items-center gap-4">
                    <Checkbox
                      id={props.name}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label htmlFor={props.name} className="checkbox-label">
                      {props.label}
                    </label>
                  </div>
                </FormControl>
              );
          default:
            break;
    }

  }

const CustomForm = (props: CustomProps) => {
    const {control, fieldType, name , label} = props;

  return (
    <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className='flex-1'>
        {fieldType !== FormFieldType.CHECKBOX && label &&(
            <FormLabel className="shad-input-label">{label}</FormLabel>
        )}
        <RenderField field={field} props={props}/>
        <FormMessage className='shad-error' />
      </FormItem>
    )}
  />
  )
}

export default CustomForm
'use client'
import { generateUniqueLink } from '@/utils/generateUniqueLink';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  import { FaBuilding } from 'react-icons/fa';
  import { z } from 'zod'

  import React, { useEffect, useState, useCallback } from 'react'
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export const ShowSpaces = () => {

    const [spaces, setSpaces] = useState<any[]>([]);

    const router = useRouter();
  
    const addSpace = (newSpace: any) => {
  
      setSpaces((prevSpaces) => [...(prevSpaces || []), newSpace]);
    };

    useEffect(() => {
        // fetch spaces
    
        const fetchSpaces = async () => {
          const res = await axios.get('/api/space')
          setSpaces(res.data.spaces)
        }
        
        fetchSpaces()
    
      }, [])

    return(
<div className="p-6">
{/* Dialog for adding a new space */}
<DialogDemo addSpace={addSpace} />

{/* Grid layout for spaces */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
  {spaces?.length > 0 && spaces.map((space, index) => (
    <div
      
      key={index}
      className=" bg-blue-400 backdrop-blur-sm bg-opacity-10 border border-blue-500 rounded-lg shadow-lg hover:shadow-xl "
    >
      <div className="p-6">
        {/* Icon for space representation */}
        <div className="flex justify-center mb-4">
          <FaBuilding className=" text-3xl" />
        </div>
        
        {/* Space name */}
        <h2 className="text-xl font-bold  overflow-hidden text-center mb-2">{space.name}</h2>
        
        {/* Testimonials count */}
        <p className="text-center">Total Testimonials Received: <span className="font-semibold">{space.testimonialsCount}</span></p>
        
        {/* Optional Call to Action */}
        <div className="mt-4 flex justify-center">
          {/* <button className="bg-white text-indigo-500 font-semibold py-2 px-4 rounded-lg shadow hover:bg-gray-200">
            View Details
          </button> */}
          <Button onClick={() => router.push(`/dashboard/spaces/${space.name}/${space._id}`)}  variant='outline'>View Details</Button>
        </div>
      </div>
    </div>
  ))}
</div>
</div>
    )
}

const createSpaceSchema = z.object({
    name: z.string().max(50, 'Name must be less than 50 characters').min(3, 'Name must be at least 3 characters'),
  })
  

function DialogDemo({ addSpace }: { addSpace: (newSpace: any) => void }) {
    const [name, setName] = useState('')
    const [errors, setErrors] = useState<any>({})
    const router = useRouter();
  
    const handleCreateSpace = useCallback(async (name: string) => {
      try {
        
        createSpaceSchema.parse({ name });
        console.log(name);
        const res = await axios.post('/api/space', { name });
  
        addSpace(res.data.space);
  
        setErrors({});
  
        router.push(`/dashboard/spaces/${name}/${res.data.space._id}`);
      } catch (error) {
  
        if (error instanceof z.ZodError) {
          const formattedErrors = error.format();
  
          setErrors(formattedErrors);
  
        } else if (axios.isAxiosError(error)) {
          console.error('API Error:', error.response?.data || error.message);
        }
      }
    }, []);
  
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Create New Space</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Space</DialogTitle>
           
            <DialogDescription>
              Each Space Represents Your Business or Project. <br />
              {generateUniqueLink(name, 'Space_Id')}
            </DialogDescription>
  
            {/* <DialogDescription>
   <span className='text-blue-500'>{generateUniqueLink(name, 'Space_Id')}</span>
              </DialogDescription> */}
          
            
            
  
          </DialogHeader>
          <div className="">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              placeholder="eg. My Business"
              className="col-span-3"  
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors?.name && (
              <span className="text-red-500 text-sm mt-1">{errors.name._errors[0]}</span>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => handleCreateSpace(name.replace(/\s+/g, ''))}>Create New Space</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  
    )
  }
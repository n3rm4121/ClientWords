'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { generateUniqueLink } from "@/utils/generateUniqueLink"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { z } from "zod"
import { completeOnboarding } from "@/app/dashboard/action"
import { useSession } from "next-auth/react"

export const Welcome = () => {

    const session = useSession();
    const userId = session.data?.user?.id as string;
    console.log(
        "userid", userId
    )
    const [name, setName] = useState('')
    const [errors, setErrors] = useState<any>({})
    const [loading, setLoading] = useState(false)
    const router = useRouter();

    const createSpaceSchema = z.object({
        name: z.string().max(50, 'Name must be less than 50 characters').min(3, 'Name must be at least 3 characters'),
    })

    const handleCreateSpace = useCallback(async (name: string) => {
        try {

            createSpaceSchema.parse({ name });
            setLoading(true)
            const res = await axios.post('/api/space', { name });

            setErrors({});
            completeOnboarding(userId)
            router.push(`/dashboard/spaces/${name}/${res.data.space._id}`);
            setLoading(false)
        } catch (error) {
            setLoading(false)
            if (error instanceof z.ZodError) {
                const formattedErrors = error.format();

                setErrors(formattedErrors);

            } else if (axios.isAxiosError(error)) {
                console.error('API Error:', error.response?.data || error.message);
            }
        }
    }, []);

    return (
            <Dialog open={true}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Lets Create Your First Space🚀</DialogTitle>

                        <DialogDescription>
                            Each Space Represents Your Business or Project. <br />
                            {generateUniqueLink(name, 'Space_Id')}
                        </DialogDescription>

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

                        <Button loading={loading} onClick={() => handleCreateSpace(name.replace(/\s+/g, ''))}>Create New Space</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
    )
}
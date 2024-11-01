'use client'
import React, { useEffect, useState } from 'react';
import Sidebar from '@/app/dashboard/components/Sidebar';
import Navbar from '@/app/dashboard/components/Navbar';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ToastProvider from '@/components/ToastProvider';
import { getUserSubscriptionTier } from './action';


export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const session = useSession();

    const [isAccountFree, setIsAccountFree] = useState(false);

    useEffect(() => {
        const fetchSubscriptionTier = async () => {
            const subscriptionTier = await getUserSubscriptionTier(session.data?.user?.id as string);
            setIsAccountFree(subscriptionTier === 'Free');
        };
        fetchSubscriptionTier();
    })

    const [isOpen, setIsOpen] = useState(true);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="flex min-h-screen">
            <ToastProvider />

            <Sidebar isOpen={isOpen} isFreeAccount={isAccountFree} />

            <div className={`flex-1 transition-all duration-300`}>
                <Navbar handleToggle={handleToggle} isAccountFree={isAccountFree} />
                <main className={`pt-16`}>
                    <div className={`p-4`}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

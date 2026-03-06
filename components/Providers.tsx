'use client';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CartProvider>
            {children}
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: '#1a1a1a',
                        color: '#fff',
                        border: '1px solid #FFD700',
                        borderRadius: '10px',
                        fontSize: '14px',
                    },
                }}
            />
        </CartProvider>
    );
}

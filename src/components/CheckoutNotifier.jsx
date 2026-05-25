import React, { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../api/api';

const CheckoutNotifier = ({ isAuthenticated }) => {
    // Keep track of notified booking IDs to prevent spamming
    const notifiedBookings = useRef(new Set());

    useEffect(() => {
        if (!isAuthenticated) return;

        const checkUpcomingCheckouts = async () => {
            try {
                // Fetch all checked-in bookings. (limit=100 is enough for active ones)
                const res = await api.get('/bookings', { params: { status: 'Checked-in', limit: 100 } });
                
                if (res.data && res.data.success) {
                    const now = new Date();
                    const bookings = res.data.data;
                    
                    bookings.forEach(booking => {
                        const checkOutTime = new Date(booking.checkOut);
                        // Calculate time difference in minutes
                        const diffMs = checkOutTime - now;
                        const diffMins = Math.floor(diffMs / 1000 / 60);

                        // If checkout is in 30 minutes or less (and not in the past by too much, say -60 mins)
                        if (diffMins <= 30 && diffMins > -60) {
                            if (!notifiedBookings.current.has(booking._id)) {
                                toast.warning(
                                    `Booking Alert: Guest ${booking.guest} in Room ${booking.roomNumber} is checking out in ${diffMins > 0 ? diffMins + ' mins' : 'overdue by ' + Math.abs(diffMins) + ' mins'}.`,
                                    {
                                        autoClose: false,
                                        position: "bottom-right",
                                        theme: "dark"
                                    }
                                );
                                notifiedBookings.current.add(booking._id);
                            }
                        }
                    });
                }
            } catch (error) {
                console.error("Checkout notifier error:", error);
            }
        };

        // Check immediately
        checkUpcomingCheckouts();

        // Then check every 5 minutes
        const interval = setInterval(checkUpcomingCheckouts, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [isAuthenticated]);

    return null; // This is a logic-only component
};

export default CheckoutNotifier;

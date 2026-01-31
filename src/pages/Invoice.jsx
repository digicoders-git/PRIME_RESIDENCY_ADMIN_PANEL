import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReceiptModal from '../components/ReceiptModal';
import api from '../api/api';
import Loader from '../components/Loader';

const Invoice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await api.get(`/bookings/${id}`);
                if (res.data.success) {
                    const b = res.data.data;
                    // Ensure bookingId exists or format it
                    const formattedBooking = {
                        ...b,
                        bookingId: b._id.substring(b._id.length - 6).toUpperCase(),
                        id: b._id // Ensure 'id' prop is available if ReceiptModal uses it
                    };
                    setBooking(formattedBooking);
                }
            } catch (error) {
                console.error('Error fetching booking for invoice:', error);
                navigate('/billing'); // Redirect if invalid
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [id, navigate]);

    if (loading) return <Loader />;

    return (
        <ReceiptModal
            isOpen={true}
            onClose={() => navigate('/billing')}
            booking={booking}
        />
    );
};

export default Invoice;

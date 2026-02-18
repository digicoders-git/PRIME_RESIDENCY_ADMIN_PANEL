import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPrint, FaTimes, FaPhone, FaEnvelope, FaMapMarkerAlt, FaDownload } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../assets/logo.png';

const ReceiptModal = ({ isOpen, onClose, booking }) => {
    const receiptRef = useRef(null);

    if (!isOpen || !booking) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        try {
            const btn = document.getElementById('download-btn');
            const originalText = btn?.innerText || 'Download PDF';
            if (btn) btn.innerText = 'Generating...';

            const element = receiptRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Bill_${booking.bookingId || booking.id.slice(-6).toUpperCase()}.pdf`);

            if (btn) btn.innerText = originalText;
        } catch (error) {
            console.error("Error generating PDF", error);
            const btn = document.getElementById('download-btn');
            if (btn) btn.innerText = 'Failed';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return Number(amount || 0).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR'
        });
    };

    const totalFoodAmount = (booking.foodOrders || []).reduce((sum, order) => sum + (order.amount || 0), 0);
    const totalExtraCharges = (booking.extraCharges || []).reduce((sum, charge) => sum + (charge.amount || 0), 0);
    const grandTotal = booking.amount + totalFoodAmount + totalExtraCharges;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:block print:bg-white"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden print:shadow-none print:max-w-none print:rounded-none"
                >
                    {/* Header - Hidden when printing */}
                    <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 flex justify-between items-center print:hidden">
                        <h3 className="text-white font-bold text-lg">Tax Invoice / Bill</h3>
                        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-2">
                            <FaTimes />
                        </button>
                    </div>

                    {/* Receipt Content */}
                    <div className="p-12 bg-white print:p-8" ref={receiptRef} id="receipt-content">
                        
                        {/* Header */}
                        <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-amber-50 rounded-lg flex items-center justify-center p-2">
                                    <img src={logo} alt="Prime Residency" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-gray-900 uppercase">Prime Residency</h1>
                                    <p className="text-sm text-gray-600 font-medium">Premium Hotel & Suites</p>
                                    <p className="text-xs text-gray-500 mt-1">GST: 07AABCP1234F1Z5</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-5xl font-black text-gray-300 uppercase">BILL</h2>
                                <div className="mt-2 space-y-1">
                                    <p className="text-sm font-bold text-gray-700">Bill No: #{booking.bookingId || booking.id.slice(-6).toUpperCase()}</p>
                                    <p className="text-xs text-gray-600">Date: {new Date().toLocaleDateString('en-IN')}</p>
                                    <p className="text-xs text-gray-600">Time: {new Date().toLocaleTimeString('en-IN')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Customer & Hotel Info */}
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Bill To</h3>
                                <div className="space-y-1">
                                    <p className="font-bold text-lg text-gray-900">{booking.guest}</p>
                                    <p className="text-sm text-gray-600 flex items-center gap-2"><FaPhone size={10} /> {booking.phone}</p>
                                    <p className="text-sm text-gray-600 flex items-center gap-2"><FaEnvelope size={10} /> {booking.email}</p>
                                    {booking.address && <p className="text-sm text-gray-600">{booking.address}</p>}
                                </div>
                            </div>
                            <div className="text-right">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">From</h3>
                                <div className="space-y-1">
                                    <p className="font-bold text-lg text-gray-900">Prime Residency</p>
                                    <p className="text-sm text-gray-600 flex items-center justify-end gap-2"><FaMapMarkerAlt size={10} /> Near Railway Station, Delhi</p>
                                    <p className="text-sm text-gray-600 flex items-center justify-end gap-2"><FaPhone size={10} /> +91 98765 43210</p>
                                    <p className="text-sm text-gray-600 flex items-center justify-end gap-2"><FaEnvelope size={10} /> info@primeresidency.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Booking Details */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-8 grid grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-xs text-gray-500 font-semibold">Room</p>
                                <p className="text-sm font-bold text-gray-900">{booking.room}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold">Check-In</p>
                                <p className="text-sm font-bold text-gray-900">{formatDate(booking.checkIn)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold">Check-Out</p>
                                <p className="text-sm font-bold text-gray-900">{formatDate(booking.checkOut)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold">Nights</p>
                                <p className="text-sm font-bold text-gray-900">{booking.nights}</p>
                            </div>
                        </div>

                        {/* Bill Table */}
                        <table className="w-full mb-8">
                            <thead>
                                <tr className="bg-gray-100 border-y-2 border-gray-300">
                                    <th className="py-3 px-4 text-left text-xs font-black text-gray-700 uppercase">Description</th>
                                    <th className="py-3 px-4 text-center text-xs font-black text-gray-700 uppercase">Rate</th>
                                    <th className="py-3 px-4 text-center text-xs font-black text-gray-700 uppercase">Qty</th>
                                    <th className="py-3 px-4 text-right text-xs font-black text-gray-700 uppercase">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="py-3 px-4">
                                        <p className="font-bold text-gray-900">Room Charges - {booking.room}</p>
                                        <p className="text-xs text-gray-500">{formatDate(booking.checkIn)} to {formatDate(booking.checkOut)}</p>
                                    </td>
                                    <td className="py-3 px-4 text-center text-gray-700">{formatCurrency(booking.amount / (booking.nights || 1))}</td>
                                    <td className="py-3 px-4 text-center text-gray-700">{booking.nights}</td>
                                    <td className="py-3 px-4 text-right font-bold text-gray-900">{formatCurrency(booking.amount)}</td>
                                </tr>
                                {(booking.foodOrders || []).map((order, idx) => (
                                    <tr key={`food-${idx}`}>
                                        <td className="py-3 px-4">
                                            <p className="font-bold text-gray-900">Food: {order.item}</p>
                                            <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString('en-IN')}</p>
                                        </td>
                                        <td className="py-3 px-4 text-center text-gray-700">{formatCurrency(order.price)}</td>
                                        <td className="py-3 px-4 text-center text-gray-700">{order.quantity}</td>
                                        <td className="py-3 px-4 text-right font-bold text-gray-900">{formatCurrency(order.amount)}</td>
                                    </tr>
                                ))}
                                {(booking.extraCharges || []).map((charge, idx) => (
                                    <tr key={`extra-${idx}`}>
                                        <td className="py-3 px-4">
                                            <p className="font-bold text-gray-900">Extra: {charge.description}</p>
                                            <p className="text-xs text-gray-500">{new Date(charge.date).toLocaleDateString('en-IN')}</p>
                                        </td>
                                        <td className="py-3 px-4 text-center text-gray-700">-</td>
                                        <td className="py-3 px-4 text-center text-gray-700">1</td>
                                        <td className="py-3 px-4 text-right font-bold text-gray-900">{formatCurrency(charge.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="flex justify-end mb-8">
                            <div className="w-80 space-y-3">
                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="text-sm font-semibold text-gray-600">Subtotal</span>
                                    <span className="text-sm font-bold text-gray-900">{formatCurrency(grandTotal)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="text-sm font-semibold text-gray-600">Advance Paid</span>
                                    <span className="text-sm font-bold text-emerald-600">(-) {formatCurrency(booking.advance)}</span>
                                </div>
                                <div className="flex justify-between py-3 bg-amber-50 px-4 rounded-lg border-2 border-amber-200">
                                    <span className="text-base font-black text-gray-900 uppercase">Balance Due</span>
                                    <span className="text-xl font-black text-amber-600">{formatCurrency(grandTotal - booking.advance)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t-2 border-gray-200 pt-6 flex justify-between items-end">
                            <div>
                                <p className="text-xs text-gray-500 font-semibold mb-2">Terms & Conditions:</p>
                                <p className="text-xs text-gray-500 leading-relaxed max-w-md">
                                    1. Payment is due upon receipt of this bill.<br />
                                    2. Late checkout charges may apply after 11:00 AM.<br />
                                    3. This is a computer-generated bill and requires no signature.
                                </p>
                            </div>
                            <div className="text-center">
                                <div className={`px-6 py-2 border-2 rounded-lg font-black text-lg uppercase rotate-[-12deg] ${
                                    booking.paymentStatus === 'Paid' ? 'border-emerald-500 text-emerald-500' :
                                    booking.paymentStatus === 'Partial' ? 'border-amber-500 text-amber-500' :
                                    'border-rose-500 text-rose-500'
                                }`}>
                                    {booking.paymentStatus}
                                </div>
                                <p className="text-xs text-gray-400 font-bold uppercase mt-4">Authorized Signature</p>
                            </div>
                        </div>

                        {/* Bottom Bar */}
                        <div className="mt-8 pt-4 border-t border-gray-200 text-center">
                            <p className="text-xs text-gray-500">Thank you for choosing Prime Residency. We hope to serve you again!</p>
                        </div>
                    </div>

                    {/* Footer Actions - Hidden when printing */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3 print:hidden">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-lg"
                        >
                            <FaPrint /> Print Bill
                        </button>
                        <button
                            id="download-btn"
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-lg"
                        >
                            <FaDownload /> Download PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-bold text-sm transition-colors cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>

                {/* Print Styles */}
                <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        #receipt-content, #receipt-content * { visibility: visible; }
                        #receipt-content {
                            position: fixed;
                            left: 0;
                            top: 0;
                            width: 100%;
                            padding: 20px;
                        }
                        @page { size: A4; margin: 10mm; }
                    }
                `}</style>
            </motion.div>
        </AnimatePresence>
    );
};

export default ReceiptModal;

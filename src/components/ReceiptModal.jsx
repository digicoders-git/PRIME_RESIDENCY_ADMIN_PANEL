import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPrint, FaTimes, FaFileExcel } from 'react-icons/fa';
import logo from '../assets/logo.png';
import { exportFormattedInvoice } from '../utils/exportInvoiceExcel';

const numberToWords = (num) => {
    const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
    const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
    if ((num = num.toString()).length > 9) return 'Overflow';
    let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return ''; 
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'And ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim() ? str.trim().toUpperCase() + ' ONLY' : 'ZERO ONLY';
};

const ReceiptModal = ({ isOpen, onClose, booking }) => {
    const receiptRef = useRef(null);

    if (!isOpen || !booking) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleExportExcel = () => {
        exportFormattedInvoice(booking, amountInWords, cgst, sgst, grandTotal, formatDateTime, logo);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        const datePart = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
        let hours = d.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        const timePart = `${String(hours).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${ampm}`;
        return `${datePart} ${timePart}`;
    };

    const taxRate = booking.taxGST || 0;
    const gstType = booking.gstType || 'CGST+SGST';
    
    let pricePerDay = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    
    if (taxRate > 0) {
        const totalNights = booking.nights || 1;
        
        // Calculate total tax
        const totalBase = booking.amount / (1 + (taxRate / 100));
        const totalTax = booking.amount - totalBase;
        
        // Round tax amounts to 2 decimal places first
        if (gstType === 'CGST+SGST') {
            cgst = Math.round((totalTax / 2) * 100) / 100;
            sgst = Math.round((totalTax / 2) * 100) / 100;
        } else if (gstType === 'IGST') {
            igst = Math.round(totalTax * 100) / 100;
        }
        
        // Calculate base price dynamically from the exact remaining amount to prevent 1-paisa mismatches
        const baseAmount = booking.amount - (cgst + sgst + igst);
        pricePerDay = baseAmount / totalNights;
    } else {
        // No tax: price per day is total amount divided by nights
        pricePerDay = booking.amount / (booking.nights || 1);
    }

    const totalFoodAmount = (booking.foodOrders || []).reduce((sum, order) => sum + (order.amount || 0), 0);
    const totalExtraCharges = (booking.extraCharges || []).reduce((sum, charge) => sum + (charge.amount || 0), 0);
    const grandTotal = Math.round(booking.amount + totalFoodAmount + totalExtraCharges);
    const amountInWords = numberToWords(grandTotal);

    // Max 3 empty rows — taaki 1 A4 page mein sab fit ho
    const filledRows = 1 + (booking.foodOrders?.length || 0) + (booking.extraCharges?.length || 0);
    const emptyRowsCount = Math.max(0, Math.min(3, 5 - filledRows));
    const emptyRows = Array(emptyRowsCount).fill(0);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 py-10 overflow-y-auto print:p-0 print:block print:bg-white"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white shadow-2xl max-w-[900px] w-full overflow-hidden print:shadow-none print:max-w-none print:w-full mx-auto mt-10 print:mt-0"
                >
                    {/* Header Controls */}
                    <div className="bg-gray-800 px-6 py-4 flex justify-between items-center print:hidden">
                        <h3 className="text-white font-bold text-lg">Hotel Bill Preview</h3>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded font-bold text-sm transition-colors cursor-pointer"
                            >
                                <FaPrint /> Print Bill
                            </button>
                            <button
                                onClick={handleExportExcel}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-sm transition-colors cursor-pointer"
                            >
                                <FaFileExcel /> Export Excel
                            </button>
                            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-2 ml-2 cursor-pointer">
                                <FaTimes size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Receipt Content */}
                    <div className="p-8 bg-white print:p-0 invoice-container" ref={receiptRef}>
                        
                        <table id="invoice-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontFamily: 'Arial, sans-serif', fontSize: '13px', color: 'black' }}>
                            <tbody>
                                {/* Row 1: Header */}
                                <tr style={{ backgroundColor: '#fcd5b4' }}>
                                    <td colSpan="3" style={{ border: '1px solid black', padding: '4px 8px', fontWeight: 'bold' }}>Page No.1</td>
                                    <td colSpan="4" style={{ border: '1px solid black', padding: '4px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>Hotel Bill</td>
                                    <td colSpan="2" style={{ border: '1px solid black', padding: '4px 8px', textAlign: 'right' }}>Original Copy</td>
                                </tr>

                                {/* Row 2: Hotel Details */}
                                <tr>
                                    <td colSpan="3" style={{ border: '1px solid black', padding: '10px', textAlign: 'center', width: '30%', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px' }}>
                                            <img src={logo} alt="PRIME RESIDENCY" style={{ width: '120px', height: 'auto', maxHeight: '100px', objectFit: 'contain' }} />
                                        </div>
                                    </td>
                                    <td colSpan="6" style={{ border: '1px solid black', padding: '15px' }}>
                                        <h2 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold' }}>Hotel Name - PRIME RESIDENCY</h2>
                                        <p style={{ margin: '2px 0' }}><strong>Address -</strong> Harpur, Ballia (UP) 277001 India</p>
                                        <p style={{ margin: '2px 0' }}><strong>Mobile:</strong> +91 09118808054, 7522808054 | <strong>Email:</strong> primeresidencyballia@gmail.com</p>
                                        <p style={{ margin: '2px 0' }}><strong>GSTIN -</strong> 09DWBPS1315G1ZM | <strong>PAN -</strong> xxxxxxxxxx</p>
                                    </td>
                                </tr>

                                {/* Row 3: Billing Details */}
                                <tr style={{ backgroundColor: '#cce6eb' }}>
                                    <td colSpan="5" style={{ border: '1px solid black', padding: '10px', verticalAlign: 'top', width: '60%' }}>
                                        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Billing Details</p>
                                        <p style={{ margin: '2px 0' }}><strong>Name - </strong> {booking.guest?.toUpperCase()}</p>
                                        <p style={{ margin: '2px 0' }}><strong>Address - </strong> {booking.address ? booking.address.toUpperCase() : ''}</p>
                                        <p style={{ margin: '2px 0' }}><strong>Phone No - </strong> {booking.phone}</p>
                                        {/* <p style={{ margin: '2px 0' }}><strong>Email ID - </strong> {booking.email}</p> */}
                                        {/* <p style={{ margin: '2px 0' }}><strong>{booking.idType || 'Aadhar'} No - </strong> {booking.idNumber}</p> */}
                                    </td>
                                    <td colSpan="4" style={{ border: '1px solid black', padding: '10px', verticalAlign: 'top' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                                            <tbody>
                                                <tr>
                                                    <td style={{ padding: '2px 0' }}>Invoice Number</td>
                                                    <td style={{ padding: '2px 0', fontWeight: 'bold' }}>: {booking.bookingId || booking.id?.slice(-6).toUpperCase()}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '2px 0' }}>Invoice Date</td>
                                                    <td style={{ padding: '2px 0', fontWeight: 'bold' }}>: {formatDateTime(new Date())}</td>
                                                </tr>
                                                <tr><td colSpan="2" style={{ padding: '4px 0' }}></td></tr>
                                                <tr>
                                                    <td style={{ padding: '2px 0' }}>Check In</td>
                                                    <td style={{ padding: '2px 0', fontWeight: 'bold' }}>: {formatDateTime(booking.checkIn)}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '2px 0' }}>Check Out</td>
                                                    <td style={{ padding: '2px 0', fontWeight: 'bold' }}>: {formatDateTime(booking.checkOut)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>

                                {/* Row 4: Column Headers */}
                                <tr style={{ backgroundColor: '#eef5e0', textAlign: 'center', fontWeight: 'bold' }}>
                                    <td style={{ border: '1px solid black', padding: '8px 2px', width: '9%' }}>Room No</td>
                                    <td style={{ border: '1px solid black', padding: '8px 2px', width: '9%' }}>No of Days</td>
                                    <td style={{ border: '1px solid black', padding: '8px 2px', width: '9%' }}>Extra Bed</td>
                                    <td style={{ border: '1px solid black', padding: '8px 2px', width: '11%' }}>HSN/SAC</td>
                                    <td style={{ border: '1px solid black', padding: '8px 2px', width: '9%' }}>IGST 5%</td>
                                    <td style={{ border: '1px solid black', padding: '8px 2px', width: '11%' }}>CGST 2.5%</td>
                                    <td style={{ border: '1px solid black', padding: '8px 2px', width: '11%' }}>SGST 2.5%</td>
                                    <td style={{ border: '1px solid black', padding: '8px 2px', width: '14%' }}>Price/Day</td>
                                    <td style={{ border: '1px solid black', padding: '8px 2px', width: '17%' }}>Amount (₹)</td>
                                </tr>

                                {/* Main Room Entry */}
                                <tr style={{ textAlign: 'center' }}>
                                    <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px 4px' }}>{booking.room}</td>
                                    <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px 4px' }}>{booking.nights || 1}</td>
                                    <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px 4px' }}>{booking.extraBed ? '1' : ''}</td>
                                    <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px 4px' }}>996311</td>
                                    <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px 4px' }}>{igst > 0 ? igst.toFixed(2) : '0.00'}</td>
                                    <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px 4px' }}>{cgst > 0 ? cgst.toFixed(2) : '0.00'}</td>
                                    <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px 4px' }}>{sgst > 0 ? sgst.toFixed(2) : '0.00'}</td>
                                    <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px 4px' }}>{pricePerDay.toFixed(2)}</td>
                                    <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px 4px' }}>{booking.amount.toFixed(2)}</td>
                                </tr>

                                {/* Extra Items (Food/Charges) */}
                                {(booking.foodOrders || []).map((order, i) => (
                                    <tr key={`food-${i}`} style={{ textAlign: 'center' }}>
                                        <td colSpan="7" style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px 4px', textAlign: 'left', paddingLeft: '10px' }}>Food Order: {order.item} (Qty: {order.quantity})</td>
                                        <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px 4px' }}>{order.price.toFixed(2)}</td>
                                        <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px 4px' }}>{order.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                                {(booking.extraCharges || []).map((charge, i) => (
                                    <tr key={`extra-${i}`} style={{ textAlign: 'center' }}>
                                        <td colSpan="7" style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px 4px', textAlign: 'left', paddingLeft: '10px' }}>Extra Charge: {charge.description}</td>
                                        <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px 4px' }}>-</td>
                                        <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px 4px' }}>{charge.amount.toFixed(2)}</td>
                                    </tr>
                                ))}

                                {/* Empty Spacer Rows */}
                                {emptyRows.map((_, i) => (
                                    <tr key={`empty-${i}`} style={{ textAlign: 'center' }}>
                                        <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '12px 4px' }}>&nbsp;</td>
                                        <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '12px 4px' }}></td>
                                        <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '12px 4px' }}></td>
                                        <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '12px 4px' }}></td>
                                        <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '12px 4px' }}></td>
                                        <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '12px 4px' }}></td>
                                        <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '12px 4px' }}></td>
                                        <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '12px 4px' }}></td>
                                        <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '12px 4px' }}></td>
                                    </tr>
                                ))}

                                {/* Footer Totals */}
                                <tr>
                                    <td colSpan="8" style={{ border: '1px solid black', borderBottom: 'none', padding: '6px 10px', textAlign: 'center', fontWeight: 'bold' }}>Rounded Off (+)</td>
                                    <td style={{ border: '1px solid black', borderBottom: 'none', padding: '6px 4px', textAlign: 'center' }}>+0.00</td>
                                </tr>
                                <tr style={{ backgroundColor: '#cce6eb' }}>
                                    <td colSpan="8" style={{ border: '1px solid black', padding: '6px 10px', textAlign: 'center', fontWeight: 'bold' }}>Total</td>
                                    <td style={{ border: '1px solid black', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>{grandTotal.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colSpan="8" style={{ border: '1px solid black', padding: '6px 10px', textAlign: 'center', fontWeight: 'bold' }}>Advance Paid</td>
                                    <td style={{ border: '1px solid black', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold', color: 'green' }}>{Number(booking.advance || 0).toFixed(2)}</td>
                                </tr>
                                <tr style={{ backgroundColor: '#fff3cd' }}>
                                    <td colSpan="8" style={{ border: '1px solid black', padding: '6px 10px', textAlign: 'center', fontWeight: 'bold' }}>Balance Due</td>
                                    <td style={{ border: '1px solid black', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold', color: 'red' }}>{Math.max(0, grandTotal - (booking.advance || 0)).toFixed(2)}</td>
                                </tr>

                                {/* Amount in Words */}
                                <tr style={{ backgroundColor: '#e2dae6' }}>
                                    <td colSpan="9" style={{ border: '1px solid black', padding: '8px 10px', fontWeight: 'bold' }}>
                                        In Words - Rs. {amountInWords}
                                    </td>
                                </tr>

                                {/* Rules and Signatures */}
                                <tr>
                                    <td colSpan="5" style={{ border: '1px solid black', padding: '10px', verticalAlign: 'top' }}>
                                        <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '12px' }}>Please Note -</p>
                                        <p style={{ margin: '2px 0', fontSize: '12px' }}>1. Deposited your Key card at the receptionist</p>
                                        <p style={{ margin: '2px 0', fontSize: '12px' }}>2. Cross-check the room thoroughly before checking out</p>
                                    </td>
                                    <td colSpan="2" style={{ border: '1px solid black', padding: '10px', verticalAlign: 'top', textAlign: 'center' }}>
                                        <p style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 'bold', color: booking.paymentStatus === 'Paid' ? 'green' : 'red' }}>
                                            {booking.paymentStatus?.toUpperCase() || 'UNPAID'}
                                        </p>
                                        <p style={{ margin: '0', fontSize: '13px' }}>Billing Officer's</p>
                                        <p style={{ margin: '0', fontSize: '13px' }}>Signature</p>
                                    </td>
                                    <td colSpan="2" style={{ border: '1px solid black', padding: '10px', verticalAlign: 'top', textAlign: 'center' }}>
                                        <p style={{ margin: '0', fontSize: '13px' }}>Guest's</p>
                                        <p style={{ margin: '0', fontSize: '13px' }}>Signature</p>
                                        <div style={{ height: '40px' }}></div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                    </div>
                </motion.div>

                {/* Print Styles */}
                <style>{`
                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 8mm 6mm;
                        }
                        body * { visibility: hidden; }
                        .invoice-container, .invoice-container * { visibility: visible; }
                        .invoice-container {
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            padding: 0;
                        }
                        .invoice-container table {
                            font-size: 10px !important;
                        }
                        .invoice-container td,
                        .invoice-container th {
                            padding: 3px 3px !important;
                        }
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }
                `}</style>
            </motion.div>
        </AnimatePresence>
    );
};

export default ReceiptModal;

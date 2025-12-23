import "./ShoppingBill.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart, useToast, useOrders } from "../../index"
import axios from "axios"
import { loadRazorpayScript } from "../../UtilityFunctions/loadRazorpayScript"

const BASE_URL = process.env.REACT_APP_BASE_URL;

function ShoppingBill()
{
    const navigate = useNavigate()
    const { userCart, dispatchUserCart } = useCart()
    const { showToast } = useToast()
    const { dispatchUserOrders }= useOrders()
    let totalDiscount = 0, totalBill = 0, finalBill = 0;
    const [ couponName, setCouponName ] = useState("")

    userCart.forEach(product => {
        const originalPrice = product.originalPrice || 0;
        const discountedPrice = product.discountedPrice || 0;
        const quantity = product.quantity || 1;

        let discountOnCurrentProduct = ((originalPrice - discountedPrice) * quantity);
        totalDiscount = totalDiscount + discountOnCurrentProduct;
        totalBill = totalBill + (discountedPrice * quantity);
    })

    if(couponName==="BOOKS200")
    {
        finalBill = totalBill - 200;
    }
    else
    {
        finalBill = totalBill;
    }

    async function displayRazorPay()
    {
        const res = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");

        if (!res) {
            console.error("Razorpay SDK failed to load");
            showToast("error", "", "Razorpay SDK failed to load, kindly check internet connection!");
            return;
        }

        let finalBillAmount = (finalBill * 100).toString();

        try {
            const dataResponse = await axios.post(
                `${BASE_URL}/api/razorpay`,
                { finalBillAmount }
            );

            console.log("Backend response:", dataResponse.data);
            let data = dataResponse.data;

            const options = {
                key: "rzp_test_RhzO07LQhC4Twd", // Updated to match .env credentials
                amount: data.amount,
                currency: data.currency,
                name: "Bookztron",
                description: "Thank you for shopping!",
                image: "https://raw.githubusercontent.com/Naman-Saxena1/Bookztron-E-Commerce_Book_Store/development/public/favicon-icon.png",
                order_id: data.id,
                handler: async function (response) {
                    console.log("Payment response:", response);
                    showToast("success", "", "Payment Successful! 😎");
                    showToast("success", "", "Order added to your bag!");

                    let newOrderItemsArray = userCart.map(orderItem => {
                        return { ...orderItem, orderId: data.id };
                    });

                    let ordersUpdatedResponse = await axios.post(
                        `${BASE_URL}/api/orders`,
                        { newOrderItemsArray },
                        { headers: { 'x-access-token': localStorage.getItem('token') } }
                    );

                    let emptyCartResponse = await axios.patch(
                        `${BASE_URL}/api/cart/empty/all`,
                        {},
                        { headers: { 'x-access-token': localStorage.getItem('token') } }
                    );

                    if (emptyCartResponse.data.status === 'ok') {
                        dispatchUserCart({ type: "UPDATE_USER_CART", payload: [] });
                    }

                    if (ordersUpdatedResponse.data.status === 'ok') {
                        dispatchUserOrders({ type: "UPDATE_USER_ORDERS", payload: ordersUpdatedResponse.data.user.orders });
                        navigate('/orders');
                    }
                },
                prefill: {
                    name: "Your Name",
                    email: "your.email@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#3399cc"
                }
            };

            var paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error("Error in displayRazorPay:", error);
            showToast("error", "", "Oops! Something went wrong. Error in opening checkout");
        }
    }

    function TestRazorpayButton() {
        async function testRazorpayCheckout() {
            const res = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");

            if (!res) {
                console.error("Razorpay SDK failed to load");
                return;
            }

            const options = {
                key: "rzp_test_RhzO07LQhC4Twd", // Updated to match .env credentials
                amount: 100,
                currency: "INR",
                name: "Test Checkout",
                description: "Testing Razorpay Checkout",
                order_id: "order_Rv0AICN7Vr3esf",
                handler: function (response) {
                    console.log("Payment response:", response);
                },
                prefill: {
                    name: "Test User",
                    email: "test.user@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#3399cc"
                }
            };

            var paymentObject = new window.Razorpay(options);
            paymentObject.open();
        }

        return (
            <button onClick={testRazorpayCheckout} className="test-razorpay-btn">
                Test Razorpay Checkout
            </button>
        );
    }

    return (
        <div className="cart-bill">
            <h2 className="bill-heading">Bill Details</h2>

            <hr></hr>
            {
                userCart.map(product => {
                    const discountedPrice = product.discountedPrice || 0;
                    const quantity = product.quantity || 1;

                    return (
                        <div key={product._id} className="cart-price-container">
                            <div className="cart-item-bookname">
                                <p>{product.bookName}</p>
                            </div>
                            <div className="cart-item-quantity">
                                <p>X {quantity}</p>
                            </div>
                            <div className="cart-item-total-price" id="price-sum">
                                <p>&#8377;{discountedPrice * quantity}</p>
                            </div>
                        </div>
                    );
                })
            }
            
            <hr></hr>

            <div className="cart-discount-container">
                <div className="cart-item-total-discount">
                    <p>Discount</p>
                </div>
                <div className="cart-item-total-discount-amount" id="price-sum">
                    <p>&#8377; {totalDiscount}</p>
                </div>
            </div>

            <div className="cart-delivery-charges-container">
                <div className="cart-item-total-delivery-charges">
                    <p>Delivery Charges</p>
                </div>
                <div className="cart-item-total-delivery-charges-amount" id="price-sum">
                    <p id="delivery-charges">&#8377; 50</p>
                </div>
            </div>

            <hr></hr>

            <div className="cart-total-charges-container">
                <div className="cart-item-total-delivery-charges">
                    <p><b>Total Charges</b></p>
                </div>
                <div className="cart-item-total-delivery-charges-amount" id="price-sum">
                    <p id="total-charges"><b>&#8377; {finalBill}</b></p>
                </div>
            </div>

            <hr></hr>

            <div className="apply-coupon-container">
                <p>Apply Coupon</p>
                <input
                    value={couponName}
                    onChange={(event)=>setCouponName(event.target.value)}
                    placeholder="Try BOOKS200"
                ></input>
            </div>

            <button 
                className="place-order-btn solid-secondary-btn"
                onClick={displayRazorPay}
            >
                Place Order
            </button>

            <TestRazorpayButton />
        </div>
    )
}

export { ShoppingBill }
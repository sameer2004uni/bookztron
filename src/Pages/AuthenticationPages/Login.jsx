import React, { useState, useEffect } from "react"
import jwt_decode from "jwt-decode"
import "./UserAuth.css"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { 
    useToast, 
    useUserLogin, 
    useWishlist,
    useCart,
    useOrders
} from "../../index"

const BASE_URL = process.env.REACT_APP_BASE_URL;

function Login()
{
    const { setUserLoggedIn }       = useUserLogin()
    const { showToast }             = useToast()
    const { dispatchUserWishlist }  = useWishlist()
    const { dispatchUserCart }      = useCart()
    const { dispatchUserOrders }    = useOrders()

    const [userEmail    , setUserEmail]    = useState('')
    const [otp          , setOtp]          = useState('')
    const [step         , setStep]         = useState(1) // 1: enter email, 2: enter OTP

    useEffect(()=>{
        const token=localStorage.getItem('token')

        if(token)
        {
            const user = jwt_decode(token)
            if(!user)
            {
                localStorage.removeItem('token')
            }
            else
            {
                (async function getUpdatedWishlistAndCart()
                {
                    let updatedUserInfo = await axios.get(
                    `${BASE_URL}/api/user`,
                    {
                        headers:
                        {
                        'x-access-token': localStorage.getItem('token'),
                        }
                    })

                    if(updatedUserInfo.data.status==="ok")
                    {
                        dispatchUserWishlist({type: "UPDATE_USER_WISHLIST",payload: updatedUserInfo.data.user.wishlist})
                        dispatchUserCart({type: "UPDATE_USER_CART",payload: updatedUserInfo.data.user.cart})
                        dispatchUserOrders({type: "UPDATE_USER_ORDERS",payload: updatedUserInfo.data.user.orders})
                    }
                })()
            }
        }   
    },[])

    const navigate = useNavigate()

    async function sendOtp(event)
    {
        event.preventDefault();
        try {
            const res = await axios.post(
                `${BASE_URL}/api/send-otp`,
                { userEmail }
            )
            if(res.data.status === "ok") {
                showToast("success", "", "OTP sent to your email")
                setStep(2)
            } else {
                throw new Error("Failed to send OTP")
            }
        } catch (err) {
            showToast("error", "", "Error sending OTP. Please try again")
        }
    }

    async function verifyOtp(event)
    {
        event.preventDefault();
        try {
            const res = await axios.post(
                `${BASE_URL}/api/verify-otp`,
                { userEmail, otp }
            )
            if(res.data.user)
            {
                localStorage.setItem('token',res.data.user)
                showToast("success","","Logged in successfully")
                setUserLoggedIn(true)
                dispatchUserWishlist({type: "UPDATE_USER_WISHLIST",payload: res.data.wishlist})
                dispatchUserCart({type: "UPDATE_USER_CART",payload: res.data.cart})
                dispatchUserOrders({type: "UPDATE_USER_ORDERS",payload: res.data.orders})
                navigate('/shop')
            }
            else
            {
                throw new Error("Invalid OTP")
            }
        } catch (err) {
            showToast("error","","Invalid OTP. Please try again")
        }
    }

    return (
        <div className="user-auth-content-container">
            <form onSubmit={step === 1 ? sendOtp : verifyOtp} className="user-auth-form">
                <h2>Login</h2>
                
                <div className="user-auth-input-container">
                    <label htmlFor="user-auth-input-email"><h4>Email address</h4></label>
                    <input 
                        id="user-auth-input-email" 
                        className="user-auth-form-input" 
                        type="email" 
                        placeholder="Email" 
                        value={userEmail}
                        onChange={(event)=>setUserEmail(event.target.value)}
                        required
                        disabled={step === 2}/>
                </div>

                {step === 2 && (
                    <div className="user-auth-input-container">
                        <label htmlFor="user-auth-input-otp"><h4>OTP</h4></label>
                        <input 
                            id="user-auth-input-otp" 
                            className="user-auth-form-input" 
                            type="text" 
                            placeholder="Enter OTP" 
                            value={otp}
                            onChange={(event)=>setOtp(event.target.value)}
                            required/>
                    </div>
                )}

                <div className="user-options-container">
                    <div className="remember-me-container">
                        <input type="checkbox" id="remember-me"/>
                        <label htmlFor="remember-me">Remember Me</label>
                    </div>
                    <div>
                        <Link to="#" className="links-with-blue-underline" id="forgot-password">
                            Forgot Password?
                        </Link>
                    </div>
                </div>

                <button type="submit" className="solid-success-btn form-user-auth-submit-btn">
                    {step === 1 ? "Send OTP" : "Verify OTP"}
                </button>

                {step === 2 && (
                    <button type="button" onClick={() => setStep(1)} className="solid-secondary-btn form-user-auth-submit-btn">
                        Back
                    </button>
                )}

                <div className="new-user-container">
                    <Link to="/signup" className="links-with-blue-underline" id="new-user-link">
                        Create new account &nbsp; 
                    </Link>
                </div>

            </form>
        </div>
    )
}

export { Login }
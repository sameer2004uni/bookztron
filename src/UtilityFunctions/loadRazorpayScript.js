function loadRazorpayScript(scriptSourceString)
{
    return new Promise((resolve)=>{
        const script = document.createElement('script')
        script.src = scriptSourceString
        script.onload = ()=>{resolve(true)}
        script.onerror= ()=>{resolve(false)}
        document.body.appendChild(script)
    })
}

async function loadRazorpayCheckoutScript() {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return new Promise((resolve) => {
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
    });
}

export { loadRazorpayScript, loadRazorpayCheckoutScript }
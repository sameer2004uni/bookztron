import { useReducer, createContext, useContext } from "react"
import axios from 'axios';

const OrdersContext = createContext()

const updateOrdersFunc = (state,action) => {
    switch(action.type)
    {
        case "UPDATE_USER_ORDERS" : 
            {
                return [...action.payload]
            }
        default : return state 
    }
}

const OrdersContextProvider = ({children}) => {
    const [userOrders, dispatchUserOrders] = useReducer(updateOrdersFunc,[])

    return (
        <OrdersContext.Provider value={{userOrders, dispatchUserOrders}}>
            {children}
        </OrdersContext.Provider>
    )
}

const fetchAndUpdateOrders = async (dispatchUserOrders) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/orders', {
            headers: {
                'x-access-token': token,
            },
        });

        if (response.data.status === 'ok') {
            dispatchUserOrders({ type: 'UPDATE_USER_ORDERS', payload: response.data.user.orders });
        } else {
            console.error('Failed to fetch orders:', response.data.message);
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
};

let useOrders = () => useContext(OrdersContext)

export { useOrders, OrdersContextProvider, fetchAndUpdateOrders };
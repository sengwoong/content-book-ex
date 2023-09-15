import React, { createContext, useReducer, useMemo, useEffect } from "react";

// Define action types
const UPDATE_ITEM_COUNT = "UPDATE_ITEM_COUNT";
const RESET_ORDER_DATA = "RESET_ORDER_DATA";

// Reducer function
function orderReducer(state, action) {
  switch (action.type) {
    case UPDATE_ITEM_COUNT:
      const { itemName, newItemCount, orderType } = action.payload;
      const newOrderCounts = { ...state.orderCounts };
      const orderCountsMap = newOrderCounts[orderType];
      orderCountsMap.set(itemName, parseInt(newItemCount));
      return {
        ...state,
        orderCounts: newOrderCounts,
      };
    case RESET_ORDER_DATA:
      return {
        ...state,
        orderCounts: {
          products: new Map(),
          options: new Map(),
        },
      };
    default:
      return state;
  }
}

export const OrderContext = createContext();

const pricePerItem = {
  products: 1000,
  options: 500,
};

function calculateSubtotal(orderType, orderCounts) {
  let optionCount = 0;
  for (const count of orderCounts[orderType].values()) {
    optionCount += count;
  }
  return optionCount * pricePerItem[orderType];
}

export function OrderContextProvider(props) {
  const initialState = {
    orderCounts: {
      products: new Map(),
      options: new Map(),
    },
    totals: {
      products: 0,
      options: 0,
      total: 0,
    },
  };

  const [state, dispatch] = useReducer(orderReducer, initialState);

  useEffect(() => {
    const productsTotal = calculateSubtotal("products", state.orderCounts);
    const optionsTotal = calculateSubtotal("options", state.orderCounts);
    const total = productsTotal + optionsTotal;
    dispatch({
      type: "UPDATE_TOTALS",
      payload: { productsTotal, optionsTotal, total },
    });
  }, [state.orderCounts]);

  const value = useMemo(() => {
    return [state, dispatch];
  }, [state]);

  return <OrderContext.Provider value={value} {...props} />;
}

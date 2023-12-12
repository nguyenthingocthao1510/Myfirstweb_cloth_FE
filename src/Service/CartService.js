import axios from "axios";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const getToken = () => {
  return JSON.parse(localStorage.getItem("User")).token;
};

const getAuthHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getUserIdFromLocalStorage = () => {
  const user = JSON.parse(localStorage.getItem("User"));
  return user?.accounts?.id || null;
};

export const ListAllCart = async () => {
  try {
    const user_id = getUserIdFromLocalStorage();
    if (!user_id) {
      throw new Error("User ID not found in local storage");
    }

    // Assuming you have an API call to get cart information, replace the next line accordingly
    const response = await axios.get(`${backendUrl}/api/cart/${user_id}`, {
      headers: getAuthHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching cart data:", error);
    throw new Error("Error fetching cart data");
  }
};

export const AddProduct = async (cartItem) => {
  try {
    const user_id = getUserIdFromLocalStorage();
    if (!user_id) {
      throw new Error("User ID not found in local storage");
    }

    console.log("Adding product to cart:", cartItem);

    const response = await axios.post(
      `${backendUrl}/api/cart/${user_id}`,
      cartItem,
      {
        headers: getAuthHeaders(),
      }
    );

    console.log("Full API Response:", response); // Log the full response

    const cart_id = response.data.cart_id;
    if (cart_id === undefined) {
      console.error("Cart ID is undefined in the API response");
      // Handle the case where cart_id is undefined, perhaps by throwing an error or taking appropriate action
    } else {
      console.log("Cart ID after adding product:", cart_id);
    }

    return response.data;
  } catch (error) {
    console.error("Error adding new product to cart:", error.message);
    throw new Error("Error adding new product to cart");
  }
};

export const UpdateProduct = async (id, updateData) => {
  try {
    const user_id = getUserIdFromLocalStorage();
    if (!user_id) {
      throw new Error("User ID not found in local storage");
    }

    // Ensure that id is not null or undefined
    if (id == null) {
      console.error("Product ID is null or undefined");
      throw new Error("Product ID is null or undefined");
    }

    // Ensure that updateData is not null or undefined, set it to an empty object if so
    if (updateData == null) {
      console.warn(
        "Update data is null or undefined, setting it to an empty object"
      );
      updateData = {};
    }

    const response = await axios.put(
      `${backendUrl}/api/cart/update/${id}/${user_id}`,
      updateData,
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating product:", error.message);
    throw new Error("Error updating product");
  }
};

export const DeleteProductByID = async (id) => {
  try {
    const user_id = getUserIdFromLocalStorage();
    if (!user_id) {
      throw new Error("User ID not found in local storage");
    }

    const response = await axios.delete(
      `${backendUrl}/api/cart/delete/${id}/${user_id}`,
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error.message);
    throw new Error("Error deleting product");
  }
};

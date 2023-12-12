// Cart.js

import React, { useEffect, useState } from "react";
import "./Cart.css";
import { Link } from "react-router-dom";
import Header from "../../Layout/Header";
import Footer_stw from "../../Layout/Footer_stw";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit, faCheck } from "@fortawesome/free-solid-svg-icons";
import {
  ListAllCart,
  UpdateProduct,
  DeleteProductByID,
  getUserIdFromLocalStorage,
} from "../../Service/CartService";
import "bootstrap/dist/css/bootstrap.min.css";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editableFields, setEditableFields] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 3;
  const lastIndext = currentPage * recordsPerPage;
  const firstIndex = lastIndext - recordsPerPage;
  const records = cartItems.slice(firstIndex, lastIndext);
  const npage = Math.ceil(cartItems.length / recordsPerPage);
  const numbers = [...Array(npage + 1).keys()].slice(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ListAllCart();
        console.log("API Response:", response);

        const items = response.items || [];

        setCartItems(items);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cart data:", error);
        setError("Error fetching cart data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const deleteProduct = async (productId) => {
    try {
      await DeleteProductByID(productId);
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== productId)
      );
    } catch (error) {
      console.error("Error deleting product:", error.message);
    }
  };

  const handleUpdateProduct = async (id, newFields) => {
    try {
      const user_id = getUserIdFromLocalStorage();

      if (!user_id) {
        console.error("User ID not found in local storage");
        return;
      }

      console.log("Updating product:", id, newFields);

      await UpdateProduct(id, newFields);

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, ...newFields } : item
        )
      );

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating product:", error.message);
    }
  };

  const handleCheckboxChange = (productId) => {
    const selectedProductIndex = selectedProducts.indexOf(productId);
    if (selectedProductIndex === -1) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      const updatedSelectedProducts = [...selectedProducts];
      updatedSelectedProducts.splice(selectedProductIndex, 1);
      setSelectedProducts(updatedSelectedProducts);
    }
  };

  const totalMoney = selectedProducts.reduce((total, productId) => {
    const selectedProduct = cartItems.find((item) => item.id === productId);
    return total + selectedProduct.totalmoney;
  }, 0);

  return (
    <div>
      <div className="p-2 header">
        <Header />
      </div>
      <div className="cart">
        <div className="shopping-cart">
          <h1>Shopping cart</h1>
        </div>
        <div className="main-product">
          <div className="detail-cart">
            <h4>Product</h4>
            <div className="small-line-main"></div>
            <div className="main-des">
              <table>
                <thead>
                  <tr className="detail-product">
                    <th id="idcart">Id</th>
                    <th id="namecart">Name</th>
                    <th id="typecart">Information</th>
                    <th id="pricecart">Total Price</th>
                    <th id="adjust">Adjust Product</th>
                    <th id="select">Select</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems && cartItems.length > 0 ? (
                    records.map((item) => (
                      <tr key={item.id} className="detail-product">
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                        <td id="information-list">
                          <p>
                            Type: <span>{item.type}</span>
                          </p>
                          <p>
                            Price: <span>${item.price}</span>
                          </p>
                          {isEditing && editableFields[item.id] ? (
                            <>
                              <p>
                                Quantity:{" "}
                                <input
                                  type="text"
                                  value={
                                    editableFields[item.id]?.quantity || ""
                                  }
                                  onChange={(e) =>
                                    setEditableFields((prevFields) => ({
                                      ...prevFields,
                                      [item.id]: {
                                        ...prevFields[item.id],
                                        quantity: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              </p>
                              <p>
                                Size:{" "}
                                <input
                                  type="text"
                                  value={editableFields[item.id]?.size || ""}
                                  onChange={(e) =>
                                    setEditableFields((prevFields) => ({
                                      ...prevFields,
                                      [item.id]: {
                                        ...prevFields[item.id],
                                        size: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              </p>
                              <p>
                                Color:{" "}
                                <input
                                  type="text"
                                  value={editableFields[item.id]?.color || ""}
                                  onChange={(e) =>
                                    setEditableFields((prevFields) => ({
                                      ...prevFields,
                                      [item.id]: {
                                        ...prevFields[item.id],
                                        color: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              </p>
                            </>
                          ) : (
                            <>
                              <p>
                                Quantity: <span>{item.quantity}</span>
                              </p>
                              <p>
                                Size: <span>{item.size}</span>
                              </p>
                              <p>
                                Color: <span>{item.color}</span>
                              </p>
                            </>
                          )}
                        </td>

                        <td className="total">
                          {(item.totalmoney = item.price * item.quantity)}
                        </td>
                        <td className="adjust-btn">
                          <div className="adjust-btn">
                            {isEditing ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateProduct(
                                    item.id,
                                    editableFields[item.id]
                                  )
                                }
                              >
                                <FontAwesomeIcon icon={faCheck} />
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="action-button delete"
                                  onClick={() => deleteProduct(item.id)}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                                <button
                                  type="button"
                                  className="action-button update"
                                  onClick={() => {
                                    setIsEditing(true);
                                    setEditableFields({
                                      [item.id]: {
                                        quantity: item.quantity,
                                        color: item.color,
                                        size: item.size,
                                      },
                                    });
                                  }}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            onChange={() => handleCheckboxChange(item.id)}
                            checked={selectedProducts.includes(item.id)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">No items in the cart.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="merge-block">
            <div className="merge-block">
              <div className="payment-cart">
                <h4>Order Summary</h4>
                <div className="small-line-payment"></div>
                <div className="total-money">
                  <h4 id="sub">SUBTOTAL</h4>
                  <h4>{`$${totalMoney.toFixed(2)}`}</h4>
                </div>
                <button id="payment-btn">PROCESS TO CHECKOUT</button>
                <div className="icon-link">
                  <div className="small-line-payment-icon"></div>
                  <span>Accept Payment Methods</span>
                  <img
                    src="https://durotan-fashion.myshopify.com/cdn/shop/files/payment_ef2dcab9-feab-4a52-80b2-d13053ddefdc_2000x.png?v=1655036319"
                    alt="Payment methods"
                  />
                </div>
              </div>
              <div className="button-continue">
                <Link to="/Shop">
                  <p>CONTINUE SHOPPING</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <nav style={{ paddingLeft: "35%" }}>
        <ul className="pagination">
          <li className="page-item">
            <a href="" className="page-link" onClick={prePage}>
              Prev
            </a>
          </li>
          {numbers.map((n, i) => (
            <li
              className={`page-item ${currentPage === n ? "active" : ""}`}
              key={i}
            >
              <a href="#" className="page-link" onClick={() => changeCPage(n)}>
                {n}
              </a>
            </li>
          ))}
          <li className="page-item">
            <a href="#" className="page-link" onClick={nextPage}>
              Next
            </a>
          </li>
        </ul>
      </nav>
      <div className="p-2 footer">
        <Footer_stw />
      </div>
    </div>
  );
  function prePage() {
    if (currentPage !== firstIndex) {
      setCurrentPage(currentPage - 1);
    }
  }
  function changeCPage(id) {
    setCurrentPage(id);
  }
  function nextPage() {
    if (currentPage !== lastIndext) {
      setCurrentPage(currentPage + 1);
    }
  }
}

export default Cart;

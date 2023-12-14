// GridView.js
import React, { useState, useEffect } from "react";
import "./gridview.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import * as productProfileService from "../../Service/productService";
import Linebar from "./linebar";

function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block", background: "white" }}
      onClick={onClick}
    />
  );
}

function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block", background: "white" }}
      onClick={onClick}
    />
  );
}

function GridView() {
  const settings = {
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 3;
  const [filters, setFilters] = useState({
    selectedCategories: [],
    selectedColors: [],
  });
  const [sortType, setSortType] = useState("product_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isQuickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await productProfileService.ListAllProduct();
        console.log("API Response:", response);
        setProducts(response.data.items ?? []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product data:", error.message);
        setError("Error fetching product data: " + error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const sortedProducts = [...products].sort((a, b) => {
      const valueA = a[sortType].toUpperCase();
      const valueB = b[sortType].toUpperCase();

      return sortOrder === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });

    setFilteredProducts(sortedProducts);
  }, [products, sortType, sortOrder]);

  useEffect(() => {
    const { selectedCategories, selectedColors } = filters;
    const filtersSelected =
      selectedCategories.length > 0 || selectedColors.length > 0;

    const updatedProducts = products.filter((product) => {
      const categoryMatch =
        filtersSelected && selectedCategories.includes(product.product_type);

      const colorMatch =
        filtersSelected &&
        selectedColors.some((selectedColor) =>
          product.color.includes(selectedColor)
        );

      return filtersSelected ? categoryMatch || colorMatch : true;
    });

    setFilteredProducts(updatedProducts);
  }, [products, filters]);
  // Add these states
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);

  // Add these functions
  const handleMinPriceChange = (e) => {
    setMinPrice(parseInt(e.target.value));
  };

  const handleMaxPriceChange = (e) => {
    setMaxPrice(parseInt(e.target.value));
  };

  const handlePriceFilter = () => {
    if (minPrice !== null && maxPrice !== null) {
      const filteredProducts = products.filter(
        (product) => product.price >= minPrice && product.price <= maxPrice
      );

      setFilteredProducts(filteredProducts);
    }
  };

  useEffect(() => {
    const sizes = [...new Set(selectedProduct?.size.split(","))];
    const colors = [...new Set(selectedProduct?.color.split(","))];

    setAvailableSizes(sizes);
    setAvailableColors(colors);
  }, [selectedProduct]);

  const renderProducts = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return <div>Error: {error}</div>;
    }

    const { selectedCategories, selectedColors } = filters;
    const filtersSelected =
      selectedCategories.length > 0 || selectedColors.length > 0;

    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const rowProducts = filteredProducts.slice(startIndex, endIndex);

    if (rowProducts.length === 0) {
      return <div>No products found.</div>;
    }

    return (
      <div>
        <div>
          <p id="cat">PRICE RANGE</p>
          <div className="typeorsomethingelse">
            <input
              type="number"
              placeholder="Min"
              onChange={(e) => setMinPrice(parseInt(e.target.value))}
            />
            <input
              type="number"
              placeholder="Max"
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
            />
            <button onClick={handlePriceFilter}>Apply</button>
          </div>
        </div>
        <div style={{ display: "flex", marginRight: "-5%" }}>
          {rowProducts.map((item) => (
            <div key={item.id} className="qview">
              <div className="imge">
                <Slider {...settings}>
                  <div>
                    <img src={item.picture_one} alt="product" />
                  </div>
                  <div>
                    <img src={item.picture_two} alt="product" />
                  </div>
                  <div>
                    <img src={item.picture_three} alt="product" />
                  </div>
                </Slider>
                <div className="info">
                  <button
                    className="btn-grid"
                    onClick={() => {
                      setQuickViewOpen(true);
                      setSelectedProduct(item);
                      setSelectedColor(null);
                      setSelectedSize("");
                    }}
                  >
                    Quick view
                  </button>
                </div>
              </div>
              <div className="description">
                <Link to={`/productdetail/${item.id}`}>
                  <p id="name">Name: {item.product_name}</p>
                </Link>
                <Link to={`/productdetail/${item.id}`}>
                  <p id="price">Price: {item.price}</p>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleColorClick = (color) => {
    setSelectedColor(color);
  };

  const handleSizeClick = (size) => {
    setSelectedSize(size);
  };

  const addToCart = async () => {
    try {
      if (!selectedSize || !selectedColor || !selectedProduct) {
        console.error("Size, color, and product must be selected.");
        return;
      }

      const cartItem = {
        name: selectedProduct.product_name,
        type: selectedProduct.product_type,
        price: selectedProduct.price,
        quantity: 1,
        size: selectedSize,
        color: selectedColor,
      };

      console.log("Add to cart:", cartItem);
      // You can add logic to update the shopping cart here
    } catch (error) {
      console.error("Error adding to cart:", error.message);
    }
  };

  const prePage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const changeCPage = (id) => {
    setCurrentPage(id);
  };

  const nextPage = () => {
    const maxPage = Math.ceil(filteredProducts.length / recordsPerPage);
    if (currentPage < maxPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div>
      {isQuickViewOpen && (
        <div className="overlay">
          <div className="popup">
            {selectedProduct && (
              <>
                <h1>Name: {selectedProduct.product_name}</h1>
                <p>Product Type: {selectedProduct.product_type}</p>
                <p>Price : ${selectedProduct.price}</p>

                <div>
                  <p>Sizes: {availableSizes.join(", ")}</p>
                  <p>Colors: {availableColors.join(", ")}</p>
                </div>

                <div>
                  <label>Select Size:</label>
                  <select onChange={(e) => handleSizeClick(e.target.value)}>
                    <option value="">Select Size</option>
                    {availableSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Select Color:</label>
                  <select onChange={(e) => handleColorClick(e.target.value)}>
                    <option value="">Select Color</option>
                    {availableColors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>

                <button onClick={addToCart} style={{ background: "green" }}>
                  Add to Cart
                </button>

                <button onClick={() => setQuickViewOpen(false)}>Close</button>
              </>
            )}
          </div>
        </div>
      )}

      <Linebar
        onCategoryChange={setFilters}
        onSortChange={setFilteredProducts}
      />

      <div className="quickviewpage">{renderProducts()}</div>

      <nav className="pagination" style={{ marginLeft: "40%" }}>
        <button className="page-link" onClick={prePage}>
          Prev
        </button>
        {[
          ...Array(Math.ceil(filteredProducts.length / recordsPerPage)).keys(),
        ].map((n, i) => (
          <button
            key={i}
            className={`page-link ${currentPage === n + 1 ? "active" : ""}`}
            onClick={() => changeCPage(n + 1)}
          >
            {n + 1}
          </button>
        ))}
        <button className="page-link" onClick={nextPage}>
          Next
        </button>
      </nav>
    </div>
  );
}

export default GridView;

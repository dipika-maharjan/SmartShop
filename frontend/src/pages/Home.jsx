import { useEffect, useState } from "react";
import API from "../services/api";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await API.get("/products");
      setProducts(res.data);
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <h2>Products</h2>

      {products.map((p) => (
        <div key={p._id}>
          <h3>{p.title}</h3>
          <p>{p.price}</p>
          <img src={p.image} width="100" />
        </div>
      ))}
    </div>
  );
}
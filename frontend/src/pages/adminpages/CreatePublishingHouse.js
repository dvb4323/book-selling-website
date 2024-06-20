///api/publishinghouse/admin/create
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./UpdatePublishingHouseModal.module.css"; // Import CSS module
import { useSelector, useDispatch } from "react-redux";
import { getnewTk } from "../../redux/features/user/tokenSlide";

function CreatePublishingHouse({ isOpen, onClose, house }) {
    const dispatch=useDispatch()
    const token = useSelector((state) => state.token.accessTk);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response= await axios.post(`/api/publishinghouses/admin/create`, formData,
        {
          headers: {
            token: token, // Assuming you're using Bearer token
          },
        }
        );
        alert(response.data.acknowledged);
        onClose();
        // Optionally, you can update the publishing house list after successful update
      } catch (error) {
        try{
          const newtk = await dispatch(getnewTk());
          const response=  await axios.post(`/api/publishinghouses/admin/create`, formData,
        {
          headers: {
            token: newtk, // Assuming you're using Bearer token
          },
        }
        );
        alert(response.data.acknowledged);
        onClose();
        }catch(err){
          alert(err)
        }
        // Handle error
      }
  };



  if (!isOpen ) {
    return null;
  }

  return (
    <div className={styles.modal}>
      <button className={styles.close} onClick={onClose}>
        x
      </button>
      <div className={styles.modalContent}>
        <form onSubmit={handleSubmit}>
        <div>
            <label>Tên NXB:</label>
            <input
              type="text"
              name="name"
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="text"
              name="email"
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Phone:</label>
            <input
              type="text"
              name="phone"
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Location:</label>
            <textarea
              name="location"
              onChange={handleChange}
              rows={4} // Specify the number of rows for the textarea
              cols={50} // Optionally specify the number of columns
            />
          </div>
          <button type="submit">Tạo</button>
        </form>
      </div>
    </div>
  );
}

export default CreatePublishingHouse;

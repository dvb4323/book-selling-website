import React, { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setAdmin } from "../../redux/features/user/userSlice";

import { setToken } from "../../redux/features/user/tokenSlide";
import AdminLoginStyles from "./AdminLogin.module.css";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const dispatch = useDispatch();
  const [err, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const navigate = useNavigate();
  function hadlenav(msg) {
    alert(msg, " Xin chào admin");
    navigate("/admin");
  }

  const a = useSelector((state) => state.user.login);

  const { register, handleSubmit } = useForm();

  // dang nhap
  const onSubmit = async (data) => {
    console.log(data);
    try {
      const rep = await axios.post("/api/customers/login", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setResponse(rep.data.message);
      console.log(rep);

      //   console.log(response.data.existingAdmin);
      //   setResponse(response.data.message); // Set response state with message from response
      setError(null); // Clear error state

      dispatch(
        setToken({
          accessToken: rep.data.accessToken,
          existingCustomer: rep.data.existingAdmin,
          refreshToken: rep.data.refreshToken,
        })
      );
      dispatch(setAdmin());

      hadlenav(rep.data.message);
    } catch (error) {
      //   console.error("day la Error:", error);
      console.log(error);
      //   setError(error.response.data.message);

      setResponse(null);
    }
  };

  return (
    <div className={AdminLoginStyles.login_container}>
      <div className={AdminLoginStyles.form_container}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            {
              <div
                id="username"
                className={AdminLoginStyles.userName_container}
              >
                <label htmlFor="username">Tên đăng nhập</label>
                <input
                  type="text"
                  {...register("username", {
                    required: "user không được để trống",
                  })}
                  id="admin"
                  placeholder="admin"
                  defaultValue="admin"
                />
              </div>
            }
          </div>
          <div className={AdminLoginStyles.password_container}>
            <label htmlFor="password">Mật khẩu:</label>
            <input
              type="password"
              {...register("password", { required: "Mật khẩu trống" })}
              id="password"
              placeholder="Nhập mật khẩu"
            />
          </div>
          {(err && <p className={AdminLoginStyles.error_message}>{err}</p>) ||
            (response && (
              <p className={AdminLoginStyles.success_message}>
                {response} <br />
                Chào mừng Admin
              </p>
            ))}

          {/* {(response==="Login successful")&&hadlenav(response)} */}
          {!(response === "Login successful") && (
            <button
              className={AdminLoginStyles.login_button}
              type="submit"
              onClick={onSubmit}
            >
              Đăng nhập
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;

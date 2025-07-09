import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/authContext";

interface FormData {
  email: string;
  password: string;
  remember: boolean;
}

function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await axios.post("http://localhost:8000/accounts/login/", {
      email: formData.email,
      password: formData.password,
    });

    const { access, refresh } = res.data;

    login(access, refresh);
    navigate("/dashboard");

  } catch (err: any) {
    const errorMessage =
      err.response?.data?.detail ||
      err.response?.data?.non_field_errors?.[0] ||
      "Login failed.";

    if (
      errorMessage === "Email is not verified." ||
      errorMessage === "Phone number is not verified."
    ) {
      const unverifiedEmail =
        err.response?.data?.detail === "Email is not verified." ||
        err.response?.data?.non_field_errors?.[0] === "Email is not verified.";

      const unverifiedPhone =
        err.response?.data?.detail === "Phone number is not verified." ||
        err.response?.data?.non_field_errors?.[0] ===
          "Phone number is not verified.";

      try {
        if (unverifiedPhone) {
          // First, send OTP for phone
          await axios.post("http://localhost:8000/accounts/resend-otp/", {
            email: formData.email,
            type: "phone",
          });
          navigate(`/verify/phone?email=${formData.email}`);
        } else if (unverifiedEmail) {
          // Send OTP for email
          await axios.post("http://localhost:8000/accounts/resend-otp/", {
            email: formData.email,
            type: "email",
          });
          navigate(`/verify/email?email=${formData.email}`);
        }
      } catch (resendError: any) {
        console.error("Failed to send OTP:", resendError);
        setError(
          resendError.response?.data?.non_field_errors?.[0] ||
            resendError.response?.data?.message ||
            "Failed to resend OTP."
        );
      }
    } else if (errorMessage === "Invalid email or password.") {
      setError("Invalid email or password.");
    } else {
      setError(errorMessage);
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-lg w-full max-w-xl p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-semibold">Welcome Back</h3>
          <p className="text-gray-500">Sign in to your AIMADEIN Account</p>
        </div>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              placeholder="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 mt-4"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="text-center text-sm mt-4">
            Don’t have an account?{" "}
            <a
              href="/register"
              className="text-black underline hover:text-gray-800"
            >
              Register Here
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;

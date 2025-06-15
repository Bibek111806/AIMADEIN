import React, { useState } from "react";
import axios from "axios";
import { useNavigate,Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    role: "individual",
    firstName: "",
    middleName: "",
    lastName: "",
    company_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const payload =
        formData.role === "organization"
          ? {
              role: formData.role,
              company_name: formData.company_name,
              email: formData.email,
              phone: formData.phone,
              password: formData.password,
            }
          : {
              role: formData.role,
              first_name: formData.firstName,
              middle_name: formData.middleName,
              last_name: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              password: formData.password,
            };

      const res = await axios.post("http://localhost:8000/accounts/register/", payload);

      if (res.status === 201 || res.data.success) {
        navigate("/verify/email?email="+formData.email);
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err: any) {
      const message =
        err.response?.data?.error || err.response?.data?.message || "Something went wrong.";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-lg w-full max-w-3xl p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-semibold">Create Account</h3>
          <p className="text-gray-500">Register for an AIMADEIN account</p>
        </div>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">


          {formData.role === "individual" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="FirstName">First Name *</Label>
                <Input
                  id="FirstName"
                  name="firstName"
                  placeholder="First Name"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="MiddleName">Middle Name</Label>
                <Input
                  id="MiddleName"
                  name="middleName"
                  placeholder="Middle Name"
                  type="text"
                  value={formData.middleName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="LastName">Last Name *</Label>
                <Input
                  id="LastName"
                  name="lastName"
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          {formData.role === "organization" && (
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                name="company_name"
                placeholder="Company Name"
                type="text"
                value={formData.company_name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
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
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="Phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
                    <div className="space-y-2">
            <Label htmlFor="role">Account Type *</Label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full h-11 px-3 border rounded-md"
            >
              <option value="individual">Individual</option>
              <option value="organization">Organization</option>
            </select>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full h-11 mt-6">
              Register
            </Button>
          </div>

          <div className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-black underline hover:text-gray-800">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;

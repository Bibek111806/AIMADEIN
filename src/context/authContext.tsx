import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
interface Skill {
  id: number;
  name: string;
}

interface Education {
  id: number;
  degree: string;
  institution: string;
  start_year: string;
  end_year: string;
}

interface UploadedFile {
  id: number;
  file_url: string;
  file_type: string;
}
interface works{
  id:number;
  company:string;
  description:string;
  start_year:string;
  end_year:string;
  post:string;
}
interface services{
  id:number;
  name:string;
}
interface organization_profile{
  id:number;
  founding_year:string;
  industry_type:string;
  contact_person:string;

}
interface UserProfile {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  phone: string;
  company_name: string;
  address: string;
  profile_picture: string;
  professional_title: string;
  email: string;
  role: string;
  bio: string;
  profile_visibility:string;
  show_email:boolean;
  show_phone:boolean;
  skills: Skill[];
  works: works[];
  educations: Education[];
  files: UploadedFile[];
  organization_profile: organization_profile
  services:services[]  
}

interface AuthContextProps {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  loading: boolean;
  login: (access: string, refresh: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("access_token")
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem("refresh_token")
  );
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const login = (access: string, refresh: string) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    setAccessToken(access);
    setRefreshToken(refresh);
    fetchUserProfile(access);
  };

  const logout = () => {
    localStorage.clear();
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    navigate("/");
  };

  const fetchUserProfile = async (token: string | null = accessToken) => {
    if (!token) return;
    try {
      const res = await api.get("accounts/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch profile:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!accessToken,
        accessToken,
        refreshToken,
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

import React, { useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://nsvnhai.netlify.app/auth/callback",
      },
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "10vh" }}>
      <h2>Sign in to Pave Eye Smart Roads</h2>
      <button
        onClick={handleGoogleLogin}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          fontSize: "1.1rem",
          borderRadius: 5,
          border: "none",
          background: "#4285F4",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default Login; 
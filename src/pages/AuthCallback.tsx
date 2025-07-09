import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the OAuth callback from Supabase
    const handleAuth = async () => {
      const { error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
      if (!error) {
        // Redirect to dashboard or home after successful login
        navigate("/", { replace: true });
      } else {
        // Handle error (optional: show error message)
        alert("Authentication failed: " + error.message);
        navigate("/login", { replace: true });
      }
    };
    handleAuth();
  }, [navigate]);

  return <div>Processing login...</div>;
};

export default AuthCallback; 
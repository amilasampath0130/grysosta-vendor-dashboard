"use client";

import { Suspense } from "react";
import VerifyOtpPage from "../../../components/auth/Verify-otp";

const Verify_OtpPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpPage />
    </Suspense>
  );
};

export default Verify_OtpPage;

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function VerifyPhone() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [phoneOtp, setphoneOtp] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);

  // Resend button countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendDisabled && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [resendDisabled, resendTimer]);

  //  On load: check if email exists and phone is already verified
  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    if (!emailFromUrl) {
      navigate('/'); // redirect to home if email is missing
      return;
    }

    setEmail(emailFromUrl);

    const checkEmailStatus = async () => {
      try {
        const res = await axios.post('http://localhost:8000/accounts/check-verification-status/', {
          email: emailFromUrl,
        });

        if (res.data?.phone_verified) {
          navigate(`/`);
        }
      } catch (err: any) {
        const status = err.response?.status;

        if (status === 404) {
          navigate('/');
        } 
      }
    };

    checkEmailStatus();
  }, [searchParams, navigate]);

  //  Handle email verification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyLoading(true);
    setError('');
    setMessage('');

    try {
      await axios.post('http://localhost:8000/accounts/verify/phone/', {
        email,
        phone_otp: phoneOtp,
      });

      setMessage('Phone verified! Redirecting to login...');
      setTimeout(() => {
        navigate(`/login`);
      }, 2000);
    } catch (err: any) {
      const msg =
        err.response?.data?.email_otp ||
        err.response?.data?.email ||
        err.response?.data?.non_field_errors?.[0] ||
        '❌ Invalid code or error occurred.';
      setError(msg);
    } finally {
      setVerifyLoading(false);
    }
  };

  // Handle resend OTP
  const resendOtp = async () => {
    if (resendDisabled || resendLoading) return;

    setResendLoading(true);
    setError('');
    setMessage('');

    try {
      await axios.post('http://localhost:8000/accounts/resend-otp/', {
        email,
        type: 'phone',
      });

      setMessage('Verification code resent to your phone.');
      setResendDisabled(true);
      setResendTimer(60);
    } catch (err: any) {
      const msg =
        err.response?.data?.email ||
        err.response?.data?.non_field_errors?.[0] ||
        'Failed to resend code.';
      setError(msg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-lg w-full max-w-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">Verify Your phone</h3>
            <p className="text-sm text-gray-600">
              Enter the 6-digit code sent to your phone
            </p>
          </div>

          {message && <p className="text-green-600 text-center">{message}</p>}
          {error && <p className="text-red-600 text-center">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="phoneOtp">Email Verification Code</Label>
            <Input
              id="phoneOtp"
              name="phoneOtp"
              type="text"
              placeholder="6-digit code"
              value={phoneOtp}
              onChange={(e) => setphoneOtp(e.target.value)}
              maxLength={6}
              required
              className="h-11"
            />
          </div>

          <Button type="submit" className="w-full h-11" disabled={verifyLoading}>
            {verifyLoading ? 'Verifying...' : 'Verify Phone'}
          </Button>

          <div className="text-center mt-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={resendOtp}
              disabled={resendDisabled || resendLoading}
            >
              {resendLoading
                ? 'Resending...'
                : resendDisabled
                ? `Resend in ${resendTimer}s`
                : 'Resend '}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VerifyPhone;

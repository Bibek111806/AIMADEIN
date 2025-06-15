import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
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

  //  On load: check if email exists and is already verified
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

        if (res.data?.email_verified) {
          navigate(`/verify/phone?email=${emailFromUrl}`);
        }
      } catch (err: any) {
        const status = err.response?.status;

        if (status === 404) {
          navigate('/');
        } else if (status === 403) {
          console.log('Email not verified, continue.');
        } else {
          console.warn('Unexpected error during verification check.');
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
      await axios.post('http://localhost:8000/accounts/verify/email/', {
        email,
        email_otp: emailOtp,
      });

      setMessage('Email verified! Redirecting to phone verification...');
      setTimeout(() => {
        navigate(`/verify/phone?email=${email}`);
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
        type: 'email',
      });

      setMessage('Verification code resent to your email.');
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
            <h3 className="text-lg font-semibold mb-2">Verify Your Email</h3>
            <p className="text-sm text-gray-600">
              Enter the 6-digit code sent to <strong>{email}</strong>
            </p>
          </div>

          {message && <p className="text-green-600 text-center">{message}</p>}
          {error && <p className="text-red-600 text-center">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="emailOtp">Email Verification Code</Label>
            <Input
              id="emailOtp"
              name="emailOtp"
              type="text"
              placeholder="6-digit code"
              value={emailOtp}
              onChange={(e) => setEmailOtp(e.target.value)}
              maxLength={6}
              required
              className="h-11"
            />
          </div>

          <Button type="submit" className="w-full h-11" disabled={verifyLoading}>
            {verifyLoading ? 'Verifying...' : 'Verify Email'}
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
                : 'Resend'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VerifyEmail;

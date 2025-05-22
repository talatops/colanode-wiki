import crypto from 'crypto';

import { redis } from '@/data/redis';
import { Otp } from '@/types/otps';

const OTP_DIGITS = '0123456789';
const OTP_LENGTH = 6;

export const fetchOtp = async <T>(id: string): Promise<Otp<T> | null> => {
  const redisKey = getOtpRedisKey(id);
  const otpJson = await redis.get(redisKey);
  if (!otpJson) {
    return null;
  }

  return JSON.parse(otpJson);
};

export const saveOtp = async <T>(id: string, otp: Otp<T>): Promise<void> => {
  const redisKey = getOtpRedisKey(id);
  const expireSeconds = Math.max(
    Math.floor((otp.expiresAt.getTime() - Date.now()) / 1000),
    1
  );
  await redis.set(redisKey, JSON.stringify(otp), {
    EX: expireSeconds,
  });
};

export const deleteOtp = async (id: string): Promise<void> => {
  const redisKey = getOtpRedisKey(id);
  await redis.del(redisKey);
};

export const getOtpRedisKey = (id: string): string => {
  return `otp:${id}`;
};

export const generateOtpCode = async (): Promise<string> => {
  let otp = '';

  for (let i = 0; i < OTP_LENGTH; i++) {
    const randomIndex = crypto.randomInt(0, OTP_DIGITS.length);
    otp += OTP_DIGITS[randomIndex];
  }

  return otp;
};

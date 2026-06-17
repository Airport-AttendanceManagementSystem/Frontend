import { keyframes } from "@emotion/react";

export const float1 = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(30px, -50px) scale(1.1); }
  66%  { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
`;

export const float2 = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(-40px, 30px) scale(1.15); }
  66%  { transform: translate(25px, -35px) scale(0.85); }
  100% { transform: translate(0, 0) scale(1); }
`;

export const float3 = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(20px, 40px) scale(1.05); }
  66%  { transform: translate(-30px, -25px) scale(0.95); }
  100% { transform: translate(0, 0) scale(1); }
`;
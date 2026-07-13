'use client';

import Button, { type ButtonProps } from '@mui/material/Button';

export function PrimaryButton({ sx, ...props }: ButtonProps) {
  return (
    <Button
      variant="contained"
      color="primary"
      fullWidth
      size="large"
      sx={{
        py: 1.9,
        fontSize: 17,
        fontWeight: 700,
        borderRadius: '14px',
        ...sx,
      }}
      {...props}
    />
  );
}

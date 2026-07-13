'use client';

import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { ComingSoon } from '@/components/ui/ComingSoon';

export default function LoyaltyPage() {
  return (
    <ComingSoon
      title="Лояльность"
      icon={<AccountBalanceWalletOutlinedIcon fontSize="inherit" />}
      activeTab="loyalty"
    />
  );
}

'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import BoltIcon from '@mui/icons-material/Bolt';
import OutdoorGrillOutlinedIcon from '@mui/icons-material/OutdoorGrillOutlined';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setDiet } from '@/store/slices/profileSlice';
import { SelectCard } from '@/components/ui/SelectCard';

export function StepDiet() {
  const dispatch = useAppDispatch();
  const diet = useAppSelector((s) => s.profile.diet);

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 1 }}>
        Вы соблюдаете диету ?
      </Typography>
      <Typography sx={{ fontSize: 14.5, color: 'text.secondary', mb: 2.5, lineHeight: 1.45 }}>
        Ваш профиль будет настроен под ваш рацион для лучшего контроля энергии
      </Typography>

      <Stack spacing={1.5}>
        <SelectCard
          icon={<RestaurantIcon />}
          title="Полноценное питание"
          subtitle="Никаких особых ограничений, разнообразное питание."
          selected={diet === 'classic'}
          onClick={() => dispatch(setDiet('classic'))}
        />
        <SelectCard
          icon={<SpaOutlinedIcon />}
          title="Веган"
          subtitle="На растительной основе, без продуктов животного происхождения."
          selected={diet === 'vegan'}
          onClick={() => dispatch(setDiet('vegan'))}
        />
        <SelectCard
          icon={<BoltIcon />}
          title="Кетогенная диета"
          subtitle="Много жиров, минимум углеводов."
          selected={diet === 'keto'}
          onClick={() => dispatch(setDiet('keto'))}
        />
        <SelectCard
          icon={<OutdoorGrillOutlinedIcon />}
          title="Палеодиета"
          subtitle="Натуральные продукты с упором на нежирный белок."
          selected={diet === 'paleo'}
          onClick={() => dispatch(setDiet('paleo'))}
        />
      </Stack>
    </Box>
  );
}

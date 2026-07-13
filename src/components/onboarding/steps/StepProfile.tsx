'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setBirthDate, setGender } from '@/store/slices/profileSlice';
import { SelectCard } from '@/components/ui/SelectCard';
import { DateWheelPicker } from '../DateWheelPicker';

export function StepProfile() {
  const dispatch = useAppDispatch();
  const gender = useAppSelector((s) => s.profile.gender);
  const birthDate = useAppSelector((s) => s.profile.birthDate);

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 1 }}>
        Заполните данные
      </Typography>
      <Typography sx={{ fontSize: 14.5, color: 'text.secondary', mb: 2.5, lineHeight: 1.45 }}>
        Это поможет нам подсчитать точное количество калорий в зависимости от ваших данных.
      </Typography>

      <Typography variant="h3" sx={{ fontSize: 19, mb: 1.75 }}>
        Выберите пол
      </Typography>
      <Stack spacing={1.5} sx={{ mb: 3 }}>
        <SelectCard
          icon={<MaleIcon />}
          title="Мужской"
          selected={gender === 'male'}
          onClick={() => dispatch(setGender('male'))}
        />
        <SelectCard
          icon={<FemaleIcon />}
          title="Женский"
          selected={gender === 'female'}
          onClick={() => dispatch(setGender('female'))}
        />
      </Stack>

      <Typography variant="h3" sx={{ fontSize: 19, mb: 1 }}>
        Укажите возраст
      </Typography>
      <DateWheelPicker value={birthDate} onChange={(v) => dispatch(setBirthDate(v))} />
    </Box>
  );
}

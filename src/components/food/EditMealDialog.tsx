'use client';

import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors } from '@/theme/theme';
import { useAppDispatch } from '@/store/hooks';
import { updateMeal } from '@/store/slices/mealsSlice';
import { updateMealRow } from '@/lib/supabase/db';
import type { Meal } from '@/types';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: '#F7F7FA',
    '& fieldset': { borderColor: '#E4E5EC' },
    '&:hover fieldset': { borderColor: '#C9CBD6' },
    '&.Mui-focused fieldset': { borderColor: colors.navy },
  },
};

interface EditMealDialogProps {
  meal: Meal;
  open: boolean;
  onClose: () => void;
}

export function EditMealDialog({ meal, open, onClose }: EditMealDialogProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(meal.name);
  const [calories, setCalories] = useState(String(meal.calories));
  const [protein, setProtein] = useState(String(meal.protein));
  const [fats, setFats] = useState(String(meal.fats));
  const [carbs, setCarbs] = useState(String(meal.carbs));
  const [description, setDescription] = useState(meal.description);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const num = (v: string) => Math.max(0, Number(v.replace(',', '.')) || 0);

  const handleSave = async () => {
    const changes = {
      name: name.trim() || meal.name,
      calories: Math.round(num(calories)),
      protein: Math.round(num(protein) * 10) / 10,
      fats: Math.round(num(fats) * 10) / 10,
      carbs: Math.round(num(carbs) * 10) / 10,
      description: description.trim(),
    };
    setSaving(true);
    setError(null);
    try {
      await updateMealRow(meal.id, changes);
      dispatch(updateMeal({ id: meal.id, changes }));
      onClose();
    } catch {
      setError('Не удалось сохранить. Попробуйте ещё раз.');
    } finally {
      setSaving(false);
    }
  };

  const macroField = (
    label: string,
    value: string,
    setter: (v: string) => void,
  ) => (
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#5A5D6E', mb: 0.5 }}>
        {label}
      </Typography>
      <TextField
        value={value}
        onChange={(e) => setter(e.target.value)}
        fullWidth
        size="small"
        slotProps={{ htmlInput: { inputMode: 'decimal' } }}
        sx={fieldSx}
      />
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { sx: { borderRadius: '20px', m: 2 } } }}
    >
      <Box sx={{ p: 2.5 }}>
        <Typography variant="h3" sx={{ fontSize: 19, mb: 2 }}>
          Редактировать блюдо
        </Typography>

        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#5A5D6E', mb: 0.5 }}>
          НАЗВАНИЕ
        </Typography>
        <TextField
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          size="small"
          sx={{ ...fieldSx, mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 1.25, mb: 2 }}>
          {macroField('ККАЛ', calories, setCalories)}
          {macroField('БЕЛКИ, Г', protein, setProtein)}
        </Box>
        <Box sx={{ display: 'flex', gap: 1.25, mb: 2 }}>
          {macroField('ЖИРЫ, Г', fats, setFats)}
          {macroField('УГЛЕВОДЫ, Г', carbs, setCarbs)}
        </Box>

        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#5A5D6E', mb: 0.5 }}>
          ОПИСАНИЕ
        </Typography>
        <TextField
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          minRows={3}
          size="small"
          sx={{ ...fieldSx, mb: 1 }}
        />

        {error && (
          <Typography sx={{ color: '#D14D5B', fontSize: 13, mb: 1 }}>{error}</Typography>
        )}

        <PrimaryButton onClick={handleSave} disabled={saving} sx={{ mt: 1 }}>
          {saving ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Сохранить'}
        </PrimaryButton>
        <Button onClick={onClose} fullWidth sx={{ mt: 1, color: '#8E92A3', fontWeight: 700 }}>
          Отмена
        </Button>
      </Box>
    </Dialog>
  );
}

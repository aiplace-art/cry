import React from 'react';
import { SimpleDashboard, SimpleNav } from '@/components/simple-dashboard';

/**
 * 🆕 УПРОЩЁННЫЙ ДАШБОРД (V2)
 *
 * Упрощённая версия дашборда для новичков
 * - Только 3 элемента на экране
 * - Простой язык "для бабушки"
 * - Никаких графиков и сложной статистики
 *
 * Доступ: http://localhost:3000/dashboard-simple
 */
export default function DashboardSimplePage() {
  return (
    <>
      <SimpleNav />
      <SimpleDashboard />
    </>
  );
}

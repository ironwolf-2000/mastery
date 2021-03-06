import { EntitiesPage } from '../../common';

export const Habits = () => {
  return (
    <EntitiesPage
      entityType='habit'
      redirectPath='/habits'
      entityHeatmapColor='var(--color-rgb-habits)'
    />
  );
};

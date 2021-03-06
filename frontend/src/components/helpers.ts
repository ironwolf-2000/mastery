import i18n, { ILanguage } from '../i18n/config';
import { getCurrentEntitySuccessRate } from '../services/entity.service';
import { getCurrentUserEmail } from '../services/user.service';
import { daysToMs, getDateByDayDiff, truncateDateTime } from '../utils';
import { IEntityParams, IEntityStatus } from './App/App.types';
import { ICreateParams, IEditParams } from './common/Forms/Forms.types';
import { IHeatmapInitializerProps, IHeatmapCellParams } from './common/Heatmap/Heatmap.types';

export function getHeatmapCellTitle(
  lang: ILanguage,
  startTime: number,
  frequency: number,
  cols: number,
  x: number,
  y: number,
  value = 0
) {
  return (
    getDateByDayDiff(lang, startTime, frequency * (x * cols + y)) +
    (frequency > 1
      ? ` - ${getDateByDayDiff(lang, startTime, frequency * (x * cols + y + 1) - 1)}`
      : '') +
    `: ${value}`
  );
}

export function getInitializedHeatmap(
  lang: ILanguage,
  props: IHeatmapInitializerProps
): IHeatmapCellParams[][] {
  const { size, useTitle } = props;

  const heatmap: IHeatmapCellParams[][] = new Array(size);
  for (let i = 0; i < size; i++) {
    heatmap[i] = [];

    for (let j = 0; j < size; j++) {
      const params: IHeatmapCellParams = {
        status: 'new',
        isActive: false,
        currValue: 0,
        targetValue: props.targetValue,
      };

      if (useTitle) {
        const { startTime, entityFrequency } = props;
        params.title = getHeatmapCellTitle(lang, startTime, entityFrequency, size, i, j);
      }

      heatmap[i].push(params);
    }
  }

  return heatmap;
}

function frequencyToHeatmapSizeMapper(frequency: number) {
  const minMapper = [
    [80, 2],
    [60, 3],
    [40, 4],
    [20, 5],
    [9, 6],
    [7, 7],
    [5, 8],
    [3, 9],
  ];

  for (const [freq, size] of minMapper) {
    if (frequency >= freq) {
      return size;
    }
  }

  return 10;
}

export function createParamsToEntityParams(lang: ILanguage, params: ICreateParams): IEntityParams {
  const userEmail = getCurrentUserEmail() ?? 'anonymous@gmail.com';
  const startTime = truncateDateTime(new Date()).getTime();

  const {
    entityName: name,
    entityFrequency,
    motivationTextarea: motivation,
    requirementsText,
    requirementsMinValue,
    successRate,
    entityType,
  } = params;

  const heatmapSize = frequencyToHeatmapSizeMapper(entityFrequency);
  const heatmap = getInitializedHeatmap(lang, {
    heatmapType: 'tracking',
    size: heatmapSize,
    useTitle: true,
    startTime,
    entityFrequency,
    targetValue: requirementsMinValue,
  });

  return {
    name,
    userEmail,
    motivation,
    entityFrequency,
    requirementsText,
    requirementsMinValue,
    successRate,
    heatmap,
    startTime,
    entityType,
  };
}

export function editParamsToEntityParams(
  entity: IEntityParams,
  params: IEditParams
): IEntityParams {
  return { ...entity, ...params };
}

export function getEntityEndTime(entity: IEntityParams) {
  const { startTime, heatmap, entityFrequency } = entity;
  const [hmRows, hmCols] = [heatmap.length, heatmap[0].length];

  return startTime + daysToMs(hmRows * hmCols * entityFrequency - 1);
}

export function entityFrequencyToLabel(frequency: number) {
  if (frequency === 1) return i18n.t('daily');

  return i18n.t('every {{frequency}} days', { frequency });
}

export function categorizeEntitiesByStatus(
  entities: IEntityParams[]
): Record<IEntityStatus, IEntityParams[]> {
  const nowTime = Date.now();
  const active: IEntityParams[] = [];
  const completed: IEntityParams[] = [];
  const failed: IEntityParams[] = [];

  entities.forEach(entity => {
    const [startTime, endTime] = [entity.startTime, getEntityEndTime(entity)];

    if (startTime < nowTime && nowTime < endTime) {
      active.push(entity);
    } else if (getCurrentEntitySuccessRate(entity) >= entity.successRate) {
      completed.push(entity);
    } else {
      failed.push(entity);
    }
  });

  return { active, completed, failed };
}

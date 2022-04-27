import React from 'react';
import { OverlayTrigger } from 'react-bootstrap';

import { blk } from './Heatmap';
import { IHeatmapCellProps } from './Heatmap.types';

const sizeMap = {
  m: 1.5,
  sm: 1,
};

const defaultColorMap: Record<string, string> = {
  '-1': 'var(--bs-gray-100)',
  '0': 'var(--color-red)',
};

export const Cell = React.memo(
  ({
    x,
    y,
    onClick,
    bgColor,
    onClickPopover,
    cellSize = 'm',
    intensity,
    title,
  }: IHeatmapCellProps) => {
    const style: React.CSSProperties = {
      backgroundColor:
        intensity < 1
          ? defaultColorMap[intensity.toString()]
          : `rgba(${bgColor}, ${intensity ** 2 * 0.25})`,
      width: `${sizeMap[cellSize]}rem`,
      height: `${sizeMap[cellSize]}rem`,
      borderRadius: `${sizeMap[cellSize] * 0.16}rem`,
    };

    const contentProps: Record<string, any> = { style };
    if (onClick) {
      contentProps.onClick = () => onClick(x, y);
    }
    if (title) {
      contentProps.title = title;
    }

    const content = <div className={blk('Cell')} {...contentProps} />;

    return onClickPopover ? (
      <OverlayTrigger rootClose trigger='click' placement='bottom' overlay={onClickPopover}>
        {content}
      </OverlayTrigger>
    ) : (
      content
    );
  }
);

import clsx from 'clsx';

import classes from './MRT_Table.module.css';

import { useEffect, useMemo, useRef, useState, type UIEvent } from 'react';

import {
  darken,
  lighten,
  Table,
  type TableProps,
  useMantineColorScheme,
} from '@mantine/core';

import { useMRT_ColumnVirtualizer } from '../../hooks/useMRT_ColumnVirtualizer';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { bandLockedColumnSize } from '../../utils/bandFormat.utils';
import { parseCSSVarId } from '../../utils/style.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { Memo_MRT_TableBody, MRT_TableBody } from '../body/MRT_TableBody';
import { MRT_TableFooter } from '../footer/MRT_TableFooter';
import { MRT_TableHead } from '../head/MRT_TableHead';

interface Props<TData extends MRT_RowData> extends TableProps {
  table: MRT_TableInstance<TData>;
}

export const MRT_Table = <TData extends MRT_RowData>({
  table,
  ...rest
}: Props<TData>) => {
  'use no memo';
  const {
    getFlatHeaders,
    getState,
    options: {
      bandLayoutMode,
      bodyFormat,
      columns,
      enableStickyHeader,
      enableTableFooter,
      enableTableHead,
      headFormat,
      layoutMode,
      mantineTableProps,
      memoMode,
    },
  } = table;
  const { columnSizing, columnSizingInfo, columnVisibility, density, isFullScreen } =
    getState();
  const headClipRef = useRef<HTMLDivElement>(null);
  const [bandScrollNode, setBandScrollNode] = useState<HTMLDivElement | null>(
    null,
  );
  const [bandScrollbar, setBandScrollbar] = useState(0);
  const [bandViewport, setBandViewport] = useState(0);

  const tableProps = {
    highlightOnHover: true,
    horizontalSpacing: density,
    verticalSpacing: density,
    ...parseFromValuesOrFunc(mantineTableProps, { table }),
    ...rest,
  };

  const columnSizeVars = useMemo(() => {
    const headers = getFlatHeaders();
    const colSizes: { [key: string]: number } = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const colSize = header.getSize();
      colSizes[`--header-${parseCSSVarId(header.id)}-size`] = colSize;
      colSizes[`--col-${parseCSSVarId(header.column.id)}-size`] = colSize;
    }
    return colSizes;
  }, [columns, columnSizing, columnSizingInfo, columnVisibility]);

  const columnVirtualizer = useMRT_ColumnVirtualizer(table);

  const commonTableGroupProps = {
    columnVirtualizer,
    table,
  };

  const { colorScheme } = useMantineColorScheme();

  const { stripedColor } = tableProps;
  const hasBandFormat = Boolean(headFormat || bodyFormat);
  const fixedBandHead = hasBandFormat && (enableStickyHeader || isFullScreen);
  const bandColumns = hasBandFormat
    ? table.getVisibleLeafColumns().map((column) => {
        const columnType = (
          column.columnDef as { columnDefType?: string }
        ).columnDefType;
        const lockedSize = bandLockedColumnSize(column.id, column.getSize());
        const size =
          columnType === 'display'
            ? lockedSize || column.getSize()
            : column.getSize();
        const grow = (column.columnDef as { grow?: boolean | number }).grow;
        const grows =
          bandLayoutMode === 'grid'
            ? ![0, false].includes(grow as number | boolean)
            : bandLayoutMode === 'grid-no-grow' && Boolean(+(grow || 0));
        const weight = bandLayoutMode === 'grid' ? size : +(grow || 0);
        return { column, grows, size, weight };
      })
    : [];
  const bandWeightSum = bandColumns
    .filter((column) => column.grows)
    .reduce((sum, column) => sum + column.weight, 0);
  const fillBand = bandWeightSum > 0;
  const bandBaseWidth = bandColumns.reduce((sum, column) => sum + column.size, 0);
  const bandExtra =
    fillBand && bandViewport > bandBaseWidth ? bandViewport - bandBaseWidth : 0;
  let sharedExtra = 0;
  const growingColumns = bandColumns.filter((column) => column.grows);
  const bandSizedColumns = bandColumns.map((column) => {
    if (!bandExtra || !column.grows) return { ...column, width: column.size };
    const isLast =
      column.column.id === growingColumns[growingColumns.length - 1]?.column.id;
    const share = isLast
      ? bandExtra - sharedExtra
      : Math.floor((bandExtra * column.weight) / bandWeightSum);
    if (!isLast) sharedExtra += share;
    return { ...column, width: column.size + share };
  });
  const bandTableWidth = bandSizedColumns.reduce(
    (sum, column) => sum + column.width,
    0,
  );
  const bandTableStyle = hasBandFormat
    ? {
        maxWidth: bandTableWidth,
        minWidth: bandTableWidth,
        width: bandTableWidth,
      }
    : undefined;

  useEffect(() => {
    const node = bandScrollNode ?? table.refs.tableContainerRef.current;
    if (!node) return;
    const update = () => {
      const computed = getComputedStyle(node);
      const border =
        Number.parseFloat(computed.borderLeftWidth) +
        Number.parseFloat(computed.borderRightWidth);
      const scrollbar = Math.max(0, node.offsetWidth - node.clientWidth - border);
      setBandScrollbar((current) => (current === scrollbar ? current : scrollbar));
      if (fillBand) setBandViewport(node.clientWidth);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    const content = node.firstElementChild;
    if (content) observer.observe(content);
    return () => observer.disconnect();
  }, [bandScrollNode, fillBand, table]);

  const tableClassName = clsx(
    'mrt-table',
    classes.root,
    hasBandFormat && classes['root-band'],
    layoutMode?.startsWith('grid') && classes['root-grid'],
    tableProps.className,
  );
  const bandSizeVars: Record<string, number> = {};
  if (hasBandFormat) {
    const widthById = new Map(
      bandSizedColumns.map((column) => [column.column.id, column.width]),
    );
    for (const header of getFlatHeaders()) {
      const width = widthById.get(header.column.id);
      if (width == null) continue;
      bandSizeVars[`--header-${parseCSSVarId(header.id)}-size`] = width;
      bandSizeVars[`--col-${parseCSSVarId(header.column.id)}-size`] = width;
    }
  }
  const tableVars = {
    ...columnSizeVars,
    ...bandSizeVars,
    '--mrt-band-table-width': hasBandFormat ? `${bandTableWidth}` : undefined,
    '--mrt-striped-row-background-color': stripedColor,
    '--mrt-striped-row-hover-background-color': stripedColor
      ? colorScheme === 'dark'
        ? lighten(stripedColor, 0.08)
        : darken(stripedColor, 0.12)
      : undefined,
    ...tableProps.__vars,
  };
  const renderColGroup = () =>
    hasBandFormat ? (
      <colgroup>
        {bandSizedColumns.map(({ column, width }) => (
          <col key={column.id} style={{ width }} />
        ))}
      </colgroup>
    ) : null;
  const body = (
    <>
      {memoMode === 'table-body' || columnSizingInfo.isResizingColumn ? (
        <Memo_MRT_TableBody
          {...commonTableGroupProps}
          tableProps={tableProps}
        />
      ) : (
        <MRT_TableBody {...commonTableGroupProps} tableProps={tableProps} />
      )}
      {enableTableFooter && <MRT_TableFooter {...commonTableGroupProps} />}
    </>
  );

  if (fixedBandHead) {
    return (
      <>
        <div
          className={classes['band-head-clip']}
          ref={headClipRef}
          style={{ paddingRight: bandScrollbar }}
        >
          <Table
            {...tableProps}
            __vars={tableVars}
            className={clsx(tableClassName, classes['band-head-table'])}
            style={{ ...tableProps.style, ...bandTableStyle }}
          >
            {renderColGroup()}
            {enableTableHead && <MRT_TableHead {...commonTableGroupProps} />}
          </Table>
        </div>
        <div
          className={classes['band-body-scroll']}
          onScroll={(event: UIEvent<HTMLDivElement>) => {
            if (headClipRef.current) {
              headClipRef.current.scrollLeft = event.currentTarget.scrollLeft;
            }
          }}
          ref={(node: HTMLDivElement | null) => {
            if (node) table.refs.tableContainerRef.current = node;
            setBandScrollNode(node);
          }}
        >
          <Table
            {...tableProps}
            __vars={tableVars}
            className={clsx(tableClassName, classes['band-body-table'])}
            style={{ ...tableProps.style, ...bandTableStyle }}
          >
            {renderColGroup()}
            {body}
          </Table>
        </div>
      </>
    );
  }

  return (
    <Table
      {...tableProps}
      __vars={tableVars}
      className={tableClassName}
      style={{ ...tableProps.style, ...bandTableStyle }}
    >
      {renderColGroup()}
      {enableTableHead && <MRT_TableHead {...commonTableGroupProps} />}
      {body}
    </Table>
  );
};

import clsx from 'clsx';

import classes from './MRT_Table.module.css';

import { useMemo, useRef, type UIEvent } from 'react';

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

  const tableClassName = clsx(
    'mrt-table',
    classes.root,
    hasBandFormat && classes['root-band'],
    layoutMode?.startsWith('grid') && classes['root-grid'],
    tableProps.className,
  );
  const tableVars = {
    ...columnSizeVars,
    '--mrt-band-table-width': hasBandFormat
      ? `${table.getTotalSize()}`
      : undefined,
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
        {table.getVisibleLeafColumns().map((column) => {
          const columnType = (
            column.columnDef as { columnDefType?: string }
          ).columnDefType;
          const lockedSize = bandLockedColumnSize(column.id, column.getSize());
          const fixed =
            columnType === 'display'
              ? lockedSize || column.getSize()
              : column.getSize();
          return (
            <col
              key={column.id}
              style={fixed == null ? undefined : { width: fixed }}
            />
          );
        })}
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
        <div className={classes['band-head-clip']} ref={headClipRef}>
          <Table
            {...tableProps}
            __vars={tableVars}
            className={clsx(tableClassName, classes['band-head-table'])}
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
          }}
        >
          <Table
            {...tableProps}
            __vars={tableVars}
            className={clsx(tableClassName, classes['band-body-table'])}
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
    >
      {renderColGroup()}
      {enableTableHead && <MRT_TableHead {...commonTableGroupProps} />}
      {body}
    </Table>
  );
};

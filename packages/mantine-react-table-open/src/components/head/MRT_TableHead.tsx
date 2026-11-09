import clsx from 'clsx';

import classes from './MRT_TableHead.module.css';

import {
  TableTh,
  TableThead,
  type TableTheadProps,
  TableTr,
} from '@mantine/core';

import { MRT_TableHeadCell } from './MRT_TableHeadCell';
import { MRT_TableHeadRow } from './MRT_TableHeadRow';

import {
  type MRT_BandCell,
  type MRT_ColumnVirtualizer,
  type MRT_Header,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import {
  bandLockedColumnSize,
  groupBandCells,
  handleBandCellMouseDown,
  splitLeafColumns,
} from '../../utils/bandFormat.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { MRT_ToolbarAlertBanner } from '../toolbar/MRT_ToolbarAlertBanner';

interface Props<TData extends MRT_RowData> extends TableTheadProps {
  columnVirtualizer?: MRT_ColumnVirtualizer;
  table: MRT_TableInstance<TData>;
}

export const MRT_TableHead = <TData extends MRT_RowData>({
  columnVirtualizer,
  table,
  ...rest
}: Props<TData>) => {
  'use no memo';
  const {
    getHeaderGroups,
    getSelectedRowModel,
    getState,
    options: {
      enableStickyHeader,
      headFormat,
      layoutMode,
      mantineTableHeadProps,
      positionToolbarAlertBanner,
    },
    refs: { tableHeadRef },
  } = table;
  const { isFullScreen, showAlertBanner } = getState();

  const tableHeadProps = {
    ...parseFromValuesOrFunc(mantineTableHeadProps, {
      table,
    }),
    ...rest,
  };

  const stickyHeader = enableStickyHeader || isFullScreen;
  const showAlertOverlay =
    positionToolbarAlertBanner === 'head-overlay' &&
    (showAlertBanner || getSelectedRowModel().rows.length > 0);

  const leafColumns = table.getVisibleLeafColumns();
  const { dataColumns, leading, trailing } = splitLeafColumns(leafColumns);
  const leafHeaders =
    table.getHeaderGroups()[table.getHeaderGroups().length - 1]?.headers ?? [];
  const bandRows = headFormat ? groupBandCells(headFormat) : [];

  const renderDisplayHeader = (column: (typeof leading)[number]) => {
    const header = leafHeaders.find(
      (item) => item.column.id === column.id,
    ) as MRT_Header<TData> | undefined;
    if (!header) return null;
    const fixedSize = bandLockedColumnSize(column.id, column.getSize());
    return (
      <MRT_TableHeadCell
        align={fixedSize ? 'center' : undefined}
        data-band-fixed={fixedSize ? '' : undefined}
        header={header}
        key={column.id}
        onMouseDown={handleBandCellMouseDown}
        rowSpan={headFormat?.rows}
        style={
          fixedSize
            ? {
                maxWidth: fixedSize,
                minWidth: fixedSize,
                width: fixedSize,
              }
            : undefined
        }
        tabIndex={-1}
        table={table}
      />
    );
  };

  const renderBandHeader = (cell: MRT_BandCell<TData>) => {
    const colspan = cell.colspan ?? 1;
    const column = colspan === 1 ? dataColumns[cell.col] : undefined;
    const header = column
      ? (leafHeaders.find((item) => item.column.id === column.id) as
          | MRT_Header<TData>
          | undefined)
      : undefined;
    const headerText =
      cell.text ??
      (typeof column?.columnDef.header === 'string'
        ? column.columnDef.header
        : '');
    if (column && header) {
      return (
        <MRT_TableHeadCell
          className={classes['band-head-cell']}
          header={header}
          key={`${cell.row}-${cell.col}`}
          label={headerText}
          rowSpan={cell.rowspan ?? 1}
          table={table}
        />
      );
    }
    return (
      <TableTh
        className={classes['band-cell']}
        colSpan={colspan}
        key={`${cell.row}-${cell.col}`}
        onMouseDown={handleBandCellMouseDown}
        rowSpan={cell.rowspan ?? 1}
      >
        {headerText}
      </TableTh>
    );
  };

  return (
    <TableThead
      {...tableHeadProps}
      className={clsx(
        classes.root,
        layoutMode?.startsWith('grid')
          ? classes['root-grid']
          : classes['root-table-row-group'],
        stickyHeader && !headFormat && classes['root-sticky'],
        tableHeadProps?.className,
      )}
      pos={
        stickyHeader && layoutMode?.startsWith('grid') && !headFormat
          ? 'sticky'
          : 'relative'
      }
      ref={(ref: HTMLTableSectionElement) => {
        tableHeadRef.current = ref;
        if (tableHeadProps?.ref) {
          // @ts-ignore
          tableHeadProps.ref.current = ref;
        }
      }}
    >
      {showAlertOverlay ? (
        <TableTr
          className={clsx(
            classes['banner-tr'],
            layoutMode?.startsWith('grid') && classes.grid,
          )}
        >
          <TableTh
            className={clsx(
              classes['banner-th'],
              layoutMode?.startsWith('grid') && classes.grid,
            )}
            colSpan={table.getVisibleLeafColumns().length}
          >
            <MRT_ToolbarAlertBanner table={table} />
          </TableTh>
        </TableTr>
      ) : headFormat ? (
        bandRows.map((cells, bandRowIndex) => (
          <TableTr key={`head-band-${bandRowIndex}`}>
            {bandRowIndex === 0
              ? leading.map((column) => renderDisplayHeader(column))
              : null}
            {cells.map((cell) => renderBandHeader(cell))}
            {bandRowIndex === 0
              ? trailing.map((column) => renderDisplayHeader(column))
              : null}
          </TableTr>
        ))
      ) : (
        getHeaderGroups().map((headerGroup) => (
          <MRT_TableHeadRow
            columnVirtualizer={columnVirtualizer}
            headerGroup={headerGroup as any}
            key={headerGroup.id}
            table={table}
          />
        ))
      )}
    </TableThead>
  );
};
